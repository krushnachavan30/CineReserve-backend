const mongoose = require('mongoose')

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  show: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Show',
    required: true
  },
  seats: [{ type: String, required: true }], // ["A1", "A2"]
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'confirmed'
  },
  // Show ke time ki details copy karo
  movieTitle: { type: String },
  showTime: { type: Date },
  theatreName: { type: String }
}, { timestamps: true })

bookingSchema.index({ user: 1 })
bookingSchema.index({ show: 1 })

module.exports = mongoose.model('Booking', bookingSchema)