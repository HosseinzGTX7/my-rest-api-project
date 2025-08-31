const userRouter = require('./users')
const sessionRouter = require('./sessions')
const adminRouter = require('./admin')
const forgotPassRouter = require('./forgotPass')

module.exports = (app) => {
    app.use('/api/v1/register', userRouter)
    app.use('/api/v1/auth', sessionRouter)
    app.use('/api/v1/admin', adminRouter)
    app.use('/api/v1/forgotPass', forgotPassRouter)
}