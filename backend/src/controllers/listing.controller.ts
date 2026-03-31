// src/controllers/listing.controller.ts
import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth.middleware'

const prisma = new PrismaClient()

// ─── Liste des annonces (avec filtres) ───
export const getListings = async (req: AuthRequest, res: Response) => {
  try {
    const {
      type,
      city,
      sector,
      minPrice,
      maxPrice,
      contractType,
      search,
      page = '1',
      limit = '12',
    } = req.query

    const skip = (Number(page) - 1) * Number(limit)

    const where: any = {
      status: 'ACTIVE',
      ...(type && { type: String(type).toUpperCase() }),
      ...(city && { city: { contains: String(city), mode: 'insensitive' } }),
      ...(sector && { sector: String(sector) }),
      ...(contractType && { contractType: String(contractType) }),
      ...(minPrice && { price: { gte: Number(minPrice) } }),
      ...(maxPrice && { price: { lte: Number(maxPrice) } }),
      ...(search && {
        OR: [
          { title: { contains: String(search), mode: 'insensitive' } },
          { description: { contains: String(search), mode: 'insensitive' } },
        ],
      }),
    }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: {
          user: {
            select: { id: true, fullName: true, avatarUrl: true, isVerified: true },
          },
          _count: { select: { applications: true } },
        },
        orderBy: [
          { boostedUntil: 'desc' }, // annonces boostées en premier
          { createdAt: 'desc' },
        ],
        skip,
        take: Number(limit),
      }),
      prisma.listing.count({ where }),
    ])

    return res.json({
      listings,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    })
  } catch (err) {
    console.error('[Listing/getAll]', err)
    return res.status(500).json({ error: 'Erreur serveur.' })
  }
}

// ─── Détail d'une annonce ─────────────────
export const getListingById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            isVerified: true,
            city: true,
            bio: true,
          },
        },
        _count: { select: { applications: true } },
      },
    })

    if (!listing || listing.status === 'DELETED') {
      return res.status(404).json({ error: 'Annonce introuvable.' })
    }

    // Incrémenter le compteur de vues
    await prisma.listing.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    })

    return res.json(listing)
  } catch (err) {
    return res.status(500).json({ error: 'Erreur serveur.' })
  }
}

// ─── Créer une annonce ────────────────────
export const createListing = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id

    // Vérifier la limite pour les comptes gratuits
    if (req.user!.plan === 'FREE') {
      const currentMonth = new Date()
      currentMonth.setDate(1)
      const count = await prisma.listing.count({
        where: {
          userId,
          createdAt: { gte: currentMonth },
          status: { not: 'DELETED' },
        },
      })
      if (count >= 3) {
        return res.status(403).json({
          error: 'Limite de 3 annonces/mois atteinte avec le compte gratuit.',
          upgrade: true,
        })
      }
    }

    const listing = await prisma.listing.create({
      data: { ...req.body, userId },
    })

    return res.status(201).json(listing)
  } catch (err) {
    console.error('[Listing/create]', err)
    return res.status(500).json({ error: 'Erreur lors de la création.' })
  }
}

// ─── Modifier une annonce ─────────────────
export const updateListing = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user!.id

    const listing = await prisma.listing.findUnique({ where: { id } })
    if (!listing || listing.userId !== userId) {
      return res.status(403).json({ error: 'Non autorisé.' })
    }

    const updated = await prisma.listing.update({
      where: { id },
      data: req.body,
    })

    return res.json(updated)
  } catch (err) {
    return res.status(500).json({ error: 'Erreur serveur.' })
  }
}

// ─── Supprimer (soft delete) ──────────────
export const deleteListing = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user!.id

    const listing = await prisma.listing.findUnique({ where: { id } })
    if (!listing || listing.userId !== userId) {
      return res.status(403).json({ error: 'Non autorisé.' })
    }

    await prisma.listing.update({
      where: { id },
      data: { status: 'DELETED' },
    })

    return res.json({ message: 'Annonce supprimée.' })
  } catch (err) {
    return res.status(500).json({ error: 'Erreur serveur.' })
  }
}

// ─── Mes annonces (dashboard) ─────────────
export const getMyListings = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id

    const listings = await prisma.listing.findMany({
      where: { userId, status: { not: 'DELETED' } },
      include: {
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return res.json(listings)
  } catch (err) {
    return res.status(500).json({ error: 'Erreur serveur.' })
  }
}
