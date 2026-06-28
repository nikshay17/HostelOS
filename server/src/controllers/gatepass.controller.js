const GatePass = require('../models/GatePass.model');
const generateQR = require('../utils/qrGenerator');

// Student requests a gate pass
exports.createGatePass = async (req, res) => {
  try {
    const { reason, expectedReturnTime } = req.body;
    const studentId = req.user.id;

    if (!reason || !expectedReturnTime) {
      return res.status(400).json({ message: 'reason and expectedReturnTime are required' });
    }

    // Block duplicate active gate passes
    const existingActive = await GatePass.findOne({
      student: studentId,
      status: { $in: ['pending', 'approved'] }
    });
    if (existingActive) {
      return res.status(400).json({ message: 'You already have an active or pending gate pass' });
    }

    const gatePass = await GatePass.create({
      student: studentId,
      reason,
      expectedReturnTime,
      status: 'pending'
    });

    res.status(201).json(gatePass);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Student views their own gate passes
exports.getMyGatePasses = async (req, res) => {
  try {
    const passes = await GatePass.find({ student: req.user.id }).sort({ createdAt: -1 });
    res.json(passes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Warden/Admin: view all pending gate pass requests
exports.getPendingGatePasses = async (req, res) => {
  try {
    const passes = await GatePass.find({ status: 'pending' })
      .populate('student', 'name email studentId roomNumber')
      .sort({ createdAt: 1 });
    res.json(passes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Warden/Admin: approve a gate pass — generates QR code on approval
exports.approveGatePass = async (req, res) => {
  try {
    const gatePass = await GatePass.findById(req.params.id);
    if (!gatePass) return res.status(404).json({ message: 'Gate pass not found' });
    if (gatePass.status !== 'pending') {
      return res.status(400).json({ message: 'Gate pass already processed' });
    }

    gatePass.status = 'approved';
    gatePass.outTime = new Date();
    gatePass.approvedBy = req.user.id;
    gatePass.qrCode = await generateQR(gatePass._id.toString());
    await gatePass.save();

    res.json(gatePass);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Warden/Admin: reject a gate pass
exports.rejectGatePass = async (req, res) => {
  try {
    const gatePass = await GatePass.findById(req.params.id);
    if (!gatePass) return res.status(404).json({ message: 'Gate pass not found' });
    if (gatePass.status !== 'pending') {
      return res.status(400).json({ message: 'Gate pass already processed' });
    }
    gatePass.status = 'rejected';
    gatePass.approvedBy = req.user.id;
    await gatePass.save();
    res.json(gatePass);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Warden/Admin: scan/verify a QR code at the gate — marks the pass as completed
exports.verifyGatePass = async (req, res) => {
  try {
    const { gatePassId } = req.body;
    if (!gatePassId) return res.status(400).json({ message: 'gatePassId is required' });

    const gatePass = await GatePass.findById(gatePassId).populate('student', 'name studentId roomNumber');
    if (!gatePass) return res.status(404).json({ message: 'Gate pass not found' });

    if (gatePass.status !== 'approved') {
      return res.status(400).json({ message: `Cannot verify a gate pass with status "${gatePass.status}"` });
    }

    gatePass.status = 'completed';
    gatePass.actualReturnTime = new Date();
    await gatePass.save();

    res.json({ message: 'Student return verified', gatePass });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};