const Feedback = require('../models/Feedback.model');

const normalizeStudent = (student) => {
  if (!student || typeof student !== 'object') {
    return {
      _id: null,
      name: 'Unknown student',
      studentId: '—',
      roomNumber: '—',
    };
  }

  return {
    _id: student._id || null,
    name: student.name || 'Unknown student',
    studentId: student.studentId || '—',
    roomNumber: student.roomNumber || '—',
  };
};

const serializeFeedback = (feedbackDoc) => {
  const feedback = feedbackDoc.toObject ? feedbackDoc.toObject() : feedbackDoc;
  return {
    ...feedback,
    student: normalizeStudent(feedback.student),
  };
};

// Student submits feedback
exports.createFeedback = async (req, res) => {
  try {
    const { category, rating, comments } = req.body;
    const studentId = req.user.id;

    if (!category || !rating) {
      return res.status(400).json({ message: 'category and rating are required' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'rating must be between 1 and 5' });
    }

    const feedback = await Feedback.create({
      student: studentId,
      category,
      rating,
      comments
    });

    res.status(201).json(feedback);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Student views their own past feedback
exports.getMyFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find({ student: req.user.id }).sort({ createdAt: -1 });
    res.json(feedback.map(serializeFeedback));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin/Warden: view all feedback (optional filter by category)
exports.getAllFeedback = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = {};
    if (category) filter.category = category;

    const feedback = await Feedback.find(filter)
      .populate('student', 'name studentId roomNumber')
      .sort({ createdAt: -1 });
    res.json(feedback.map(serializeFeedback));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin/Warden: get average rating per category (for the overview dashboard)
exports.getFeedbackSummary = async (req, res) => {
  try {
    const summary = await Feedback.aggregate([
      {
        $group: {
          _id: '$category',
          averageRating: { $avg: '$rating' },
          totalResponses: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const overall = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          overallAverage: { $avg: '$rating' },
          totalResponses: { $sum: 1 }
        }
      }
    ]);

    res.json({
      byCategory: summary,
      overall: overall[0] || { overallAverage: 0, totalResponses: 0 }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};