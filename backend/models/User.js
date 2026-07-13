const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * Single User collection shared by Admins, Librarians and Students.
 * Using one collection with a `role` discriminator field (rather than three
 * separate collections) keeps auth logic simple while `roleProfile` holds
 * fields that only apply to a given role (e.g. studentId, department).
 * This is a deliberate simplification from the original spec's separate
 * Student/Librarian collections, chosen for maintainability in a
 * final-year-project scope. It can be split later if needed.
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false, // never returned by default
    },
    role: {
      type: String,
      enum: ['admin', 'librarian', 'student'],
      required: true,
      default: 'student',
    },
    phone: { type: String, trim: true },
    avatar: { type: String, default: '' },
    isActive: { type: Boolean, default: true },

    // Student-only fields
    studentId: { type: String, trim: true, sparse: true, unique: true },
    department: { type: String, trim: true },
    yearLevel: { type: String, trim: true },

    // Librarian-only fields
    employeeId: { type: String, trim: true, sparse: true, unique: true },

    lastLogin: { type: Date },
  },
  { timestamps: true }
);

// Hash password before saving, only if it was modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method to compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Hide password/version key when converting to JSON
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
