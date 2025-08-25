const express = require('express')
const app = express()

require('./boot')
require('./middlewares')(app)
require('./routes')(app)

app.use((req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `Route ${req.originalUrl} not found on this server! (404)`
  })
})

const errorHandler = require('./middlewares/errorHandler')
app.use(errorHandler)

module.exports = (port) => {
    app.listen(port, () => {
        console.log(`app is running on port: ${port}`)
    })
}