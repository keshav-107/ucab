const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: {
        type: String,
        default: 'admin',
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
});

const Admin = mongoose.model('Admin', AdminSchema);

module.exports = Admin;
