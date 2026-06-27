const Movie = require('../models/Movie')
const Show = require('../models/Show')
const Theatre = require('../models/Theatre')
const Booking = require('../models/Booking')
const redis = require('../config/redis')

// Movie add karo
const createMovie = async (req, res) => {
  try {
    const movie = await Movie.create(req.body)

    // Movies cache clear karo
    const keys = await redis.keys('movies:*')
    if (keys.length > 0) await redis.del(...keys)

    res.status(201).json({ message: 'Movie created', movie })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Theatre add karo
const createTheatre = async (req, res) => {
  try {
    const theatre = await Theatre.create(req.body)
    res.status(201).json({ message: 'Theatre created', theatre })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Show add karo
const createShow = async (req, res) => {
  try {
    const { movieId, theatreId, showTime, price } = req.body

    const theatre = await Theatre.findById(theatreId)
    if (!theatre) {
      return res.status(404).json({ message: 'Theatre not found' })
    }

    const show = await Show.create({
      movie: movieId,
      theatre: theatreId,
      showTime,
      price,
      totalSeats: theatre.totalSeats,
      bookedSeats: []
    })

    // Shows cache clear karo
    await redis.del(`shows:${movieId}`)

    res.status(201).json({ message: 'Show created', show })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const [totalMovies, totalBookings, totalTheatres] = await Promise.all([
      Movie.countDocuments(),
      Booking.countDocuments({ status: 'confirmed' }),
      Theatre.countDocuments()
    ])

    const revenue = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ])

    res.status(200).json({
      totalMovies,
      totalBookings,
      totalTheatres,
      totalRevenue: revenue[0]?.total || 0
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Sabhi bookings
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })

    res.status(200).json(bookings)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { createMovie, createTheatre, createShow, getDashboardStats, getAllBookings }