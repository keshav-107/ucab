const mongoose = require('mongoose');

const MyBookingSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        carId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Car',
            required: true,
        },
        pickup: {
            type: String,
            required: [true, 'Pickup location is required'],
            trim: true,
        },
        drop: {
            type: String,
            required: [true, 'Drop location is required'],
            trim: true,
        },
        bookingDate: {
            type: String,
            required: [true, 'Booking date is required'],
        },
        // Time the customer wants pickup (HH:MM format)
        pickupTime: {
            type: String,
            required: [true, 'Pickup time is required'],
        },
        status: {
            type: String,
            enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
            default: 'Pending',
        },
        fare: {
            type: Number,
            default: 0,
        },
        distance: {
            type: Number,
            default: 10,
        },
        // Estimated ride duration in minutes (distance / 40 km/h avg)
        estimatedDuration: {
            type: Number,
            default: 30,
        },
        // Slot the car is blocked for (set when admin Confirms the booking)
        // Format: "HH:MM" – computed as pickupTime + estimatedDuration + 30 min buffer
        slotEndTime: {
            type: String,
            default: null,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Booking', MyBookingSchema);
