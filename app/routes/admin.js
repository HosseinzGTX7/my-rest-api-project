const express = require('express')
const router = express.Router()
const usersController = require('../controllers/usersController')
const auth = require('../middlewares/auth')
const {validateUpdateUser} = require('../middlewares/Validation')

//For Send form-data
const multer = require('multer')
const upload = multer()

router.get('/userList', upload.none(),auth.authorize(['admin']), usersController.usersList)
router.get('/userDetails', upload.none(),auth.authorize(['admin']), usersController.getUser)
router.delete('/userRemove', upload.none(),auth.authorize(['admin']), usersController.removeUser)
router.patch('/userUpdate', upload.none(), validateUpdateUser,auth.authorize(['admin']), usersController.updateUser)

module.exports = router