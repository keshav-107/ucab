const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const Admin = require('./models/AdminSchema');
const connectDB = require('./db/config');

dotenv.config();

const seedAdmin = async () => {
    try {
        await connectDB();

        const adminEmail = process.env.ADMIN_EMAIL || 'admin@ucab.app';
        const adminPassword = process.env.ADMIN_PASSWORD || 'ucab_admin_secure123';

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email: adminEmail });
        if (existingAdmin) {
            console.log('✅ Admin account already exists. You can log in with:');
            console.log(`📧 Email: ${adminEmail}`);
            process.exit(0);
        }

        console.log('⏳ Creating default admin account...');

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        // Create admin
        await Admin.create({
            name: 'Super Admin',
            email: adminEmail,
            password: hashedPassword,
            role: 'admin'
        });

        console.log('🎉 Default admin created successfully!');
        console.log('👉 You can now log in at /admin/login with:');
        console.log(`📧 Email:    ${adminEmail}`);
        console.log(`🔑 Password: ${adminPassword}`);
        console.log('\n⚠️  IMPORTANT: Change the password after your first login (or set ADMIN_PASSWORD in .env)');

        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to seed admin:', error);
        process.exit(1);
    }
};

seedAdmin();
