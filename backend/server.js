require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const userRoutes = require('./routes/userRoutes');
const borrowRoutes = require('./routes/borrowRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const fineRoutes = require('./routes/fineRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const reportRoutes = require('./routes/reportRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const settingsRoutes = require('./routes/settingsRoutes');


connectDB();

const app = express();


// ================================
// SECURITY MIDDLEWARE
// ================================

app.use(helmet());


// ================================
// FIXED CORS CONFIGURATION
// ================================

const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://library-a9mwvftuq-prince112442s-projects.vercel.app"
];


app.use(
    cors({
        origin: function(origin, callback){

            // Allow Postman/mobile requests
            if(!origin){
                return callback(null, true);
            }


            if(allowedOrigins.includes(origin)){
                return callback(null, true);
            }


            return callback(
                new Error("CORS blocked: Origin not allowed")
            );
        },

        credentials: true,

        methods:[
            "GET",
            "POST",
            "PUT",
            "DELETE",
            "PATCH",
            "OPTIONS"
        ],

        allowedHeaders:[
            "Content-Type",
            "Authorization"
        ]
    })
);


// Handle preflight requests
app.options("*", cors());


// ================================
// BODY PARSER
// ================================

app.use(express.json({
    limit:"10mb"
}));

app.use(express.urlencoded({
    extended:true
}));


// ================================
// SECURITY CLEANERS
// ================================

app.use(mongoSanitize());

app.use(xssClean());


// ================================
// LOGGING
// ================================

if(process.env.NODE_ENV !== "test"){

    app.use(
        morgan(
            process.env.NODE_ENV === "development"
            ? "dev"
            : "combined"
        )
    );
}


// ================================
// RATE LIMIT
// ================================

const apiLimiter = rateLimit({

    windowMs:15 * 60 * 1000,

    max:300,

    standardHeaders:true,

    legacyHeaders:false,

    message:{
        success:false,
        message:"Too many requests"
    }
});


app.use("/api", apiLimiter);



const authLimiter = rateLimit({

    windowMs:15 * 60 * 1000,

    max:20,

    message:{
        success:false,
        message:"Too many login attempts"
    }

});


app.use(
    "/api/auth/login",
    authLimiter
);



// ================================
// TEST ROUTE
// ================================

app.get("/",(req,res)=>{

    res.json({
        success:true,
        message:"Library API is running"
    });

});


app.get("/api/health",(req,res)=>{

    res.json({

        success:true,

        message:"API is healthy"

    });

});



// ================================
// API ROUTES
// ================================


app.use("/api/auth", authRoutes);

app.use("/api/books", bookRoutes);

app.use("/api/categories", categoryRoutes);

app.use("/api/users", userRoutes);

app.use("/api/borrow", borrowRoutes);

app.use("/api/reservations", reservationRoutes);

app.use("/api/fines", fineRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/reports", reportRoutes);

app.use("/api/notifications", notificationRoutes);

app.use("/api/settings", settingsRoutes);



// ================================
// ERROR HANDLING
// ================================

app.use(notFound);

app.use(errorHandler);



// ================================
// SERVER START
// ================================

const PORT = process.env.PORT || 5000;


app.listen(PORT,()=>{

    console.log(
        `Server running on port ${PORT}`
    );

});


module.exports = app;