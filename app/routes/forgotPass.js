const express = require("express")
const router = express.Router()
const passwordController = require('../controllers/forgotpassController')

// درخواست ارسال کد پیامک
router.post("/forgot-pass", passwordController.forgotPassword)

// تایید کد و تغییر رمز
router.post("/reset-pass", passwordController.resetPassword)

module.exports = router