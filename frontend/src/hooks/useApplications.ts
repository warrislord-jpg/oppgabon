// src/hooks/useApplications.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { Application, ApplicationStatus } from '@/types'
import toast from 'react-hot-toast'

// Mes candidatures envoyées (candidat)
export const useMyApplications = () => {
  return useQuery<Application[]>({
    queryKey: ['my-applications'],
    queryFn: async () => {
      const { data } = await api.get('/applications/me')
      return data
    },
  })
}

// Candidatures reçues (employeur)
export const useReceivedApplications = () => {
  return useQuery<Application[]>({
    queryKey: ['received-applications'],
    queryFn: async () => {
      const { data } = await api.get('/applications/received')
      return data
    },
  })
}

// Postuler à une annonce
export const useApply = (listingId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { coverLetter?: string; cvUrl?: string }) => {
      const { data: res } = await api.post(`/applications/${listingId}`, data)
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-applications'] })
      toast.success('Candidature envoyée avec succès !')
    },
    onError: (error: any) => {
      const msg = error.response?.data?.error || 'Erreur lors de la candidature.'
      toast.error(msg)
    },
  })
}

// Changer le statut d'une candidature (employeur)
export const useUpdateApplicationStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ApplicationStatus }) => {
      const { data } = await api.patch(`/applications/${id}/status`, { status })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['received-applications'] })
      toast.success('Statut mis à jour.')
    },
  })
}
