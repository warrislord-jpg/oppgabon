'use client'
// src/app/dashboard/page.tsx

import { useAuthStore } from '@/lib/auth.store'
import { useMyListings } from '@/hooks/useListings'
import { useReceivedApplications } from '@/hooks/useApplications'
import Link from 'next/link'
import { formatPrice, formatDate, LISTING_TYPE_LABELS } from '@/types'
import { Eye, Users, TrendingUp, Home } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { data: listings = [] } = useMyListings()
  const { data: applications = [] } = useReceivedApplications()

  const totalViews = listings.reduce((sum, l) => sum + l.viewCount, 0)
  const activeListings = listings.filter((l) => l.status === 'ACTIVE').length
  const newApplications = applications.filter((a) => a.status === 'PENDING').length

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* En-tête */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-serif text-gray-900">
              Bonjour, {user?.fullName?.split(' ')[0]} 👋
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Compte {user?.plan === 'PRO' ? 'Pro ⭐' : 'gratuit'} · {user?.city}
            </p>
          </div>
          <Link href="/dashboard/annonces/new" className="btn-primary">
            + Nouvelle annonce
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Annonces actives', value: activeListings, icon: Home, color: 'text-brand' },
            { label: 'Vues totales', value: totalViews.toLocaleString(), icon: Eye, color: 'text-blue-600' },
            { label: 'Candidatures', value: applications.length, icon: Users, color: 'text-amber-600' },
            { label: 'Nouvelles', value: newApplications, icon: TrendingUp, color: 'text-accent' },
          ].map((stat) => (
            <div key={stat.label} className="card p-4">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon size={15} className={stat.color} />
                <span className="text-xs text-gray-500">{stat.label}</span>
              </div>
              <div className="text-2xl font-medium text-gray-900">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Mes annonces */}
        <div className="card divide-y divide-gray-50 mb-6">
          <div className="flex items-center justify-between p-4">
            <h2 className="font-medium text-gray-900">Mes annonces</h2>
            <Link href="/dashboard/annonces" className="text-sm text-brand hover:underline">
              Voir tout
            </Link>
          </div>
          {listings.slice(0, 4).map((listing) => (
            <div key={listing.id} className="flex items-center gap-4 p-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{listing.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {LISTING_TYPE_LABELS[listing.type]} · {listing.city} · {formatDate(listing.createdAt)}
                </p>
              </div>
              <div className="text-sm text-gray-500 flex items-center gap-1">
                <Eye size={12} /> {listing.viewCount}
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-lg font-medium ${
                listing.status === 'ACTIVE' ? 'bg-brand-50 text-brand-600' : 'bg-gray-100 text-gray-500'
              }`}>
                {listing.status === 'ACTIVE' ? 'Active' : 'Pausée'}
              </span>
            </div>
          ))}
          {listings.length === 0 && (
            <div className="p-8 text-center text-gray-400 text-sm">
              Aucune annonce pour l'instant.{' '}
              <Link href="/dashboard/annonces/new" className="text-brand hover:underline">
                Publier votre première annonce
              </Link>
            </div>
          )}
        </div>

        {/* Liens rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: '/dashboard/candidatures', label: 'Candidatures', count: newApplications },
            { href: '/dashboard/messages', label: 'Messages', count: 0 },
            { href: '/dashboard/annonces/new', label: '+ Annonce', count: null },
            { href: '/dashboard/profil', label: 'Mon profil', count: null },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="card p-4 text-center hover:border-brand-100 transition-colors group"
            >
              <p className="text-sm font-medium text-gray-700 group-hover:text-brand">{link.label}</p>
              {link.count !== null && link.count > 0 && (
                <span className="text-xs bg-accent text-white rounded-full px-2 py-0.5 mt-1 inline-block">
                  {link.count}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
