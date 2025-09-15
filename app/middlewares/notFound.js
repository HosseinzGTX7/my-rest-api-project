const AppError = require('../utils/appError')

function notFound(req, res, next) {
  next(new AppError(`Route ${req.originalUrl} not found`, 404))
}

module.exports = notFound
