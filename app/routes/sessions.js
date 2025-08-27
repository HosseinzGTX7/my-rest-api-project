const express = require('express')
const router = express.Router()
const Controller = require('../controllers/sessionsController')

//For Send form-data
const multer = require('multer')
const upload = multer()

const validateLogin = require('../middlewares/ValidateLogin')

router.post('/new', upload.none(), validateLogin, Controller.newSession)
module.exports = router