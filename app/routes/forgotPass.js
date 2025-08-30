const express = require("express")
const router = express.Router()
const passwordController = require('../controllers/forgotpassController')

const multer = require('multer')
const upload = multer()

// درخواست ارسال کد پیامک
router.post("/forgot-pass", upload.none(), passwordController.sendVerifyCode)

router.post("/verify-code", upload.none(), passwordController.checkVerifyCode)
// تایید کد و تغییر رمز
router.post("/reset-pass", upload.none(), passwordController.resetPassword)

module.exports = router