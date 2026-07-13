const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const generateToken = require('../utils/generateToken');
const logAudit = require('../utils/logAudit');
const User = require('../models/User');

// @desc    Register a new user (students self-register; admin/librarian
//          accounts are typically created by an admin via userController)
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, studentId, department, yearLevel, phone } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(400, 'An account with this email already exists');

  // Public self-registration is restricted to students; admin/librarian
  // creation is handled separately by an existing admin.
  const user = await User.create({
    name,
    email,
    password,
    role: 'student',
    studentId,
    department,
    yearLevel,
    phone,
  });

  await logAudit({ user, action: 'REGISTER', entity: 'User', entityId: user._id, req });

  res.status(201).json({
    success: true,
    data: {
      user,
      token: generateToken(user._id, user.role),
    },
  });
});

// @desc    Login and receive a JWT
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }
  if (!user.isActive) {
    throw new ApiError(403, 'This account has been deactivated. Contact the administrator.');
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  res.json({
    success: true,
    data: {
      user,
      token: generateToken(user._id, user.role),
    },
  });
});

// @desc    Get the logged-in user's own profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user });
});

// @desc    Update own profile (name, phone, avatar, password)
// @route   PUT /api/auth/me
// @access  Private
const updateMe = asyncHandler(async (req, res) => {
  const { name, phone, avatar, password } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (avatar) user.avatar = avatar;
  if (password) user.password = password; // pre-save hook rehashes

  await user.save();
  res.json({ success: true, data: user });
});

module.exports = { register, login, getMe, updateMe };
