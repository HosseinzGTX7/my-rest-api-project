const express = require('express')
const app = express()

require('./boot')
require('./middlewares')(app)
require('./routes')(app)

app.use((req, res) => {
  res.status(404).json({
    Success: 'false',
    Status: '404',
    Message: `Route ${req.originalUrl} not found on this server!`
  })
})

const errorHandler = require('./middlewares/errorHandler')
app.use(errorHandler)

module.exports = (port) => {
    app.listen(port, () => {
        console.log(`app is running on port: ${port}`)
    })
}