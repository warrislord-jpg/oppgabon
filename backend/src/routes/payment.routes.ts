// src/routes/payment.routes.ts
import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

const PRICES = {
  BOOST_7J: 5000,
  BOOST_30J: 15000,
  PRO_MENSUEL: 25000,
}

// Initier un paiement Mobile Money
router.post('/initiate', authenticate, async (req: any, res) => {
  const { type, listingId, provider, phone } = req.body

  const amount = PRICES[type as keyof typeof PRICES]
  if (!amount) return res.status(400).json({ error: 'Type de paiement invalide.' })

  // Créer la transaction en attente
  const payment = await prisma.payment.create({
    data: {
      userId: req.user.id,
      listingId,
      amount,
      type,
      provider,
      status: 'PENDING',
    },
  })

  // TODO Phase 2 : appel API Airtel Money / Moov Money
  // Pour l'instant, retourner les infos pour intégration manuelle
  return res.json({
    payment,
    instructions: {
      provider,
      amount,
      phone: '+241 XX XX XX XX', // numéro marchand OppGabon
      reference: payment.id,
      message: `Envoyer ${amount} FCFA via ${provider} avec la référence ${payment.id}`,
    },
  })
})

// Confirmer un paiement (webhook ou admin)
router.post('/confirm/:id', authenticate, async (req: any, res) => {
  const payment = await prisma.payment.update({
    where: { id: req.params.id },
    data: { status: 'SUCCESS', externalRef: req.body.externalRef },
  })

  // Activer le boost ou le plan Pro selon le type
  if (payment.type === 'BOOST_7J' && payment.listingId) {
    const until = new Date()
    until.setDate(until.getDate() + 7)
    await prisma.listing.update({
      where: { id: payment.listingId },
      data: { boostedUntil: until },
    })
  } else if (payment.type === 'BOOST_30J' && payment.listingId) {
    const until = new Date()
    until.setDate(until.getDate() + 30)
    await prisma.listing.update({
      where: { id: payment.listingId },
      data: { boostedUntil: until },
    })
  } else if (payment.type === 'PRO_MENSUEL') {
    await prisma.user.update({
      where: { id: payment.userId },
      data: { plan: 'PRO' },
    })
  }

  return res.json({ success: true, payment })
})

export default router
