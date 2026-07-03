const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const {
  getMyBills,
  submitPaymentProof,
  generateBillsForMonth,
  getAllBills,
  approvePayment,
  rejectPayment,
  markBillPaid,
  deleteBill,
  markOverdueBills,
} = require('../controllers/messBill.controller');


// Static paths before /:id wildcard
router.get('/mine', protect, authorize('student'), getMyBills);
router.post('/generate', protect, authorize('warden', 'admin'), generateBillsForMonth);
router.get('/', protect, authorize('warden', 'admin'), getAllBills);
router.post('/check-overdue', protect, authorize('admin'), async (req, res) => {
  await markOverdueBills();
  res.json({ message: 'Overdue check complete' });
});

// Bill-specific actions
router.patch('/:id/submit-payment', protect, authorize('student'), submitPaymentProof);
router.patch('/:id/approve-payment', protect, authorize('warden', 'admin'), approvePayment);
router.patch('/:id/reject-payment', protect, authorize('warden', 'admin'), rejectPayment);
router.patch('/:id/mark-paid', protect, authorize('warden', 'admin'), markBillPaid);
router.delete('/:id', protect, authorize('admin'), deleteBill);

module.exports = router;