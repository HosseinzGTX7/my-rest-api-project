const express = require('express')
const router = express.Router()
const usersController = require('../controllers/usersController')
const auth = require('../middlewares/auth')
const { body } = require('express-validator');

//Validation
const validateUserCreation = [
  body('first_name').notEmpty().withMessage('نام الزامی است'),
  body('last_name').notEmpty().withMessage('نام خانوادگی الزامی است'),
  body('mobile')
    .notEmpty().withMessage('شماره موبایل الزامی است')
    .matches("^09\\d{9}$").withMessage('فرمت شماره موبایل معتبر نیست'),
  body('email').isEmail().withMessage('ایمیل معتبر نیست'),
  body('password').isLength({ min: 8 }).withMessage('رمز عبور باید حداقل ۸ کاراکتر باشد')
]


//[auth] braye har kodom az router ha mishe mojaza gozasht k fght roye on amal kne.
router.post('/signup', validateUserCreation, usersController.addUser)
router.get('/admin/userlist', auth.authorize(['admin']),usersController.usersList)
router.get('/admin/userdetails', auth.authorize(['admin']), usersController.getUser)
router.delete('/admin/userremove', auth.authorize(['admin']),usersController.removeUser)
router.patch('/admin/userupdate', auth.authorize(['admin']),usersController.updateUser)

module.exports = router