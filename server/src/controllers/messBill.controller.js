const MessBill = require('../models/MessBill.model');
const User = require('../models/User.model');

// Student views their own bills
exports.getMyBills = async (req, res) => {
  try {
    const bills = await MessBill.find({ student: req.user.id }).sort({ dueDate: -1 });
    res.json(bills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Student "pays" a bill (simulated — no real payment gateway yet)
exports.payBill = async (req, res) => {
  try {
    const bill = await MessBill.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: 'Bill not found' });
    if (bill.student.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not your bill' });
    }
    if (bill.status === 'paid') {
      return res.status(400).json({ message: 'Bill already paid' });
    }

    bill.status = 'paid';
    bill.paidAt = new Date();
    await bill.save();
    res.json(bill);
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
    res.status(201).json({ message: `${created.length} bills created for ${month}`, count: created.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin/Warden: view all bills (optionally filter by month/status)
exports.getAllBills = async (req, res) => {
  try {
    const { month, status } = req.query;
    const filter = {};
    if (month) filter.month = month;
    if (status) filter.status = status;

    const bills = await MessBill.find(filter)
      .populate('student', 'name email studentId roomNumber')
      .sort({ dueDate: -1 });
    res.json(bills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin/Warden: manually mark a bill as paid (e.g. cash payment)
exports.markBillPaid = async (req, res) => {
  try {
    const bill = await MessBill.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: 'Bill not found' });
    bill.status = 'paid';
    bill.paidAt = new Date();
    await bill.save();
    res.json(bill);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: delete a bill (e.g. created in error)
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