const bcrypt = require('bcryptjs');
const User = require('../models/User.model');
const generateToken = require('../utils/generateToken');
const crypto = require('crypto');
const { sendOTPEmail } = require('../utils/mailer');

// PUBLIC — students only
exports.register = async (req, res) => {
  try {
    const { name, email, password, studentId, roomNumber, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const user = await User.create({
      name, email, password: hashedPassword,
      role: 'student', studentId, roomNumber, phone,
      otp, otpExpiry,
      status: 'pending' // account locked until OTP verified
    });

    await sendOTPEmail({ to: email, name, otp });

    res.status(201).json({
      message: 'Registration successful. Check your email for the verification OTP.',
      userId: user._id, // needed by the frontend to call /verify-otp
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    if (user.status === 'pending') {
      if (user.role === 'student') {
        return res.status(403).json({
          message: 'Please verify your email before signing in',
          requiresVerification: true,
          userId: user._id  // so frontend can redirect to OTP screen
        });
      }

      user.status = 'active';
      user.otp = undefined;
      user.otpExpiry = undefined;
      await user.save();
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ message: 'Your account has been suspended. Contact the warden.' });
    }

    const token = generateToken(user._id, user.role);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PROTECTED — only admin can create warden or admin accounts
exports.createStaff = async (req, res) => {
  try {
    const { name, email, password, role, employeeId, designation, department, phone } = req.body;

    if (!['warden', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Role must be warden or admin' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name, email, password: hashedPassword, role,
      employeeId, designation, department, phone,
      createdBy: req.user.id,
      status: 'active',
      otp: undefined,
      otpExpiry: undefined
    });

    const recordAudit = require('../utils/auditLog');

    await recordAudit({
      req,
      action: 'CREATE_STAFF',
      targetType: 'User',
      targetId: user._id,
      details: { role, email }
    });

    res.status(201).json({
      message: `${role} account created successfully`,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({ message: 'userId and otp are required' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.status === 'active') {
      return res.status(400).json({ message: 'Account already verified' });
    }

    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({ message: 'No OTP found. Please register again.' });
    }

    if (new Date() > user.otpExpiry) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    if (user.otp !== otp.trim()) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Activate the account and clear OTP
    user.status = 'active';
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    const token = generateToken(user._id, user.role);

    res.json({
      message: 'Email verified successfully. Welcome to HostelOS!',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.resendOTP = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.status === 'active') {
      return res.status(400).json({ message: 'Account already verified' });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    await sendOTPEmail({ to: user.email, name: user.name, otp });

    res.json({ message: 'New OTP sent to your email' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      '-password -otp -otpExpiry'
    );

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    res.json({
      user,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};