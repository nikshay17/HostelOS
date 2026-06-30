const { body } = require('express-validator');

exports.registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('studentId').trim().notEmpty().withMessage('Student ID is required'),
  body('phone').optional().isMobilePhone().withMessage('Invalid phone number')
];

exports.loginValidation = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
];

exports.createStaffValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role').isIn(['warden', 'admin']).withMessage('Role must be warden or admin'),
  body('employeeId').trim().notEmpty().withMessage('Employee ID is required'),
  body('designation').trim().notEmpty().withMessage('Designation is required')
];