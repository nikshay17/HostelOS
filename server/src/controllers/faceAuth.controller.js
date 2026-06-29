const axios = require('axios');
const User = require('../models/User.model');
const Attendance = require('../models/Attendance.model');

const FLASK_URL = process.env.FLASK_SERVICE_URL || 'http://localhost:5001';

// Student enrolls their face (one-time setup)
exports.enrollFace = async (req, res) => {
  try {
    const { image } = req.body;
    const studentId = req.user.id;

    if (!image) return res.status(400).json({ message: 'image is required' });

    const flaskRes = await axios.post(`${FLASK_URL}/enroll`, { studentId, image });

    await User.findByIdAndUpdate(studentId, { faceEncoded: true });

    res.status(201).json({ message: flaskRes.data.message });
  } catch (err) {
    if (err.response) {
      // Flask returned a known error (e.g. no face detected)
      return res.status(err.response.status).json({ message: err.response.data.error });
    }
    res.status(500).json({ message: 'Face enrollment service unavailable' });
  }
};

// Verify face — used during attendance check-in
exports.verifyFace = async (req, res) => {
  try {
    const { image } = req.body;
    const studentId = req.user.id;

    if (!image) return res.status(400).json({ message: 'image is required' });

    const user = await User.findById(studentId);
    if (!user.faceEncoded) {
      return res.status(400).json({ message: 'You have not enrolled your face yet' });
    }

    const flaskRes = await axios.post(`${FLASK_URL}/verify`, { studentId, image });
    const { match, distance } = flaskRes.data;

    if (!match) {
      return res.status(400).json({ message: 'Face verification failed', distance });
    }

    res.json({ message: 'Face verified successfully', distance });
  } catch (err) {
    if (err.response) {
      return res.status(err.response.status).json({ message: err.response.data.error });
    }
    res.status(500).json({ message: 'Face verification service unavailable' });
  }
};

// Check whether the current student has already enrolled
exports.getEnrollmentStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('faceEncoded');
    res.json({ faceEncoded: user.faceEncoded });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};