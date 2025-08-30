const mongoose = require('mongoose')

const resetPasswordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resetCode: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } } //TTL for delete DB
}, { timestamps: true })

const ResetPassword = mongoose.model('ResetPassword', resetPasswordSchema)
module.exports = ResetPassword