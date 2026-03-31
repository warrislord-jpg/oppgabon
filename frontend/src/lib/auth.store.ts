// src/lib/auth.store.ts
// État global d'authentification — Zustand

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from './api'

export interface User {
  id: string
  email: string
  fullName: string
  role: 'CANDIDAT' | 'EMPLOYEUR' | 'ADMIN'
  plan: 'FREE' | 'PRO'
  avatarUrl?: string
  city?: string
  isVerified?: boolean
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean

  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  updateUser: (user: Partial<User>) => void
}

interface RegisterData {
  email: string
  password: string
  fullName: string
  role: 'CANDIDAT' | 'EMPLOYEUR'
  phone?: string
  city?: string
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const { data } = await api.post('/auth/login', { email, password })
          localStorage.setItem('oppgabon_token', data.token)
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
          })
        } finally {
          set({ isLoading: false })
        }
      },

      register: async (registerData) => {
        set({ isLoading: true })
        try {
          const { data } = await api.post('/auth/register', registerData)
          localStorage.setItem('oppgabon_token', data.token)
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
          })
        } finally {
          set({ isLoading: false })
        }
      },

      logout: () => {
        localStorage.removeItem('oppgabon_token')
        set({ user: null, token: null, isAuthenticated: false })
      },

      updateUser: (updates) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }))
      },
    }),
    {
      name: 'oppgabon_auth',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
)
