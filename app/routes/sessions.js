const express = require('express')
const router = express.Router()
const Controller = require('../controllers/sessionsController')

router.post('/new', Controller.newSession)
module.exports = router