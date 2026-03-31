'use client'
// src/components/layout/Navbar.tsx

import Link from 'next/link'
import { useAuthStore } from '@/lib/auth.store'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="font-serif text-xl text-brand">
          Opp<span className="text-accent">Gabon</span>
        </Link>

        {/* Liens navigation */}
        <div className="hidden md:flex items-center gap-6 text-sm text-gray-500">
          <Link href="/annonces?type=EMPLOI" className="hover:text-brand transition-colors">
            Emplois
          </Link>
          <Link href="/annonces?type=LOGEMENT" className="hover:text-brand transition-colors">
            Logements
          </Link>
          <Link href="/annonces?type=STAGE" className="hover:text-brand transition-colors">
            Stages
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {isAuthenticated && user ? (
            <>
              <Link href="/dashboard" className="btn-secondary text-sm py-2 px-4">
                Tableau de bord
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="btn-secondary text-sm py-2 px-4">
                Connexion
              </Link>
              <Link href="/auth/register" className="btn-primary text-sm py-2 px-4">
                S'inscrire
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
