const UserModel = require('../models/UserModel')
const { comparePassword } = require('../services/hashService')
const TokenService = require('../services/TokenService')
const AppError = require('../utils/appError')

exports.newSession = async (req, res, next) => {
    try {
        const { email, password } = req.body

        const user = await UserModel.findOne({ email })
            if (!user) {
                return next(new AppError('User Not Found', 403))
        }

        const isMatch = await comparePassword(password, user.password)
            if (!isMatch) {
                return next(new AppError('Password Incorrect', 404))
        }

        const token = TokenService.sign({ id: user.id, role: user.role })
        const decoded = TokenService.decode(token)
        const expiresAt = new Date(decoded.exp * 1000) //قابل خواندن کردن تاریخ

        return res.status(200).send({
            Success: true,
            Status: 200,
            token,
            expiresAt: expiresAt.toLocaleString('fa-IR', { timeZone: 'Asia/Tehran' }),
            user: {
                id: user._id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                createdAt: user.createdAt,
                updateAt: user.updateAt,
                role: user.role
            }
        })

    } catch (error) {
        next(error)
    }
}