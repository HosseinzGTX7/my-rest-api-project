const User = require("../models/User");
const { sendSMS } = require("../services/smsService");

exports.forgotPassword = async (req, res) => {
  const { phone } = req.body
  const user = await User.findOne({ phone })
  if (!user) return res.status(404).json({ message: "کاربر پیدا نشد" })

  const resetCode = Math.floor(100000 + Math.random() * 900000)
  user.resetCode = resetCode
  user.resetCodeExpire = Date.now() + 5 * 60 * 1000; // 5 دقیقه
  await user.save()

  await sendSMS(phone, `کد بازیابی رمز: ${resetCode}`)
  res.json({ message: "کد بازیابی برای شما ارسال شد" })
}

exports.resetPassword = async (req, res) => {
  const { phone, resetCode, newPassword } = req.body
  const user = await User.findOne({ phone, resetCode })
  if (!user) return res.status(400).json({ message: "کد نامعتبر است" })
  if (user.resetCodeExpire < Date.now())
    return res.status(400).json({ message: "کد منقضی شده" })

  user.password = newPassword // حتما با bcrypt هش کن
  user.resetCode = undefined
  user.resetCodeExpire = undefined
  await user.save()

  res.json({ message: "رمز عبور با موفقیت تغییر یافت" })
}
