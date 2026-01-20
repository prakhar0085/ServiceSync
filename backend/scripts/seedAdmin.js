const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to DB');
    
    const adminEmail = 'admin@servicesync.com';
    const existing = await User.findOne({ email: adminEmail });
    if(existing) {
        console.log('Admin already exists');
        process.exit(0);
    }

    const admin = new User({
        name: 'System Admin',
        email: adminEmail,
        password: 'admin123', // Will be hashed by pre-save hook
        role: 'admin'
    });

    await admin.save();
    console.log('Admin created: admin@servicesync.com / admin123');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
