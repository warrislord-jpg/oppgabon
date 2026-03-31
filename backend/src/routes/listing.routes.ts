// src/routes/listing.routes.ts
import { Router } from 'express'
import {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  getMyListings,
} from '../controllers/listing.controller'
import { authenticate } from '../middleware/auth.middleware'

const router = Router()

// Routes publiques
router.get('/', getListings)
router.get('/:id', getListingById)

// Routes protégées
router.get('/me/all', authenticate, getMyListings)
router.post('/', authenticate, createListing)
router.put('/:id', authenticate, updateListing)
router.delete('/:id', authenticate, deleteListing)

export default router
