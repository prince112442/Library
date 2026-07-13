const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');
const ApiFeatures = require('../utils/apiFeatures');
const logAudit = require('../utils/logAudit');

// @desc    List users, optionally filtered by role (?role=librarian|student)
// @route   GET /api/users
// @access  Private/Admin (librarians may list students only - enforced below)
const getUsers = asyncHandler(async (req, res) => {
  // Librarians are only permitted to browse student accounts (e.g. to
  // register borrowers), never other librarians or admins.
  if (req.user.role === 'librarian') {
    req.query.role = 'student';
  }

  const features = new ApiFeatures(User.find(), req.query)
    .filter()
    .search(['name', 'email', 'studentId', 'employeeId'])
    .sort()
    .limitFields()
    .paginate();

  const [users, total] = await Promise.all([features.query, User.countDocuments()]);

  res.json({
    success: true,
    count: users.length,
    total,
    page: features.pagination.page,
    pages: Math.ceil(total / features.pagination.limit),
    data: users,
  });
});

// @route GET /api/users/:id
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  res.json({ success: true, data: user });
});

// @desc    Create a librarian or student account (admin), or a student
//          account only (librarian, e.g. registering a walk-in student)
// @route   POST /api/users
const createUser = asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (req.user.role === 'librarian' && role !== 'student') {
    throw new ApiError(403, 'Librarians can only register student accounts');
  }

  const user = await User.create(req.body);
  await logAudit({ user: req.user, action: 'CREATE_USER', entity: 'User', entityId: user._id, req, details: { role } });

  res.status(201).json({ success: true, data: user });
});

// @route PUT /api/users/:id
const updateUser = asyncHandler(async (req, res) => {
  const target = await User.findById(req.params.id);
  if (!target) throw new ApiError(404, 'User not found');

  if (req.user.role === 'librarian' && target.role !== 'student') {
    throw new ApiError(403, 'Librarians can only update student accounts');
  }

  // Role changes and password changes go through dedicated, more careful
  // flows; block them here to avoid accidental privilege escalation.
  delete req.body.password;
  if (req.user.role === 'librarian') delete req.body.role;

  Object.assign(target, req.body);
  await target.save();

  await logAudit({ user: req.user, action: 'UPDATE_USER', entity: 'User', entityId: target._id, req });
  res.json({ success: true, data: target });
});

// @desc    Activate/deactivate a user account instead of hard-deleting,
//          preserving their historical borrow/fine records.
// @route   PATCH /api/users/:id/status
// @access  Private/Admin
const setUserStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true });
  if (!user) throw new ApiError(404, 'User not found');

  await logAudit({ user: req.user, action: isActive ? 'ACTIVATE_USER' : 'DEACTIVATE_USER', entity: 'User', entityId: user._id, req });
  res.json({ success: true, data: user });
});

// @route DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');

  await logAudit({ user: req.user, action: 'DELETE_USER', entity: 'User', entityId: req.params.id, req });
  res.json({ success: true, message: 'User deleted' });
});

module.exports = { getUsers, getUser, createUser, updateUser, setUserStatus, deleteUser };
