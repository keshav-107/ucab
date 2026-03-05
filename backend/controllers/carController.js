const Car = require('../models/CarSchema');

// Add a new car (admin)
const addCar = async (req, res) => {
    try {
        const { carName, carModel, carType, seats, pricePerKm, description, carno } = req.body;
        if (!carName || !carModel || !seats || !pricePerKm) {
            return res.status(400).json({ message: 'carName, carModel, seats, and pricePerKm are required' });
        }
        const image = req.file ? `/uploads/${req.file.filename}` : '';
        const car = await Car.create({ carName, carModel, carType, seats, pricePerKm, description, carno, image });
        res.status(201).json({ message: 'Car added successfully', car });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all cars
const getAllCars = async (req, res) => {
    try {
        const cars = await Car.find().sort({ createdAt: -1 });
        res.json(cars);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get single car
const getCarById = async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);
        if (!car) return res.status(404).json({ message: 'Car not found' });
        res.json(car);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update car (admin)
const updateCar = async (req, res) => {
    try {
        const { carName, carModel, carType, seats, pricePerKm, description, isAvailable, carno } = req.body;
        const updateData = { carName, carModel, carType, seats, pricePerKm, description, isAvailable, carno };
        if (req.file) {
            updateData.image = `/uploads/${req.file.filename}`;
        }
        const car = await Car.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
        if (!car) return res.status(404).json({ message: 'Car not found' });
        res.json({ message: 'Car updated successfully', car });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete car (admin)
const deleteCar = async (req, res) => {
    try {
        const car = await Car.findByIdAndDelete(req.params.id);
        if (!car) return res.status(404).json({ message: 'Car not found' });
        res.json({ message: 'Car deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { addCar, getAllCars, getCarById, updateCar, deleteCar };
