// src/routes/user.routes.ts
import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

// Mettre à jour son profil
router.put('/me', authenticate, async (req: any, res) => {
  const { fullName, phone, city, bio, avatarUrl } = req.body
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { fullName, phone, city, bio, avatarUrl },
    select: { id: true, fullName: true, phone: true, city: true, bio: true, avatarUrl: true },
  })
  return res.json(user)
})

// Mettre à jour le profil candidat
router.put('/me/profile', authenticate, async (req: any, res) => {
  const profile = await prisma.candidatProfile.upsert({
    where: { userId: req.user.id },
    create: { ...req.body, userId: req.user.id },
    update: req.body,
  })
  return res.json(profile)
})

// Sauvegarder / retirer un favori
router.post('/me/saved/:listingId', authenticate, async (req: any, res) => {
  const { listingId } = req.params
  const userId = req.user.id

  const existing = await prisma.savedListing.findUnique({
    where: { userId_listingId: { userId, listingId } },
  })

  if (existing) {
    await prisma.savedListing.delete({ where: { userId_listingId: { userId, listingId } } })
    return res.json({ saved: false })
  }

  await prisma.savedListing.create({ data: { userId, listingId } })
  return res.json({ saved: true })
})

// Mes favoris
router.get('/me/saved', authenticate, async (req: any, res) => {
  const saved = await prisma.savedListing.findMany({
    where: { userId: req.user.id },
    include: { listing: true },
    orderBy: { createdAt: 'desc' },
  })
  return res.json(saved.map((s) => s.listing))
})

export default router
