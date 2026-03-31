// src/middleware/error.middleware.ts
import { Request, Response, NextFunction } from 'express'

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('[Erreur]', err.message)

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message })
  }

  if (err.name === 'PrismaClientKnownRequestError') {
    return res.status(409).json({ error: 'Conflit de données.' })
  }

  return res.status(500).json({ error: 'Erreur serveur interne.' })
}
