const Joi = require('joi')
const AppError = require('../utils/appError')

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required()
})

function validateLogin(req, res, next) {
  const { error } = loginSchema.validate(req.body, { abortEarly: true })
  if (error) {
    const detail = error.details[0]
    let message = 'Invalid input'
    let statusCode = 400

    switch (detail.context.key) {
      case 'email':
        message = detail.type === 'string.email' ? 'Email format is incorrect' : 'Email is required'
        statusCode = detail.type === 'string.email' ? 401 : 400
        break
      case 'password':
        message = detail.type === 'string.min' ? 'Password must be at least 8 characters' : 'Password is required'
        statusCode = detail.type === 'string.min' ? 402 : 400
        break
    }

    return next(new AppError(message, statusCode))
  }
  next()
}

module.exports = validateLogin