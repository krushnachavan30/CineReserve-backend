const express = require('express')
const router = express.Router()
const { getShows, getShowSeats, lockSeats, unlockSeats } = require('../controllers/showController')
const { protect } = require('../middleware/authMiddleware')

router.get('/movie/:movieId', getShows)
router.get('/:showId/seats', getShowSeats)
router.post('/lock-seats', protect, lockSeats)
router.post('/unlock-seats', protect, unlockSeats)

module.exports = router