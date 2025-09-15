const express = require('express')
const app = express()
const cookieParser = require('cookie-parser')
const notFound = require('./middlewares/notFound')
const errorHandler = require('./middlewares/errorHandler')

require('./boot')
require('./middlewares')(app)
require('./routes')(app)

app.use(cookieParser())
app.use(notFound)
app.use(errorHandler)

module.exports = (port) => {
    app.listen(port, () => {
        console.log(`app is running on port: ${port}`)
    })
}