const UserModel = require('../models/UserModel')
const { comparePassword } = require('../services/hashService')
const TokenService = require('../services/TokenService')

exports.newSession = async (req, res, next) => {
    try {
        const { email, password } = req.body

        const user = await UserModel.findOne({ email })
            if (!user) {
                 return res.status(200).send({
                 Success: false,
                 Status: 404,
                 Message: 'User Not Found'
        })
}

        const isMatch = await comparePassword(password, user.password)
            if (!isMatch) {
                return res.status(200).send({
                Success: false,
                Status: 401,
                Message: 'Password Incorrect'
         })
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
