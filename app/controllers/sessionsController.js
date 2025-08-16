const UserModel = require('../models/UserModel')
const { comparePassword } = require('../services/hashService')
const TokenService = require('../services/TokenService')

exports.newSession = async (req, res, next) => {
    try {
        const { email, password } = req.body

        const user = await UserModel.findOne({ email })
            if (!user) {
                 return res.status(404).send({
                 status: 'error',
                 code: 404,
                 msg: 'کاربری با این ایمیل یافت نشد'
        })
}

        const isMatch = await comparePassword(password, user.password)
            if (!isMatch) {
                return res.status(401).send({
                status: 'error',
                code: 401,
                msg: 'رمز عبور اشتباه است'
         })
}

        const token = TokenService.sign({ id: user._id })

        res.send({
            status: 'success',
            code: 200,
            token
        })

    } catch (error) {
        next(error)
    }
}
