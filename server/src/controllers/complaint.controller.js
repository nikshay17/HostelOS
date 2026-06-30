const Complaint = require('../models/Complaint.model');
const sendNotification = require('../utils/sendNotification');

// Student files a complaint
exports.createComplaint = async (req, res) => {
  try {
    const { category, description } = req.body;
    const studentId = req.user.id;

    if (!category || !description) {
      return res.status(400).json({ message: 'category and description are required' });
    }

    const complaint = await Complaint.create({
      student: studentId,
      category,
      description,
      status: 'open'
    });

    res.status(201).json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Student views their own complaints
exports.getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ student: req.user.id }).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Warden/Admin: view all complaints (optional filter by status/category)
exports.getAllComplaints = async (req, res) => {
  try {
    const { status, category } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;

    const complaints = await Complaint.find(filter)
      .populate('student', 'name email studentId roomNumber')
      .populate('resolvedBy', 'name')
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Warden/Admin: update complaint status (in-progress / resolved) with notes
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { status, resolutionNotes } = req.body;
    if (!['open', 'in-progress', 'resolved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    complaint.status = status;
    if (resolutionNotes) complaint.resolutionNotes = resolutionNotes;
    if (status === 'resolved') complaint.resolvedBy = req.user.id;

    await complaint.save();

    await sendNotification({
      recipient: complaint.student,
      title: `Complaint ${status === 'resolved' ? 'Resolved' : 'Updated'}`,
      message: status === 'resolved'
        ? `Your complaint has been resolved. ${resolutionNotes || ''}`
        : `Your complaint status changed to "${status}".`,
      type: status === 'resolved' ? 'info' : 'info'
    });

    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Student deletes their own complaint (only if still open, e.g. filed by mistake)
exports.deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    if (complaint.student.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not your complaint' });
    }
    if (complaint.status !== 'open') {
      return res.status(400).json({ message: 'Cannot delete a complaint that is already being processed' });
    }
    await Complaint.findByIdAndDelete(req.params.id);
    res.json({ message: 'Complaint deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};