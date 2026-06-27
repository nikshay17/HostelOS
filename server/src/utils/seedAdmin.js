require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User.model');

const seedAdmin = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const existing = await User.findOne({ email: 'dean@hostel.edu' });
  if (existing) {
    console.log('Admin already exists');
    return mongoose.disconnect();
  }

  const hashedPassword = await bcrypt.hash('ChangeMe123!', 10);

  await User.create({
    name: 'Dean of Student Affairs',
    email: 'dean@hostel.edu',
    password: hashedPassword,
    role: 'admin',
    employeeId: 'ADM001',
    designation: 'Dean',
  });

  console.log('First admin created: dean@hostel.edu / ChangeMe123!');
  mongoose.disconnect();
};

seedAdmin();