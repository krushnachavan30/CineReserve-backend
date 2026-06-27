//seat locking machanism here
const Show = require('../models/Show')
const redis = require('../config/redis')

// Shows dekho — movie ke liye
const getShows = async (req, res) => {
  try {
    const { movieId } = req.params

    const cacheKey = `shows:${movieId}`

    const cached = await redis.get(cacheKey)
    if (cached) {
      console.log('Shows from Redis cache')
      return res.status(200).json(JSON.parse(cached))
    }

    const shows = await Show.find({ movie: movieId, isActive: true })
      .populate('theatre', 'name city address')
      .populate('movie', 'title duration language')
      .sort({ showTime: 1 })

    await redis.setex(cacheKey, 300, JSON.stringify(shows)) // 5 min cache

    res.status(200).json(shows)

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Show ke available seats dekho
const getShowSeats = async (req, res) => {
  try {
    const { showId } = req.params

    const show = await Show.findById(showId).populate('theatre')
    if (!show) {
      return res.status(404).json({ message: 'Show not found' })
    }

    const { rows, seatsPerRow } = show.theatre

    const allSeats = []
    const rowLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

    for (let i = 0; i < rows; i++) {
      for (let j = 1; j <= seatsPerRow; j++) {
        const seatNumber = `${rowLabels[i]}${j}`
        const isBooked = show.bookedSeats.includes(seatNumber)
        const lockKey = `seat-lock:${showId}:${seatNumber}`
        const isLocked = await redis.get(lockKey)

        allSeats.push({
          seatNumber,
          isBooked,
          isLocked: !!isLocked,
          isAvailable: !isBooked && !isLocked
        })
      }
    }

    res.status(200).json({
      showId,
      price: show.price,        // ← already tha
      totalSeats: show.totalSeats,
      bookedSeats: show.bookedSeats,
      seats: allSeats
    })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Seats lock karo — 10 min ke liye
const lockSeats = async (req, res) => {
  try {
    const { showId, seats } = req.body
    const userId = req.user.id

    if (!seats || seats.length === 0) {
      return res.status(400).json({ message: 'Seats select karo' })
    }

    if (seats.length > 10) {
      return res.status(400).json({ message: 'Maximum 10 seats book kar sakte ho' })
    }

    const show = await Show.findById(showId)
    if (!show) {
      return res.status(404).json({ message: 'Show not found' })
    }

    // Check karo seats available hain kya
    const unavailableSeats = []

    for (const seat of seats) {
      // DB mein booked hai?
      if (show.bookedSeats.includes(seat)) {
        unavailableSeats.push({ seat, reason: 'Already booked' })
        continue
      }

      // Redis mein locked hai?
      const lockKey = `seat-lock:${showId}:${seat}`
      const existingLock = await redis.get(lockKey)

      if (existingLock && existingLock !== userId) {
        unavailableSeats.push({ seat, reason: 'Already selected by someone' })
      }
    }

    if (unavailableSeats.length > 0) {
      return res.status(400).json({
        message: 'Kuch seats available nahi hain',
        unavailableSeats
      })
    }

    // Seats lock karo — 10 min ke liye
    for (const seat of seats) {
      const lockKey = `seat-lock:${showId}:${seat}`
      await redis.setex(lockKey, 600, userId) // 600 seconds = 10 min
    }

    res.status(200).json({
      message: 'Seats locked for 10 minutes',
      seats,
      expiresIn: 600
    })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Seats unlock karo — agar user cancel kare
const unlockSeats = async (req, res) => {
  try {
    const { showId, seats } = req.body
    const userId = req.user.id

    for (const seat of seats) {
      const lockKey = `seat-lock:${showId}:${seat}`
      const lockOwner = await redis.get(lockKey)

      // Sirf apni locked seats unlock kar sakte ho
      if (lockOwner === userId) {
        await redis.del(lockKey)
      }
    }

    res.status(200).json({ message: 'Seats unlocked' })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { getShows, getShowSeats, lockSeats, unlockSeats }