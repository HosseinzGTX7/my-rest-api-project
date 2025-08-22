const express = require('express')
const router = express.Router()
const usersController = require('../controllers/usersController')
const auth = require('../middlewares/auth')
const { body } = require('express-validator')

//Validation
const validateUserCreation = [
  body('first_name').notEmpty().withMessage('Input Incomplete'),
  body('last_name').notEmpty().withMessage('Input Incomplete'),
  body('mobile')
    .notEmpty().withMessage('Phone Incomplete')
    .matches("^09\\d{9}$").withMessage('Phone Invalid'),
  body('email').isEmail().withMessage('Email Incorrect'),
  body('password').isLength({ min: 8 }).withMessage('Password Incorrect (Min=8 Char)')
]

//[auth] braye har kodom az router ha mishe mojaza gozasht k fght roye on amal kne.
router.post('/signup', validateUserCreation, usersController.addUser)
router.get('/admin/userlist', auth.authorize(['admin']),usersController.usersList)
router.get('/admin/userdetails', auth.authorize(['admin']), usersController.getUser)
router.delete('/admin/userremove', auth.authorize(['admin']),usersController.removeUser)
router.patch('/admin/userupdate', auth.authorize(['admin']),usersController.updateUser)

module.exports = router