const express = require('express')
const router = express.Router()
const {validateCreateUser} = require('../middlewares/Validation')
const usersController = require('../controllers/usersController')

//For Send form-data
const multer = require('multer')
const upload = multer()

router.post('/', upload.none(), validateCreateUser, usersController.addUser)

module.exports = router