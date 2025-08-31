const express = require("express")
const router = express.Router()
const passwordController = require('../controllers/forgotpassController')

const multer = require('multer')
const upload = multer()

router.post("/sendVerifyCode", upload.none(), passwordController.sendVerifyCode)
router.post("/checkVerifyCode", upload.none(), passwordController.checkVerifyCode)
router.post("/resetPass", upload.none(), passwordController.resetPassword)

module.exports = router