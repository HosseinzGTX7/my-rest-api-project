const TokenService = require('../services/TokenService')

// اضافه کردن middleware سطح دسترسی
function authorize (roles = []) {
    return (req, res, next) => {
        if (!('authorization' in req.headers)) {
            return res.status(401).send({
                status: 'error',
                code: 401,
                message: 'you are not authorized'
            })
        }
        const [, tokenValue] = req.headers.authorization.split(' ')
        const token = TokenService.verify(tokenValue)

        if (!token) {
            return res.status(401).send({
                status: 'error',
                code: 401,
                message: 'your token is not valid'
            })
        }
        // بررسی نقش کاربر
        if (roles.length && !roles.includes(token.role)) {
            return res.status(403).send({
                status: 'error',
                code: 403,
                message: 'access denied'
            })
        }
        req.user = token
        next()
    }
}

module.exports = (req, res, next) => {
    if (!('authorization' in req.headers)) {
        return res.status(401).send({
            status: 'error',
            code: 401,
            message: 'you are not authorized'
        })
    }
    const [, tokenValue] = req.headers.authorization.split(' ')
    const token = TokenService.verify(tokenValue)
    if (!token) {
        return res.status(401).send({
            status: 'error',
            code: 401,
            message: 'your token is not valid'
        })
    }
    req.user = token
    next()
}

module.exports.authorize = authorize