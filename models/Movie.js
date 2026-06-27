const mongoose = require('mongoose')

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  genre: [{
    type: String,
    enum: ['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Thriller', 'Sci-Fi']
  }],
  duration: { type: Number, required: true }, // minutes mein
  language: { type: String, required: true },
  releaseDate: { type: Date, required: true },
  poster: { type: String, required: true },
  rating: { type: Number, default: 0, min: 0, max: 10 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true })

// DB Indexing — fast search ke liye
movieSchema.index({ title: 1 })
movieSchema.index({ genre: 1 })
movieSchema.index({ isActive: 1 })

module.exports = mongoose.model('Movie', movieSchema)