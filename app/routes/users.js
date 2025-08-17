const express = require('express')
const router = express.Router()
const usersController = require('../controllers/usersController')
const auth = require('../middlewares/auth')
const { body } = require('express-validator');

//Validation
const validateUserCreation = [
  body('first_name').notEmpty().withMessage('نام الزامی است'),
  body('last_name').notEmpty().withMessage('نام خانوادگی الزامی است'),
  body('email').isEmail().withMessage('ایمیل معتبر نیست'),
  body('password').isLength({ min: 8 }).withMessage('رمز عبور باید حداقل ۸ کاراکتر باشد')
]


//[auth] braye har kodom az router ha mishe mojaza gozasht k fght roye on amal kne.
router.post('/', validateUserCreation, usersController.addUser)
router.get('/', [auth],usersController.usersList)
router.get('/id', [auth], usersController.getUser)
router.delete('/id', [auth],usersController.removeUser)
router.patch('/id', [auth],usersController.updateUser)

module.exports = router