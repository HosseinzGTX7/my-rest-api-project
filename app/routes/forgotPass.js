const express = require("express")
const router = express.Router()
const passwordController = require('../controllers/forgotpassController')

const multer = require('multer')
const upload = multer()

router.post("/forgot-pass", upload.none(), passwordController.sendVerifyCode)

router.post("/verify-code", upload.none(), passwordController.checkVerifyCode)

router.post("/reset-pass", upload.none(), passwordController.resetPassword)

module.exports = router