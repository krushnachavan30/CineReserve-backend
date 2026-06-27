const express = require('express')
const router = express.Router()
const { getMovies, getMovie } = require('../controllers/movieController')

router.get('/', getMovies)
router.get('/:id', getMovie)

module.exports = router