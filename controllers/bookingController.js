const Booking = require('../models/Booking')
const Show = require('../models/Show')
const redis = require('../config/redis')

// Booking confirm karo
const createBooking = async (req, res) => {
  try {
    const { showId, seats } = req.body
    const userId = req.user.id

    // Check karo seats locked hain is user ke liye
    for (const seat of seats) {
      const lockKey = `seat-lock:${showId}:${seat}`
      const lockOwner = await redis.get(lockKey)

      if (!lockOwner || lockOwner !== userId) {
        return res.status(400).json({
          message: `Seat ${seat} ka lock expire ho gaya — dobara select karo`
        })
      }
    }

    // Show lo
    const show = await Show.findById(showId)
      .populate('movie', 'title')
      .populate('theatre', 'name')

    if (!show) {
      return res.status(404).json({ message: 'Show not found' })
    }

    // Double check — seats already booked toh nahi?
    const alreadyBooked = seats.filter(seat =>
      show.bookedSeats.includes(seat)
    )

    if (alreadyBooked.length > 0) {
      return res.status(400).json({
        message: 'Kuch seats already booked ho gayi',
        seats: alreadyBooked
      })
    }

    // Total amount calculate karo
    const totalAmount = seats.length * show.price.standard

    // Booking save karo
    const booking = await Booking.create({
      user: userId,
      show: showId,
      seats,
      totalAmount,
      status: 'confirmed',
      movieTitle: show.movie.title,
      showTime: show.showTime,
      theatreName: show.theatre.name
    })

    // Show mein booked seats update karo
    await Show.findByIdAndUpdate(showId, {
      $push: { bookedSeats: { $each: seats } }
    })

    // Redis locks hatao
    for (const seat of seats) {
      const lockKey = `seat-lock:${showId}:${seat}`
      await redis.del(lockKey)
    }

    // Shows cache invalidate karo
    await redis.del(`shows:${show.movie._id}`)

    res.status(201).json({
      message: 'Booking confirmed!',
      booking
    })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// My bookings
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .sort({ createdAt: -1 })

    res.status(200).json(bookings)

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Booking cancel karo
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' })
    }

    if (booking.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' })
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Already cancelled' })
    }

    // Show mein seats wapas karo
    await Show.findByIdAndUpdate(booking.show, {
      $pull: { bookedSeats: { $in: booking.seats } }
    })

    booking.status = 'cancelled'
    await booking.save()

    res.status(200).json({ message: 'Booking cancelled', booking })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { createBooking, getMyBookings, cancelBooking }