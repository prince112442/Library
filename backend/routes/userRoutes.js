const express = require('express');
const { body } = require('express-validator');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  setUserStatus,
  deleteUser,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect);
router.use(authorize('admin', 'librarian')); // students never manage other users

router
  .route('/')
  .get(getUsers)
  .post(
    [
      body('name').trim().notEmpty().withMessage('Name is required'),
      body('email').isEmail().withMessage('A valid email is required'),
      body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
      body('role').isIn(['admin', 'librarian', 'student']).withMessage('Invalid role'),
    ],
    validate,
    createUser
  );

router.route('/:id').get(getUser).put(updateUser).delete(authorize('admin'), deleteUser);

router.patch('/:id/status', authorize('admin'), setUserStatus);

module.exports = router;
