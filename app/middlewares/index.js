const cors = require('cors')
const helmet = require('helmet')
const express = require('express')

module.exports = (app) => {
    app.use(helmet())
    app.use(cors())
    app.use(express.json()) 
    app.use(express.urlencoded({ extended: true }))
}