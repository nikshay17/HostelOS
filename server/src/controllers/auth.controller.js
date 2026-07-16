const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User.model');
const PendingRegistration = require('../models/PendingRegistration.model');
const generateToken = require('../utils/generateToken');
const { sendOTPEmail } = require('../utils/mailer');

// PUBLIC — students only
exports.register = async (req, res) => {
  try {
    const { name, email, password, studentId, roomNumber, phone } = req.body;
    if (!email.toLowerCase().endsWith('@pec.edu.in')) {
      return res.status(400).json({ message: 'Only college email addresses (@pec.edu.in) are allowed to register' });
    }

    // Check if a real user already exists with this email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Check if there is already a pending registration for this email
    // (e.g. user registered but didn't verify yet — overwrite it with fresh OTP)
    await PendingRegistration.deleteOne({ email });

    // Hash password now so it's ready to use after OTP verification
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store everything in the temp collection — NOT in users
    const pending = await PendingRegistration.create({
      name,
      email,
      password: hashedPassword,
      studentId,
      roomNumber: roomNumber || '',
      phone: phone || '',
      otp,
      otpExpiry,
    });

    // Send OTP email
    console.info('[auth.register] pending registration created', { pendingId: pending._id, email });
    await sendOTPEmail({ to: email, name, otp });
    console.info('[auth.register] OTP email sent', { pendingId: pending._id, email });

    res.status(201).json({
      message: 'OTP sent to your email. Please verify within 10 minutes.',
      pendingId: pending._id, // frontend uses this to call /verify-otp
    });
  } catch (err) {
    console.error('[auth.register] failed', { message: err.message, stack: err.stack });
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    // This should never happen now since we only create users after OTP
    // but kept as a safety net for any legacy 'pending' accounts
    if (user.status === 'pending') {
      return res.status(403).json({
        message: 'Please verify your email before signing in',
        requiresVerification: true,
      });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({
        message: 'Your account has been suspended. Contact the warden.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = generateToken(user._id, user.role);
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
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
      status: 'active', // staff accounts are active immediately
      createdBy: req.user.id,
    });

    const recordAudit = require('../utils/auditLog');
    await recordAudit({
      req,
      action: 'CREATE_STAFF',
      targetType: 'User',
      targetId: user._id,
      details: { role, email },
    });

    res.status(201).json({
      message: `${role} account created successfully`,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.verifyOTP = async (req, res) => {
  try {
    const { pendingId, otp } = req.body;

    if (!pendingId || !otp) {
      return res.status(400).json({ message: 'pendingId and otp are required' });
    }

    // Find the temp record
    const pending = await PendingRegistration.findById(pendingId);
    if (!pending) {
      return res.status(404).json({
        message: 'Registration session not found or expired. Please register again.'
      });
    }

    // Check expiry
    if (new Date() > pending.otpExpiry) {
      await PendingRegistration.findByIdAndDelete(pendingId);
      return res.status(400).json({
        message: 'OTP has expired. Please register again.'
      });
    }

    // Check OTP
    if (pending.otp !== otp.trim()) {
      return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
    }

    // ✅ OTP verified — now create the actual user in the database
    const user = await User.create({
      name:       pending.name,
      email:      pending.email,
      password:   pending.password, // already hashed
      role:       'student',
      studentId:  pending.studentId,
      roomNumber: pending.roomNumber,
      phone:      pending.phone,
      status:     'active', // active immediately — OTP already proved identity
    });

    // Clean up the temp record
    await PendingRegistration.findByIdAndDelete(pendingId);

    // Return token — user is now fully registered and logged in
    const token = generateToken(user._id, user.role);
    res.status(201).json({
      message: 'Email verified. Welcome to HostelOS!',
      token,
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
    });
  } catch (err) {
    // Handle duplicate studentId/email race condition
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Email or Student ID already registered.' });
    }
    res.status(500).json({ message: err.message });
  }
};

exports.resendOTP = async (req, res) => {
  try {
    const { pendingId } = req.body;

    const pending = await PendingRegistration.findById(pendingId);
    if (!pending) {
      return res.status(404).json({
        message: 'Registration session not found or expired. Please register again.'
      });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    pending.otp = otp;
    pending.otpExpiry = otpExpiry;
    await pending.save();

    console.info('[auth.resendOTP] sending OTP email', { pendingId, email: pending.email });
    await sendOTPEmail({ to: pending.email, name: pending.name, otp });
    console.info('[auth.resendOTP] OTP email sent', { pendingId, email: pending.email });

    res.json({ message: 'New OTP sent to your email' });
  } catch (err) {
    console.error('[auth.resendOTP] failed', { message: err.message, stack: err.stack });
    res.status(500).json({ message: err.message });
  }
};


exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -otp -otpExpiry');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};