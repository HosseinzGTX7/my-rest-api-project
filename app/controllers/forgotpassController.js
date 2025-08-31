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

exports.sendVerifyCode = async (req, res) => {
  try {
    const { mobile } = req.body
    if (!mobile) return res.status(400).json({ message: 'Mobile number is required' })

    const user = await User.findOne({ mobile })
    if (!user) return res.status(404).json({ message: 'User not found' })
    
    //Resend Code
    const lastReset = await ResetPassword.findOne({ userId: user._id }).sort({ createdAt: -1 })
    if (lastReset && (Date.now() - lastReset.createdAt.getTime()) < 2 * 60 * 1000) {
      return res.status(400).json({ message: 'Please wait 2 minutes before requesting again.' })
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

    res.json({ message: 'Recovery code sent' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

exports.checkVerifyCode = async (req, res) => {
  try {
    const { resetCode } = req.body
    if (!resetCode) return res.status(400).json({ message: 'Code is required' })

    const payload = verifyTokenFromCookie(req)
    if (!payload) return res.status(401).json({ message: 'Invalid or expired token' })

    const { sub: userId, jti } = payload
    const resetDoc = await ResetPassword.findOne({
      userId,
      jti,
      expiresAt: { $gt: new Date() }
    })

    if (!resetDoc) {
      return res.status(400).json({ message: 'Invalid or expired code' })
    }

    if (resetDoc.attempts >= 5) {
      await resetDoc.deleteOne() //Delete Record After an unsuccessful attempt
      clearResetCookie(res) //Delete Cookie After an unsuccessful attempt
      return res.status(429).json({ message: 'The number of attempts has exceeded the limit. Please request the code again.' })
    }
    const isValidCode = resetDoc.resetCodeHash === hashCode(resetCode)
    if (!isValidCode) {
      resetDoc.attempts += 1
      await resetDoc.save()
      return res.status(400).json({ message: 'The code is invalid' })
    }

    if (resetDoc.isVerify) {
      return res.json({ message: 'The code has already been verified.' })
    }

    resetDoc.isVerify = true
    resetDoc.attempts = 0 //Reset attempts next success verify
    await resetDoc.save()

    res.json({ message: 'The code is confirmed' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

exports.resetPassword = async (req, res) => {
  try {
    const { newPassword, confirmPassword } = req.body
    if (!newPassword || !confirmPassword)
      return res.status(400).json({ message: 'New password and repeat required' })

    if (newPassword !== confirmPassword)
      return res.status(400).json({ message: 'The password does not match its repetition.' })

     if (newPassword.length < 8)
      return res.status(400).json({ message: "Password must be at least 8 characters long." })

    const payload = verifyTokenFromCookie(req)
    if (!payload) return res.status(401).json({ message: 'Invalid or expired token' })

    const { sub: userId, jti } = payload

    const resetDoc = await ResetPassword.findOne({
      userId,
      jti,
      isVerify: true,
      expiresAt: { $gt: new Date() }
    })
    if (!resetDoc) {
      return res.status(400).json({ message: 'It is not possible to change the password.' })
    }

    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ message: 'User not found' })

    user.password = await bcrypt.hash(newPassword, 10)
    await user.save()

    await resetDoc.deleteOne()
    clearResetCookie(res)

    res.json({ message: 'Password changed successfully.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}