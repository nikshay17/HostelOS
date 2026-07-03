const MessBill = require('../models/MessBill.model');
const User = require('../models/User.model');
const sendNotification = require('../utils/sendNotification');

// Student views their own bills
exports.getMyBills = async (req, res) => {
  try {
    const bills = await MessBill.find({ student: req.user.id }).sort({ dueDate: -1 });
    res.json(bills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// // Student "pays" a bill (simulated — no real payment gateway yet)
// exports.payBill = async (req, res) => {
//   try {
//     const bill = await MessBill.findById(req.params.id);
//     if (!bill) return res.status(404).json({ message: 'Bill not found' });
//     if (bill.student.toString() !== req.user.id) {
//       return res.status(403).json({ message: 'Not your bill' });
//     }
//     if (bill.status === 'paid') {
//       return res.status(400).json({ message: 'Bill already paid' });
//     }

//     bill.status = 'paid';
//     bill.paidAt = new Date();
//     await bill.save();
//     res.json(bill);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// Student submits payment proof with transaction ID
exports.submitPaymentProof = async (req, res) => {
  try {
    const { transactionId, paymentMethod, paymentNote } = req.body;
    const bill = await MessBill.findById(req.params.id);

    if (!bill) return res.status(404).json({ message: 'Bill not found' });
    if (bill.student.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not your bill' });
    }
    if (bill.status === 'paid') {
      return res.status(400).json({ message: 'Bill already paid' });
    }
    if (bill.status === 'pending_verification') {
      return res.status(400).json({ message: 'Payment already submitted — awaiting admin verification' });
    }
    if (!transactionId || !transactionId.trim()) {
      return res.status(400).json({ message: 'Transaction ID is required' });
    }

    bill.transactionId = transactionId.trim();
    bill.paymentMethod = paymentMethod || 'other';
    bill.paymentNote = paymentNote || '';
    bill.status = 'pending_verification';
    await bill.save();

    // Notify wardens/admins
    const staff = await User.find({ role: { $in: ['warden', 'admin'] } }).select('_id');
    await Promise.all(staff.map(s => sendNotification({
      recipient: s._id,
      title: 'Payment Proof Submitted',
      message: `A student has submitted payment proof for mess bill (${bill.month}). Transaction ID: ${bill.transactionId}`,
      type: 'info',
    })));

    res.json({ message: 'Payment proof submitted successfully — awaiting admin verification', bill });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin/Warden: generate bills for ALL students for a given month
exports.generateBillsForMonth = async (req, res) => {
  try {
    const { month, amount, dueDate } = req.body;
    if (!month || !amount || !dueDate) {
      return res.status(400).json({ message: 'month, amount, and dueDate are required' });
    }

    const students = await User.find({ role: 'student' });
    if (students.length === 0) {
      return res.status(400).json({ message: 'No students found to bill' });
    }

    // Avoid duplicate bills for the same student+month
    const existingForMonth = await MessBill.find({ month }).select('student');
    const alreadyBilledIds = new Set(existingForMonth.map(b => b.student.toString()));

    const toCreate = students
      .filter(s => !alreadyBilledIds.has(s._id.toString()))
      .map(s => ({
        student: s._id,
        month,
        amount,
        dueDate,
        status: 'unpaid'
      }));

    if (toCreate.length === 0) {
      return res.status(400).json({ message: `Bills for ${month} already exist for all students` });
    }

    const created = await MessBill.insertMany(toCreate);

    await Promise.all(
      created.map(bill => sendNotification({
        recipient: bill.student,
        title: 'New Mess Bill Generated',
        message: `Your mess bill for ${month} (₹${amount}) is due on ${new Date(dueDate).toLocaleDateString()}.`,
        type: 'warning'
      }))
    );

    res.status(201).json({ message: `${created.length} bills created for ${month}`, count: created.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin/Warden: view all bills (optionally filter by month/status)
// exports.getAllBills = async (req, res) => {
//   try {
//     const { month, status } = req.query;
//     const filter = {};
//     if (month) filter.month = month;
//     if (status) filter.status = status;

//     const bills = await MessBill.find(filter)
//       .populate('student', 'name email studentId roomNumber')
//       .sort({ dueDate: -1 });
//     res.json(bills);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// Admin/Warden: view all bills with optional filters
exports.getAllBills = async (req, res) => {
  try {
    const { month, status } = req.query;
    const filter = {};
    if (month) filter.month = month;
    if (status) filter.status = status;

    const bills = await MessBill.find(filter)
      .populate('student', 'name email studentId roomNumber')
      .populate('verifiedBy', 'name')
      .sort({ dueDate: -1 });
    res.json(bills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin/Warden: manually mark a bill as paid (e.g. cash payment)
// exports.markBillPaid = async (req, res) => {
//   try {
//     const bill = await MessBill.findById(req.params.id);
//     if (!bill) return res.status(404).json({ message: 'Bill not found' });
//     bill.status = 'paid';
//     bill.paidAt = new Date();
//     await bill.save();
//     res.json(bill);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // Admin: delete a bill (e.g. created in error)
// exports.deleteBill = async (req, res) => {
//   try {
//     const bill = await MessBill.findById(req.params.id);
//     if (!bill) return res.status(404).json({ message: 'Bill not found' });
//     await MessBill.findByIdAndDelete(req.params.id);
//     res.json({ message: 'Bill deleted' });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

exports.approvePayment = async (req, res) => {
  try {
    const bill = await MessBill.findById(req.params.id).populate('student', 'name _id');
    if (!bill) return res.status(404).json({ message: 'Bill not found' });

    if (bill.status !== 'pending_verification') {
      return res.status(400).json({ message: 'Bill is not awaiting verification' });
    }

    bill.status = 'paid';
    bill.paidAt = new Date();
    bill.verifiedBy = req.user.id;
    bill.verifiedAt = new Date();
    bill.rejectionReason = undefined;
    await bill.save();

    // Notify the student
    await sendNotification({
      recipient: bill.student._id,
      title: 'Payment Verified',
      message: `Your mess bill payment for ${bill.month} has been verified and approved.`,
      type: 'info',
    });

    res.json({ message: 'Payment approved', bill });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin/Warden: reject a payment (e.g. invalid/fake transaction ID)
exports.rejectPayment = async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const bill = await MessBill.findById(req.params.id).populate('student', 'name _id');
    if (!bill) return res.status(404).json({ message: 'Bill not found' });

    if (bill.status !== 'pending_verification') {
      return res.status(400).json({ message: 'Bill is not awaiting verification' });
    }

    bill.status = 'unpaid';
    bill.transactionId = undefined;
    bill.paymentMethod = undefined;
    bill.paymentNote = undefined;
    bill.rejectionReason = rejectionReason || 'Payment could not be verified';
    await bill.save();

    // Notify the student
    await sendNotification({
      recipient: bill.student._id,
      title: 'Payment Rejected',
      message: `Your mess bill payment for ${bill.month} was rejected. Reason: ${bill.rejectionReason}. Please resubmit with a valid transaction ID.`,
      type: 'warning',
    });

    res.json({ message: 'Payment rejected', bill });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin/Warden: manually mark paid (e.g. cash payment)
exports.markBillPaid = async (req, res) => {
  try {
    const bill = await MessBill.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: 'Bill not found' });

    bill.status = 'paid';
    bill.paidAt = new Date();
    bill.verifiedBy = req.user.id;
    bill.verifiedAt = new Date();
    bill.transactionId = bill.transactionId || 'MANUAL';
    await bill.save();

    res.json(bill);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: delete a bill
exports.deleteBill = async (req, res) => {
  try {
    const bill = await MessBill.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: 'Bill not found' });
    await MessBill.findByIdAndDelete(req.params.id);
    res.json({ message: 'Bill deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin/Warden: generate bills for all students for a month
exports.generateBillsForMonth = async (req, res) => {
  try {
    const { month, amount, dueDate } = req.body;
    if (!month || !amount || !dueDate) {
      return res.status(400).json({ message: 'month, amount, and dueDate are required' });
    }

    const students = await User.find({ role: 'student' });
    if (students.length === 0) {
      return res.status(400).json({ message: 'No students found to bill' });
    }

    const existingForMonth = await MessBill.find({ month }).select('student');
    const alreadyBilledIds = new Set(existingForMonth.map(b => b.student.toString()));

    const toCreate = students
      .filter(s => !alreadyBilledIds.has(s._id.toString()))
      .map(s => ({ student: s._id, month, amount, dueDate, status: 'unpaid' }));

    if (toCreate.length === 0) {
      return res.status(400).json({ message: `Bills for ${month} already exist for all students` });
    }

    const created = await MessBill.insertMany(toCreate);

    // Notify all students
    await Promise.all(
      created.map(bill => sendNotification({
        recipient: bill.student,
        title: 'New Mess Bill Generated',
        message: `Your mess bill for ${month} (₹${amount}) is due on ${new Date(dueDate).toLocaleDateString()}.`,
        type: 'warning',
      }))
    );

    res.status(201).json({ message: `${created.length} bills created for ${month}`, count: created.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Overdue marking utility
const markOverdueBills = async () => {
  const result = await MessBill.updateMany(
    { status: 'unpaid', dueDate: { $lt: new Date() } },
    { $set: { status: 'overdue' } }
  );
  console.log(`Marked ${result.modifiedCount} bills as overdue`);
};

exports.markOverdueBills = markOverdueBills;