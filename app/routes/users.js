const express = require('express')
const router = express.Router()
const validateUser = require('../middlewares/Validation')
const usersController = require('../controllers/usersController')

//For Send form-data
const multer = require('multer')
const upload = multer()

router.post('/', upload.none(), validateUser, usersController.addUser)

module.exports = router