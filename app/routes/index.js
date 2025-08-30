const userRouter = require('./users')
const sessionRouter = require('./sessions')
const forgotPassRouter = require('./forgotPass')

module.exports = (app) => {
    app.use('/api/v1', userRouter)
    app.use('/api/v1/login', sessionRouter)
    app.use('/api/v1/password', forgotPassRouter)
}