const express = require('express')
const router = express.Router()
const usersController = require('../controllers/usersController')
const auth = require('../middlewares/auth')

//[auth] braye har kodom az router ha mishe mojaza gozasht k fght roye on amal kne.
router.get('/', [auth],usersController.usersList)
router.post('/', usersController.addUser)
router.get('/:id', [auth], usersController.getUser)
router.delete('/:id', [auth],usersController.removeUser)
router.patch('/:id', [auth],usersController.updateUser)

module.exports = router