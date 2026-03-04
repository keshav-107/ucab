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
            default: 10, // default distance in km
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Booking', MyBookingSchema);
