const bodyParser = require('body-parser')
const cors = require('cors')
const helmet = require('helmet')

module.exports = (app) => {
    app.use(helmet())
    app.use(cors())
    app.use(bodyParser.json())
}