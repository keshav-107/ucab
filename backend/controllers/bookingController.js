const Booking = require('../models/MyBookingSchema');
const Car = require('../models/CarSchema');

// Book a cab (user)
const bookCab = async (req, res) => {
    try {
        const { carId, pickup, drop, bookingDate, distance } = req.body;
        if (!carId || !pickup || !drop || !bookingDate) {
            return res.status(400).json({ message: 'carId, pickup, drop, and bookingDate are required' });
        }
        const car = await Car.findById(carId);
        if (!car) return res.status(404).json({ message: 'Car not found' });
        if (!car.isAvailable) return res.status(400).json({ message: 'This cab is currently unavailable' });

        const dist = distance || 10;
        const fare = parseFloat((dist * car.pricePerKm).toFixed(2));

        const booking = await Booking.create({
            userId: req.user.id,
            carId,
            pickup,
            drop,
            bookingDate,
            fare,
            distance: dist,
            status: 'Pending',
        });

        const populatedBooking = await Booking.findById(booking._id).populate('carId', 'carName carModel carType image pricePerKm');
        res.status(201).json({ message: 'Cab booked successfully', booking: populatedBooking });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get bookings for logged-in user
const getUserBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user.id })
            .populate('carId', 'carName carModel carType image pricePerKm')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all bookings (admin)
const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('userId', 'name email phone')
            .populate('carId', 'carName carModel carType image')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update booking status (admin)
const updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).populate('carId', 'carName carModel');
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        res.json({ message: 'Booking status updated', booking });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Cancel booking (user)
const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        if (booking.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to cancel this booking' });
        }
        if (booking.status === 'Completed') {
            return res.status(400).json({ message: 'Cannot cancel a completed booking' });
        }
        booking.status = 'Cancelled';
        await booking.save();
        res.json({ message: 'Booking cancelled successfully', booking });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { bookCab, getUserBookings, getAllBookings, updateBookingStatus, cancelBooking };
