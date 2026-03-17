import rateLimiter from 'hono-rate-limit'

export const generalRateLimit = rateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 100,
})

export const strictRateLimit = rateLimiter({
  windowMs: 60 * 1000,
  limit: 5,
})

export const authRateLimit = rateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 10,
})

export const adminRateLimit = rateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 50,
})