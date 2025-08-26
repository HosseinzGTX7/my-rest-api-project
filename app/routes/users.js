const express = require('express')
const router = express.Router()
const validateUser = require('../middlewares/Validation')
const usersController = require('../controllers/usersController')
const auth = require('../middlewares/auth')

router.post('/signup', validateUser, usersController.addUser)
router.get('/admin/userlist', auth.authorize(['admin']),usersController.usersList)
router.get('/admin/userdetails', auth.authorize(['admin']), usersController.getUser)
router.delete('/admin/userremove', auth.authorize(['admin']),usersController.removeUser)
router.patch('/admin/userupdate', auth.authorize(['admin']),usersController.updateUser)

module.exports = router