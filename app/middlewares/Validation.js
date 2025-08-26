const Joi = require('joi')
const AppError = require('../utils/appError')

const userSchema = Joi.object({
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  mobile: Joi.string().pattern(/^09\d{9}$/).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required()
})

function validateUser(req, res, next) {
  const { error } = userSchema.validate(req.body, { abortEarly: true })
  if (error) {
    const detail = error.details[0]
    let message = 'Invalid input'
    let statusCode = 422

    switch (detail.context.key) {
      case 'first_name':
        message = 'First name is required'
        break
      case 'last_name':
        message = 'Last name is required'
        break
      case 'mobile':
        message = detail.type === 'string.pattern.base' ? 'Phone invalid' : 'Phone is required'
        statusCode = detail.type === 'string.pattern.base' ? 400 : 422
        break
      case 'email':
        message = detail.type === 'string.email' ? 'Email incorrect' : 'Email is required'
        statusCode = detail.type === 'string.email' ? 400 : 422
        break
      case 'password':
        message = detail.type === 'string.min' ? 'Password too short (min 8 char)' : 'Password is required'
        break
    }

    return next(new AppError(message, statusCode))
  }
  next()
}

module.exports = validateUser