// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  user?: { id: string; role: string; plan: string }
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant ou invalide.' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string
      role: string
      plan: string
    }
    req.user = decoded
    next()
  } catch {
    return res.status(401).json({ error: 'Token expiré ou invalide.' })
  }
}

export const requireEmployeur = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== 'EMPLOYEUR' && req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Accès réservé aux employeurs.' })
  }
  next()
}

export const requirePro = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.plan !== 'PRO' && req.user?.role !== 'ADMIN') {
    return res.status(403).json({
      error: 'Cette fonctionnalité nécessite un compte Pro.',
      upgrade: true,
    })
  }
  next()
}
