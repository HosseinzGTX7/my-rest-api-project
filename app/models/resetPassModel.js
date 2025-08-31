const mongoose = require('mongoose')

const resetPasswordSchema = new mongoose.Schema({
  
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resetCodeHash: { type: String, required: true },
  jti: { type: String, required: true, index: true },
  attempts: { type: Number, default: 0 },
  isVerify: { type: Boolean, default: false },
  expiresAt: { type: Date, required: true }
}, { timestamps: true })

resetPasswordSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

const ResetPassword = mongoose.model('ResetPassword', resetPasswordSchema)
module.exports = ResetPassword
