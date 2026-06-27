const express = require('express')
const router = express.Router()
const { register, login } = require('../controllers/authController')
const rateLimiter = require('../middleware/rateLimiter')

// Login pe rate limiting — 5 attempts per minute
router.post('/register', register)
router.post('/login', rateLimiter(5, 60), login)

module.exports = router