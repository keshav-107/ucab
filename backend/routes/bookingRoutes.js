const express = require('express');
const router = express.Router();
const {
    bookCab,
    getUserBookings,
    getAllBookings,
    updateBookingStatus,
    cancelBooking,
} = require('../controllers/bookingController');
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');

router.post('/book', authMiddleware, bookCab);
router.get('/mybookings', authMiddleware, getUserBookings);
router.get('/all', adminMiddleware, getAllBookings);
router.put('/:id/status', adminMiddleware, updateBookingStatus);
router.put('/:id/cancel', authMiddleware, cancelBooking);

module.exports = router;
