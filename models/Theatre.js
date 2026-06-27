const mongoose = require('mongoose')

const theatreSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  address: { type: String, required: true },
  totalSeats: { type: Number, required: true },
  rows: { type: Number, required: true },    // kitni rows hain
  seatsPerRow: { type: Number, required: true } // har row mein kitni seats
}, { timestamps: true })

theatreSchema.index({ city: 1 })

module.exports = mongoose.model('Theatre', theatreSchema)