const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()
//CineReserve – Scalable Movie Ticket Reservation Platform
const redis = require('./config/redis')  // ← yeh add karo

const authRoutes = require('./routes/authRoutes')
const movieRoutes = require('./routes/movieRoutes')
const showRoutes = require('./routes/showRoutes')
const bookingRoutes = require('./routes/bookingRoutes')
const adminRoutes = require('./routes/adminRoutes')

const app = express()

app.use(cors());
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/movies', movieRoutes)
app.use('/api/shows', showRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/admin', adminRoutes)

// MongoDB connect — Connection Pooling
mongoose.connect(process.env.MONGO_URI, {
  maxPoolSize: 10,
  minPoolSize: 2,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.log(err))

app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'OK',
    instance: process.env.HOSTNAME // Docker container ka naam
  })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))