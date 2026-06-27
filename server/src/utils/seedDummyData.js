require('dotenv').config();
const mongoose = require('mongoose');
const Room = require('../models/Room.model');

const seedRooms = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const existing = await Room.countDocuments();
  if (existing > 0) {
    console.log('Rooms already seeded');
    return mongoose.disconnect();
  }

  await Room.insertMany([
    { roomNumber: 'A101', capacity: 2, floor: 1, type: 'double', status: 'available' },
    { roomNumber: 'A102', capacity: 2, floor: 1, type: 'double', status: 'full' },
    { roomNumber: 'B201', capacity: 1, floor: 2, type: 'single', status: 'available' },
  ]);

  console.log('3 dummy rooms seeded');
  mongoose.disconnect();
};

seedRooms();