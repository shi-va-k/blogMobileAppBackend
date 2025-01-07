const User = require('../model/User')
const userController = require('../controllers/userController')

const express = require('express')
const router = express.Router()

router.post('/signUp', userController.createNewUser)
router.post('/login', userController.loginUser)
router.get('/getOne/:id', userController.getUser)
router.get('/getAll/', userController.getAllUsers)

module.exports = router