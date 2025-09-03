const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const bcrypt = require('bcrypt')
const User = require('../models/UserModel')
const ResetPassword = require('../models/resetPassModel')
const AppError = require('../utils/appError')

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

function setResetCookie(res, token, maxAgeMs) {
  res.cookie('rp_token', token, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax',
    maxAge: maxAgeMs,
    path: '/' 
  })
}

function clearResetCookie(res) {
  res.clearCookie('rp_token', { path: '/' })
}

// -------------------- Controllers --------------------

exports.sendVerifyCode = async (req, res, next) => {
  try {
    const { mobile } = req.body
    if (!mobile) return next (new AppError('Mobile number is required', 400))
    if ( mobile.length < 11 ) return next (new AppError('Mobile number is invalid', 401))

    const user = await User.findOne({ mobile })
    if (!user) return next (new AppError('User not found', 402))
    
    //Resend Code
    const lastReset = await ResetPassword.findOne({ userId: user._id }).sort({ createdAt: -1 })
    if (lastReset && (Date.now() - lastReset.createdAt.getTime()) < 2 * 60 * 1000) {
      return next (new AppError('Please wait 2 minutes before requesting again.', 403))
    }
    
    //Clean Pervius Code
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

    console.log(`Recovery code for ${mobile}: ${code}`)

    res.status(200).json({ Status: 200, Message: 'Recovery code sent' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

exports.checkVerifyCode = async (req, res, next) => {
  try {
    const { resetCode } = req.body
    if (!resetCode) return next (new AppError('Code is required', 400))

    const payload = verifyTokenFromCookie(req)
    if (!payload) return next (new AppError('Invalid or expired token', 401))

    const { sub: userId, jti } = payload
    const resetDoc = await ResetPassword.findOne({
      userId,
      jti,
      expiresAt: { $gt: new Date() }
    })

    if (!resetDoc) {
      return next (new AppError('Code not registered or expired code', 402))
    }

    if (resetDoc.attempts >= 5) {
      await resetDoc.deleteOne() //Delete Record After an unsuccessful attempt
      clearResetCookie(res) //Delete Cookie After an unsuccessful attempt
      return next (new AppError('The number of attempts has exceeded the limit. Please request the code again.', 404))
    }
    const isValidCode = resetDoc.resetCodeHash === hashCode(resetCode)
    if (!isValidCode) {
      resetDoc.attempts += 1
      await resetDoc.save()
      return next (new AppError('The code is invalid', 403))
    }

    if (resetDoc.isVerify) {
      return next (new AppError('The code has already been verified.', 405))
    }

    resetDoc.isVerify = true
    resetDoc.attempts = 0 //Reset attempts next success verify
    await resetDoc.save()

    res.status(200).json({ Status:200, Message: 'The code is confirmed' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

exports.resetPassword = async (req, res, next) => {
  try {
    const { newPassword, confirmPassword } = req.body
    if (!newPassword || !confirmPassword)
      return next (new AppError('New password and repeat required', 400))

    if (newPassword !== confirmPassword)
      return next (new AppError('The password does not match its repetition.', 401))

     if (newPassword.length < 8)
      return next (new AppError('Password must be at least 8 characters long.', 402))

    const payload = verifyTokenFromCookie(req)
    if (!payload) return next (new AppError('Invalid or expired token', 403))

    const { sub: userId, jti } = payload

    const resetDoc = await ResetPassword.findOne({
      userId,
      jti,
      isVerify: true,
      expiresAt: { $gt: new Date() }
    })
    if (!resetDoc) {
      return next (new AppError('It is not possible to change the password.', 404))
    }

    const user = await User.findById(userId)
    if (!user) return next (new AppError('User not found', 405))

    user.password = await bcrypt.hash(newPassword, 10)
    await user.save()

    await resetDoc.deleteOne()
    clearResetCookie(res)

    res.status(200).json({Status:200, Message: 'Password changed successfully.'})
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}