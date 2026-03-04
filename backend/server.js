const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./db/config');

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/cars', require('./routes/carRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));

// Health check
app.get('/', (req, res) => {
    res.json({ message: '🚖 Ucab API is running!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error', error: err.message });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`🚀 Ucab server running on port ${PORT}`);
});
