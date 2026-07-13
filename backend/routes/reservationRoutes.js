const express = require('express');
const { createReservation, getReservations, cancelReservation } = require('../controllers/reservationController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/').get(getReservations).post(authorize('student'), createReservation);
router.patch('/:id/cancel', cancelReservation);

module.exports = router;
