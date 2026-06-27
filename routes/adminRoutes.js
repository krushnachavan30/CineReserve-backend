const express = require('express')
const router = express.Router()
const {
  createMovie,
  createTheatre,
  createShow,
  getDashboardStats,
  getAllBookings
} = require('../controllers/adminController')
const { protect, adminOnly } = require('../middleware/authMiddleware')

router.use(protect)
router.use(adminOnly)

router.get('/dashboard', getDashboardStats)
router.post('/movies', createMovie)
router.post('/theatres', createTheatre)
router.post('/shows', createShow)
router.get('/bookings', getAllBookings)

module.exports = router