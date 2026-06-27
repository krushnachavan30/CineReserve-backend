const express = require('express')
const router = express.Router()
const { createBooking, getMyBookings, cancelBooking } = require('../controllers/bookingController')
const { protect } = require('../middleware/authMiddleware')
const rateLimiter = require('../middleware/rateLimiter')

router.use(protect)

// Booking pe rate limiting — 10 requests per minute
router.post('/', rateLimiter(10, 60), createBooking)
router.get('/my-bookings', getMyBookings)
router.put('/cancel/:id', cancelBooking)

module.exports = router