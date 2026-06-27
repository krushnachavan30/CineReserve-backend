const Redis = require('ioredis')

const redis = new Redis(process.env.REDIS_URL)

redis.on('connect', () => {
  console.log('Redis connected')
})

redis.on('error', (err) => {
  console.log('Redis error:', err)
})
// Test karo
redis.ping().then(res => console.log('Redis ping:', res))
module.exports = redis