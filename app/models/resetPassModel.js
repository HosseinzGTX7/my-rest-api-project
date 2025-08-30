const mongoose = require('mongoose')

const resetPasswordSchema = new mongoose.Schema({
  
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resetCodeHash: { type: String, required: true },
  jti: { type: String, required: true, index: true },
  isVerify: { type: Boolean, default: false },
  expiresAt: { type: Date, required: true, index: true }
}, { timestamps: true })

resetPasswordSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

const ResetPassword = mongoose.model('ResetPassword', resetPasswordSchema)
module.exports = ResetPassword
