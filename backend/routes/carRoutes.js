const express = require('express');
const router = express.Router();
const { addCar, getAllCars, getCarById, updateCar, deleteCar } = require('../controllers/carController');
const { adminMiddleware } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/multer');

router.post('/add', adminMiddleware, upload.single('image'), addCar);
router.get('/all', getAllCars);
router.get('/:id', getCarById);
router.put('/:id', adminMiddleware, upload.single('image'), updateCar);
router.delete('/:id', adminMiddleware, deleteCar);

module.exports = router;
