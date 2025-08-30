const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const bcrypt = require('bcrypt')
const User = require('../models/UserModel')
const ResetPassword = require('../models/resetPassModel')

const RESET_SECRET = process.env.RESET_JWT_SECRET || 'dev-reset-secret'
const IS_PROD = process.env.NODE_ENV === 'production'

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

function hashCode(code) {
  return crypto.createHash('sha256').update(code).digest('hex')
}

function generateJti() {
  return crypto.randomBytes(16).toString('hex')
}

function signResetToken(userId, jti, maxAgeMs) {
  return jwt.sign(
    { sub: userId.toString(), jti },
    RESET_SECRET,
    { expiresIn: Math.floor(maxAgeMs / 1000) + 's' }
  )
}

function verifyTokenFromCookie(req) {
  const token = req.cookies?.rp_token
  if (!token) return null
  try {
    return jwt.verify(token, RESET_SECRET) // { sub, jti, iat, exp }
  } catch {
    return null
  }
}

// کوکی امن ست کردن
function setResetCookie(res, token, maxAgeMs) {
  res.cookie('rp_token', token, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax',
    maxAge: maxAgeMs,
    path: '/api/v1/password' 
  })
}

// پاک کردن کوکی
function clearResetCookie(res) {
  res.clearCookie('rp_token', { path: '/' })
}

// -------------------- Controllers --------------------

exports.sendVerifyCode = async (req, res) => {
  try {
    const { mobile } = req.body
    if (!mobile) return res.status(400).json({ message: 'شماره موبایل لازم است' })

    const user = await User.findOne({ mobile })
    if (!user) return res.status(404).json({ message: 'کاربر پیدا نشد' })

    // اگر قبلاً کد فعال دارد، پاک کنیم (تمیزکاری)
    await ResetPassword.deleteMany({ userId: user._id })

    const code = generateCode()
    const codeHash = hashCode(code)
    const jti = generateJti()
    const ttlMs = 5 * 60 * 1000 // 5 دقیقه

    const resetDoc = new ResetPassword({
      userId: user._id,
      resetCodeHash: codeHash,
      jti,
      isVerify: false,
      expiresAt: new Date(Date.now() + ttlMs)
    })
    await resetDoc.save()

    const token = signResetToken(user._id, jti, ttlMs)
    setResetCookie(res, token, ttlMs)

    console.log(`🔐 Reset code for ${mobile}: ${code}`)

    res.json({ message: 'کد بازیابی ارسال شد' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'خطای سرور' })
  }
}

exports.checkVerifyCode = async (req, res) => {
  try {
    const { resetCode } = req.body
    if (!resetCode) return res.status(400).json({ message: 'کد لازم است' })

    const payload = verifyTokenFromCookie(req)
    if (!payload) return res.status(401).json({ message: 'توکن نامعتبر یا منقضی شده' })

    const { sub: userId, jti } = payload
    const resetDoc = await ResetPassword.findOne({
      userId,
      jti,
      resetCodeHash: hashCode(resetCode),
      expiresAt: { $gt: new Date() }
    })

    if (!resetDoc) {
      return res.status(400).json({ message: 'کد نامعتبر یا منقضی شده' })
    }

    if (resetDoc.isVerify) {
      // قبلاً تایید شده
      return res.json({ message: 'کد قبلاً تایید شده است' })
    }

    resetDoc.isVerify = true
    await resetDoc.save()

    res.json({ message: 'کد تایید شد' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'خطای سرور' })
  }
}

exports.resetPassword = async (req, res) => {
  try {
    const { newPassword, confirmPassword } = req.body
    if (!newPassword || !confirmPassword)
      return res.status(400).json({ message: 'رمز جدید و تکرار لازم است' })

    if (newPassword !== confirmPassword)
      return res.status(400).json({ message: 'رمز عبور با تکرار آن مطابقت ندارد' })

    const payload = verifyTokenFromCookie(req)
    if (!payload) return res.status(401).json({ message: 'توکن نامعتبر یا منقضی شده' })

    const { sub: userId, jti } = payload

    const resetDoc = await ResetPassword.findOne({
      userId,
      jti,
      isVerify: true,
      expiresAt: { $gt: new Date() }
    })
    if (!resetDoc) {
      return res.status(400).json({ message: 'امکان تغییر رمز وجود ندارد' })
    }

    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ message: 'کاربر پیدا نشد' })

    user.password = await bcrypt.hash(newPassword, 10)
    await user.save()

    await resetDoc.deleteOne()
    clearResetCookie(res)

    res.json({ message: 'رمز عبور با موفقیت تغییر یافت' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'خطای سرور' })
  }
}