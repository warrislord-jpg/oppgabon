// src/hooks/useListings.ts
// Hooks React Query pour les annonces

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { Listing, ListingsResponse } from '@/types'
import toast from 'react-hot-toast'

interface ListingsFilters {
  type?: string
  city?: string
  sector?: string
  minPrice?: number
  maxPrice?: number
  search?: string
  page?: number
  limit?: number
}

// ─── Liste des annonces publiques ─────────
export const useListings = (filters: ListingsFilters = {}) => {
  return useQuery<ListingsResponse>({
    queryKey: ['listings', filters],
    queryFn: async () => {
      const { data } = await api.get('/listings', { params: filters })
      return data
    },
    staleTime: 30000,
  })
}

// ─── Détail d'une annonce ─────────────────
export const useListing = (id: string) => {
  return useQuery<Listing>({
    queryKey: ['listing', id],
    queryFn: async () => {
      const { data } = await api.get(`/listings/${id}`)
      return data
    },
    enabled: !!id,
  })
}

// ─── Mes annonces (dashboard) ─────────────
export const useMyListings = () => {
  return useQuery<Listing[]>({
    queryKey: ['my-listings'],
    queryFn: async () => {
      const { data } = await api.get('/listings/me/all')
      return data
    },
  })
}

// ─── Créer une annonce ────────────────────
export const useCreateListing = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (listing: Partial<Listing>) => {
      const { data } = await api.post('/listings', listing)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-listings'] })
      toast.success('Annonce publiée avec succès !')
    },
    onError: (error: any) => {
      const msg = error.response?.data?.error || 'Erreur lors de la publication.'
      if (error.response?.data?.upgrade) {
        toast.error('Limite atteinte. Passez en compte Pro pour publier plus.')
      } else {
        toast.error(msg)
      }
    },
  })
}

// ─── Modifier une annonce ─────────────────
export const useUpdateListing = (id: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updates: Partial<Listing>) => {
      const { data } = await api.put(`/listings/${id}`, updates)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-listings'] })
      queryClient.invalidateQueries({ queryKey: ['listing', id] })
      toast.success('Annonce mise à jour.')
    },
    onError: () => toast.error('Erreur lors de la mise à jour.'),
  })
}

// ─── Supprimer une annonce ────────────────
export const useDeleteListing = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/listings/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-listings'] })
      toast.success('Annonce supprimée.')
    },
    onError: () => toast.error('Erreur lors de la suppression.'),
  })
}
