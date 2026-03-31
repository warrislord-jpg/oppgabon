// src/routes/message.routes.ts
import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

// Mes conversations
router.get('/conversations', authenticate, async (req: any, res) => {
  const conversations = await prisma.conversation.findMany({
    where: { OR: [{ userAId: req.user.id }, { userBId: req.user.id }] },
    include: {
      listing: { select: { id: true, title: true, type: true } },
      userA: { select: { id: true, fullName: true, avatarUrl: true } },
      userB: { select: { id: true, fullName: true, avatarUrl: true } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
    orderBy: { createdAt: 'desc' },
  })
  return res.json(conversations)
})

// Messages d'une conversation
router.get('/conversations/:id', authenticate, async (req: any, res) => {
  const messages = await prisma.message.findMany({
    where: { conversationId: req.params.id },
    include: { sender: { select: { id: true, fullName: true, avatarUrl: true } } },
    orderBy: { createdAt: 'asc' },
  })

  // Marquer comme lus
  await prisma.message.updateMany({
    where: { conversationId: req.params.id, senderId: { not: req.user.id }, readAt: null },
    data: { readAt: new Date() },
  })

  return res.json(messages)
})

// Créer ou récupérer une conversation (depuis une annonce)
router.post('/conversations', authenticate, async (req: any, res) => {
  const { listingId, recipientId } = req.body
  const userId = req.user.id

  const existing = await prisma.conversation.findFirst({
    where: {
      listingId,
      OR: [
        { userAId: userId, userBId: recipientId },
        { userAId: recipientId, userBId: userId },
      ],
    },
  })
  if (existing) return res.json(existing)

  const conversation = await prisma.conversation.create({
    data: { listingId, userAId: userId, userBId: recipientId },
  })
  return res.status(201).json(conversation)
})

export default router
