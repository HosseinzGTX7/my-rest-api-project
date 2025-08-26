//khata haye control shode
const errorHandler = (err, req, res, next) => {
  if (err.isOperational) {
    return res.status(200).json({
      Status: err.statusCode,    
      Message: err.message
    })
  }
//khata haye nashenakhte ya bug
  console.error('ERROR', err)
  res.status(500).json({
    success: false,
    statusCode: 500,
    status: 'error',
    message: 'Something went very wrong!'
  })
}

module.exports = errorHandler