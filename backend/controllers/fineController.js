const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Fine = require('../models/Fine');
const logAudit = require('../utils/logAudit');

// @route GET /api/fines
const getFines = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role === 'student') filter.student = req.user._id;
  if (req.query.status) filter.status = req.query.status;

  const fines = await Fine.find(filter)
    .populate('student', 'name email studentId')
    .populate({ path: 'borrowRecord', populate: { path: 'book', select: 'title' } })
    .sort('-createdAt');

  res.json({ success: true, count: fines.length, data: fines });
});

// @desc    Mark a fine as paid (librarian collects payment in person/manually)
// @route   PATCH /api/fines/:id/pay
// @access  Private/Librarian,Admin
const payFine = asyncHandler(async (req, res) => {
  const fine = await Fine.findById(req.params.id);
  if (!fine) throw new ApiError(404, 'Fine not found');
  if (fine.status === 'paid') throw new ApiError(400, 'Fine is already paid');

  fine.status = 'paid';
  fine.paidDate = new Date();
  await fine.save();

  await logAudit({ user: req.user, action: 'PAY_FINE', entity: 'Fine', entityId: fine._id, req });
  res.json({ success: true, data: fine });
});

// @desc    Waive a fine (admin discretion)
// @route   PATCH /api/fines/:id/waive
// @access  Private/Admin
const waiveFine = asyncHandler(async (req, res) => {
  const fine = await Fine.findById(req.params.id);
  if (!fine) throw new ApiError(404, 'Fine not found');
  if (fine.status !== 'unpaid') throw new ApiError(400, 'Only unpaid fines can be waived');

  fine.status = 'waived';
  fine.waivedBy = req.user._id;
  await fine.save();

  await logAudit({ user: req.user, action: 'WAIVE_FINE', entity: 'Fine', entityId: fine._id, req });
  res.json({ success: true, data: fine });
});

module.exports = { getFines, payFine, waiveFine };
