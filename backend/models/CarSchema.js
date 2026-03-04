const mongoose = require('mongoose');

const CarSchema = new mongoose.Schema(
    {
        carName: {
            type: String,
            required: [true, 'Car name is required'],
            trim: true,
        },
        carModel: {
            type: String,
            required: [true, 'Car model is required'],
            trim: true,
        },
        carType: {
            type: String,
            enum: ['Mini', 'Sedan', 'SUV', 'Premium'],
            default: 'Sedan',
        },
        seats: {
            type: Number,
            required: true,
            min: 2,
            max: 8,
        },
        pricePerKm: {
            type: Number,
            required: [true, 'Price per km is required'],
            min: 1,
        },
        image: {
            type: String,
            default: '',
        },
        isAvailable: {
            type: Boolean,
            default: true,
        },
        description: {
            type: String,
            trim: true,
            default: '',
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Car', CarSchema);
