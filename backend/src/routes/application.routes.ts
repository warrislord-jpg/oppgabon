// src/routes/application.routes.ts
import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

// Postuler à une annonce
router.post('/:listingId', authenticate, async (req: any, res) => {
  try {
    const { listingId } = req.params
    const { coverLetter, cvUrl } = req.body

    const existing = await prisma.application.findUnique({
      where: { listingId_applicantId: { listingId, applicantId: req.user.id } },
    })
    if (existing) {
      return res.status(409).json({ error: 'Candidature déjà envoyée.' })
    }

    const application = await prisma.application.create({
      data: { listingId, applicantId: req.user.id, coverLetter, cvUrl },
    })
    return res.status(201).json(application)
  } catch (err) {
    return res.status(500).json({ error: 'Erreur serveur.' })
  }
})

// Mes candidatures envoyées
router.get('/me', authenticate, async (req: any, res) => {
  const applications = await prisma.application.findMany({
    where: { applicantId: req.user.id },
    include: { listing: { include: { user: { select: { fullName: true, avatarUrl: true } } } } },
    orderBy: { createdAt: 'desc' },
  })
  return res.json(applications)
})

// Candidatures reçues sur mes annonces
router.get('/received', authenticate, async (req: any, res) => {
  const applications = await prisma.application.findMany({
    where: { listing: { userId: req.user.id } },
    include: {
      applicant: { select: { id: true, fullName: true, avatarUrl: true, city: true } },
      listing: { select: { id: true, title: true, type: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return res.json(applications)
})

// Changer le statut d'une candidature (employeur)
router.patch('/:id/status', authenticate, async (req: any, res) => {
  const { status } = req.body
  const updated = await prisma.application.update({
    where: { id: req.params.id },
    data: { status },
  })
  return res.json(updated)
})

export default router
