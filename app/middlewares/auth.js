const TokenService = require('../services/TokenService')
const AppError = require('../utils/appError')

function authorize (roles = []) {
    return (req, res, next) => {
        if (!('authorization' in req.headers)) {
             return next(new AppError('You are not authorized', 401))
  }
        const [, tokenValue] = req.headers.authorization.split(' ')
        const token = TokenService.verify(tokenValue)

        if (!token) {
            return next(new AppError('Your token is not valid', 401))
        }
        // بررسی نقش کاربر
        if (roles.length && !roles.includes(token.role)) {
            return next(new AppError('Access denied', 403))
        }
        req.user = token
        next()
    }
}
module.exports.authorize = authorize