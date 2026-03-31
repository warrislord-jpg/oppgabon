// src/controllers/auth.controller.ts
import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ─── Inscription ──────────────────────────
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, fullName, role, phone, city } = req.body

    // Vérifier si l'email existe déjà
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return res.status(409).json({ error: 'Cet email est déjà utilisé.' })
    }

    // Hash du mot de passe
    const passwordHash = await bcrypt.hash(password, 12)

    // Création de l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        role: role || 'CANDIDAT',
        phone,
        city,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        plan: true,
        city: true,
        createdAt: true,
      },
    })

    // Générer le token JWT
    const token = jwt.sign(
      { id: user.id, role: user.role, plan: user.plan },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    return res.status(201).json({
      message: 'Compte créé avec succès.',
      token,
      user,
    })
  } catch (err) {
    console.error('[Auth/register]', err)
    return res.status(500).json({ error: 'Erreur lors de la création du compte.' })
  }
}

// ─── Connexion ────────────────────────────
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect.' })
    }

    const isValid = await bcrypt.compare(password, user.passwordHash)
    if (!isValid) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect.' })
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, plan: user.plan },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    return res.json({
      message: 'Connexion réussie.',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        plan: user.plan,
        avatarUrl: user.avatarUrl,
        city: user.city,
      },
    })
  } catch (err) {
    console.error('[Auth/login]', err)
    return res.status(500).json({ error: 'Erreur lors de la connexion.' })
  }
}

// ─── Profil connecté ─────────────────────
export const me = async (req: Request & { user?: any }, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        plan: true,
        phone: true,
        city: true,
        avatarUrl: true,
        bio: true,
        isVerified: true,
        createdAt: true,
        profile: true,
      },
    })
    return res.json(user)
  } catch (err) {
    return res.status(500).json({ error: 'Erreur serveur.' })
  }
}
