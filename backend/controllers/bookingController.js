const Booking = require('../models/MyBookingSchema');
const Car = require('../models/CarSchema');

/* ──────────────────────────────────────────
   Helper: convert "HH:MM" → total minutes
────────────────────────────────────────── */
const toMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
};

/* ──────────────────────────────────────────
   Helper: add N minutes to "HH:MM" → "HH:MM"
────────────────────────────────────────── */
const addMinutes = (timeStr, mins) => {
    const total = toMinutes(timeStr) + Math.round(mins);
    const h = Math.floor(total / 60) % 24;
    const m = total % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

/* ──────────────────────────────────────────
   Helper: do two time slots overlap?
   Slot A: [aStart, aEnd)   Slot B: [bStart, bEnd)
────────────────────────────────────────── */
const slotsOverlap = (aStart, aEnd, bStart, bEnd) => {
    const aS = toMinutes(aStart), aE = toMinutes(aEnd);
    const bS = toMinutes(bStart), bE = toMinutes(bEnd);
    return aS < bE && bS < aE;
};

/* ──────────────────────────────────────────
   Book a cab (User)
────────────────────────────────────────── */
const bookCab = async (req, res) => {
    try {
        const { carId, pickup, drop, bookingDate, pickupTime, distance } = req.body;
        if (!carId || !pickup || !drop || !bookingDate || !pickupTime) {
            return res.status(400).json({ message: 'carId, pickup, drop, bookingDate, and pickupTime are required' });
        }

        const car = await Car.findById(carId);
        if (!car) return res.status(404).json({ message: 'Car not found' });
        if (!car.isAvailable) return res.status(400).json({ message: 'This cab is currently unavailable' });

        const dist = parseFloat(distance) || 10;
        const fare = parseFloat((dist * car.pricePerKm).toFixed(2));
        // Estimated duration: dist / 40 km·h⁻¹ × 60 = minutes, minimum 15 min
        const estimatedDuration = Math.max(15, Math.round((dist / 40) * 60));

        // ── SLOT CONFLICT CHECK: block customer from booking a taken slot ──
        const requestedSlotStart = pickupTime;
        const requestedSlotEnd = addMinutes(pickupTime, estimatedDuration + 30);

        const confirmedBookings = await Booking.find({
            carId,
            bookingDate,
            status: 'Confirmed',
            slotEndTime: { $ne: null },
        });

        const hasConflict = confirmedBookings.some((b) =>
            slotsOverlap(requestedSlotStart, requestedSlotEnd, b.pickupTime, b.slotEndTime)
        );

        if (hasConflict) {
            return res.status(409).json({
                message: `⚠️ This cab is already booked on ${bookingDate} between ${requestedSlotStart} and ${requestedSlotEnd}. Please choose a different time or another cab.`,
            });
        }
        // ── END CONFLICT CHECK ──

        const booking = await Booking.create({
            userId: req.user.id,
            carId,
            pickup,
            drop,
            bookingDate,
            pickupTime,
            fare,
            distance: dist,
            estimatedDuration,
            status: 'Pending',
        });

        const populated = await Booking.findById(booking._id)
            .populate('carId', 'carName carModel carType carno image pricePerKm');
        res.status(201).json({ message: 'Cab booked successfully', booking: populated });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};




/* ──────────────────────────────────────────
   Get bookings for logged-in user
────────────────────────────────────────── */
const getUserBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user.id })
            .populate('carId', 'carName carModel carType carno image pricePerKm')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/* ──────────────────────────────────────────
   Get all bookings (Admin)
────────────────────────────────────────── */
const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('userId', 'name email phone')
            .populate('carId', 'carName carModel carType carno image')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/* ──────────────────────────────────────────
   Update booking status (Admin)
   — When confirming: check slot conflicts first
────────────────────────────────────────── */
const updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        // ── SLOT CONFLICT CHECK when admin tries to Confirm ──
        if (status === 'Confirmed') {
            // Compute the slot this booking would occupy:
            // start = pickupTime, end = pickupTime + estimatedDuration + 30 min buffer
            const slotStart = booking.pickupTime;
            const slotEnd = addMinutes(slotStart, booking.estimatedDuration + 30);

            // Find other Confirmed bookings for the same car on the same date
            const conflicts = await Booking.find({
                _id: { $ne: booking._id },
                carId: booking.carId,
                bookingDate: booking.bookingDate,
                status: 'Confirmed',
                slotEndTime: { $ne: null },
            });

            const hasConflict = conflicts.some((b) =>
                slotsOverlap(slotStart, slotEnd, b.pickupTime, b.slotEndTime)
            );

            if (hasConflict) {
                return res.status(409).json({
                    message: `⚠️ Slot conflict! This car is already confirmed for another booking that overlaps with ${slotStart}–${slotEnd} on ${booking.bookingDate}. Choose a different car or time.`,
                });
            }

            // No conflict — lock the slot
            booking.slotEndTime = slotEnd;
        }

        booking.status = status;
        await booking.save();

        const populated = await Booking.findById(booking._id)
            .populate('carId', 'carName carModel carno');
        res.json({ message: 'Booking status updated', booking: populated });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/* ──────────────────────────────────────────
   Cancel booking (User)
────────────────────────────────────────── */
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
        booking.slotEndTime = null;
        await booking.save();
        res.json({ message: 'Booking cancelled successfully', booking });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { bookCab, getUserBookings, getAllBookings, updateBookingStatus, cancelBooking };
