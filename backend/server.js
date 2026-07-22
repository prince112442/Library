require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xssClean = require("xss-clean");

const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorHandler");

// Route imports
const authRoutes = require("./routes/authRoutes");
const bookRoutes = require("./routes/bookRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const userRoutes = require("./routes/userRoutes");
const borrowRoutes = require("./routes/borrowRoutes");
const reservationRoutes = require("./routes/reservationRoutes");
const fineRoutes = require("./routes/fineRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const reportRoutes = require("./routes/reportRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const settingsRoutes = require("./routes/settingsRoutes");

// Connect Database
connectDB();

const app = express();

// ======================================
// SECURITY
// ======================================

app.use(helmet());

// ======================================
// CORS CONFIGURATION
// ======================================

// FIX: removed the stale Netlify deploy-preview URL (it had a random hash
// prefix that changes on every deploy, so it always went stale). Using the
// permanent production domain instead. A regex fallback is also included so
// Netlify *deploy preview* URLs (which look like
// https://<hash>--lms20.netlify.app) keep working automatically too.
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://lms20.netlify.app",
];

const netlifyPreviewPattern = /^https:\/\/[a-z0-9-]+--lms20\.netlify\.app$/;

const corsOptions = {
  origin: (origin, callback) => {
    // Allow Postman, mobile apps, curl
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin) || netlifyPreviewPattern.test(origin)) {
      return callback(null, true);
    }

    console.log("Blocked by CORS:", origin);

    return callback(new Error(`Origin not allowed: ${origin}`));
  },

  credentials: true,

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
  ],
};

app.use(cors(corsOptions));

// Handle OPTIONS requests
app.options("*", cors(corsOptions));

// ======================================
// BODY PARSER
// ======================================

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ======================================
// SANITIZATION
// ======================================

app.use(mongoSanitize());
app.use(xssClean());

// ======================================
// LOGGING
// ======================================

if (process.env.NODE_ENV !== "test") {
  app.use(
    morgan(
      process.env.NODE_ENV === "development"
        ? "dev"
        : "combined"
    )
  );
}

// ======================================
// RATE LIMITING
// ======================================

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests",
  },
});

app.use("/api", apiLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: "Too many login attempts. Please try again later.",
  },
});

app.use("/api/auth/login", authLimiter);

// ======================================
// TEST ROUTES
// ======================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Library API is running",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "API is healthy",
  });
});

// ======================================
// API ROUTES
// ======================================

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

// ======================================
// ERROR HANDLING
// ======================================

app.use(notFound);
app.use(errorHandler);

// ======================================
// START SERVER
// ======================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
