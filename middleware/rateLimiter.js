const redis = require('../config/redis')

const rateLimiter = (maxRequests, windowSeconds) => {
  return async (req, res, next) => {
    try {
      const key = `rate-limit:${req.ip}`

      const requests = await redis.incr(key)

      // Pehli request hai toh expiry set karo
      if (requests === 1) {
        await redis.expire(key, windowSeconds)
      }

      // Limit exceed hua?
      if (requests > maxRequests) {
        return res.status(429).json({
          message: `Too many requests. ${windowSeconds} seconds baad try karo.`
        })
      }

      // Header mein remaining requests dikhao
      res.setHeader('X-RateLimit-Limit', maxRequests)
      res.setHeader('X-RateLimit-Remaining', maxRequests - requests)

      next()

    } catch (error) {
      next() // Redis error pe request allow karo
    }
  }
}

module.exports = rateLimiter