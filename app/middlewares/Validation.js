const { body } = require('express-validator')

const validateUserCreation = [
  body('first_name').notEmpty().withMessage('Input Incomplete'),
  body('last_name').notEmpty().withMessage('Input Incomplete'),
  body('mobile')
    .notEmpty().withMessage('Phone Incomplete')
    .matches("^09\\d{9}$").withMessage('Phone Invalid'),
  body('email').isEmail().withMessage('Email Incorrect'),
  body('password').isLength({ min: 8 }).withMessage('Password Incorrect (Min=8 Char)')
]

module.exports = validateUserCreation