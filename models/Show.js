const mongoose = require('mongoose')

const showSchema = new mongoose.Schema({
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true
  },
  theatre: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Theatre',
    required: true
  },
  showTime: { type: Date, required: true },
  price: {
    standard: { type: Number, required: true },
    premium: { type: Number, required: true }
  },
  bookedSeats: [{ type: String }], // ["A1", "A2", "B3"]
  totalSeats: { type: Number, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true })

// Fast search ke liye indexing
showSchema.index({ movie: 1, showTime: 1 })
showSchema.index({ theatre: 1, showTime: 1 })
showSchema.index({ showTime: 1 })

module.exports = mongoose.model('Show', showSchema)