// src/index.ts
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'

import authRoutes from './routes/auth.routes'
import listingRoutes from './routes/listing.routes'
import applicationRoutes from './routes/application.routes'
import messageRoutes from './routes/message.routes'
import userRoutes from './routes/user.routes'
import paymentRoutes from './routes/payment.routes'
import { setupSocketHandlers } from './services/socket.service'
import { errorHandler } from './middleware/error.middleware'

dotenv.config()

const app = express()
const httpServer = createServer(app)

// Origines autorisées (dev + production)
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'https://oppgabon.vercel.app',
  'https://oppgabon.ga',
  'https://www.oppgabon.ga',
]

// Socket.io pour la messagerie temps réel
const io = new Server(httpServer, {
  cors: { origin: allowedOrigins, methods: ['GET', 'POST'] },
})

// Middlewares globaux
app.use(helmet())
app.use(cors({ origin: allowedOrigins, credentials: true }))
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Trop de requetes, reessayez dans 15 minutes.',
})
app.use('/api', limiter)

// Routes
app.use('/api/auth',         authRoutes)
app.use('/api/listings',     listingRoutes)
app.use('/api/applications', applicationRoutes)
app.use('/api/messages',     messageRoutes)
app.use('/api/users',        userRoutes)
app.use('/api/payments',     paymentRoutes)

// Health check (utilise par Railway)
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', app: 'OppGabon API', version: '1.0.0', env: process.env.NODE_ENV })
})

// Socket.io handlers
setupSocketHandlers(io)

// Gestion d erreurs
app.use(errorHandler)

// Demarrage — 0.0.0.0 requis pour Railway
const PORT = parseInt(process.env.PORT || '4000', 10)
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`OppGabon API demarree sur le port ${PORT}`)
  console.log(`Environnement : ${process.env.NODE_ENV}`)
})

export { io }
