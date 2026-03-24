import { cors } from 'hono/cors'

export const corsMiddleware = cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
  exposeHeaders: ['Content-Length', 'X-Total-Count'],
  maxAge: 86400,
  credentials: true,
})

export default corsMiddleware