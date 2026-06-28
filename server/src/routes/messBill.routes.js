const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const {
  getMyBills, payBill, generateBillsForMonth,
  getAllBills, markBillPaid, deleteBill
} = require('../controllers/messBill.controller');
const markOverdueBills = require('../utils/markOverdueBills');

// Static paths before /:id wildcard routes — same lesson as Day 4
router.get('/mine', protect, authorize('student'), getMyBills);
router.post('/generate', protect, authorize('warden', 'admin'), generateBillsForMonth);
router.get('/', protect, authorize('warden', 'admin'), getAllBills);
router.post('/check-overdue', protect, authorize('admin'), async (req, res) => {
  await markOverdueBills();
  res.json({ message: 'Overdue check complete' });
});

router.patch('/:id/pay', protect, authorize('student'), payBill);
router.patch('/:id/mark-paid', protect, authorize('warden', 'admin'), markBillPaid);
router.delete('/:id', protect, authorize('admin'), deleteBill);

module.exports = router;