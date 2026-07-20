const { body } = require('express-validator');
const ALLOWED_EMAIL_DOMAIN = '@pec.edu.in';

exports.registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email')
    .trim()
    .isEmail().withMessage('Valid email is required')
    .custom((value) => {
      if (!value.toLowerCase().endsWith(ALLOWED_EMAIL_DOMAIN)) {
        throw new Error(`Only college email addresses ending in ${ALLOWED_EMAIL_DOMAIN} are allowed`);
      }
      return true;
    }),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('studentId').trim().notEmpty().withMessage('Student ID is required'),
  body('phone').optional({ checkFalsy: true }).isMobilePhone(),
];

exports.loginValidation = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
];

exports.setPasswordValidation = [
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
];

exports.createStaffValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role').isIn(['warden', 'admin']).withMessage('Role must be warden or admin'),
  body('employeeId').trim().notEmpty().withMessage('Employee ID is required'),
  body('designation').trim().notEmpty().withMessage('Designation is required')
];
