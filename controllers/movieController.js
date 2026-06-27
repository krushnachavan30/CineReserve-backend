const Movie = require('../models/Movie')
const redis = require('../config/redis')

// Sabhi movies — Redis cached
const getMovies = async (req, res) => {
  try {
    const { genre, language } = req.query

    // Cache key banao
    const cacheKey = `movies:${genre || 'all'}:${language || 'all'}`

    // Pehle Redis check karo
    const cached = await redis.get(cacheKey)
    if (cached) {
      console.log('Movies from Redis cache')
      return res.status(200).json(JSON.parse(cached))
    }

    // Redis mein nahi hai — DB se lo
    console.log('Movies from MongoDB')
    let filter = { isActive: true }
    if (genre) filter.genre = genre
    if (language) filter.language = language

    const movies = await Movie.find(filter).sort({ releaseDate: -1 })

    // Redis mein save karo — 10 min ke liye
    await redis.setex(cacheKey, 600, JSON.stringify(movies))

    res.status(200).json(movies)

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Ek movie
const getMovie = async (req, res) => {
  try {
    const cacheKey = `movie:${req.params.id}`

    const cached = await redis.get(cacheKey)
    if (cached) {
      return res.status(200).json(JSON.parse(cached))
    }

    const movie = await Movie.findById(req.params.id)
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' })
    }

    await redis.setex(cacheKey, 600, JSON.stringify(movie))

    res.status(200).json(movie)

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { getMovies, getMovie }