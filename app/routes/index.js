const userRouter = require('./users')
const sessionRouter = require('./sessions')

module.exports = (app) => {

    app.use('/api/v1', userRouter)
    app.use('/api/v1/login', sessionRouter)
}