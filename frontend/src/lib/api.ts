// src/lib/api.ts
// Client HTTP centralisé — toutes les requêtes passent ici

import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

// Injecter le token JWT automatiquement
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('oppgabon_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Gérer les erreurs globalement
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré → déconnexion
      if (typeof window !== 'undefined') {
        localStorage.removeItem('oppgabon_token')
        localStorage.removeItem('oppgabon_user')
        window.location.href = '/auth/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
