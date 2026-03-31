'use client'
// src/app/annonces/page.tsx

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import ListingCard from '@/components/annonces/ListingCard'
import { useListings } from '@/hooks/useListings'
import { ListingType } from '@/types'
import { Search } from 'lucide-react'
import clsx from 'clsx'

const TYPES: { value: ListingType | ''; label: string }[] = [
  { value: '', label: 'Toutes' },
  { value: 'EMPLOI', label: 'Emplois' },
  { value: 'LOGEMENT', label: 'Logements' },
  { value: 'STAGE', label: 'Stages' },
]

const CITIES = ['Libreville', 'Port-Gentil', 'Franceville', 'Oyem', 'Moanda']

export default function AnnoncesPage() {
  const searchParams = useSearchParams()
  const [search, setSearch] = useState('')
  const [type, setType] = useState<ListingType | ''>(
    (searchParams.get('type') as ListingType) || ''
  )
  const [city, setCity] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useListings({ type: type || undefined, city: city || undefined, search: search || undefined, page })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Barre de recherche */}
      <div className="bg-white border-b border-gray-100 py-4">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                placeholder="Rechercher un poste, un logement..."
                className="input pl-9"
              />
            </div>
            <select
              value={city}
              onChange={(e) => { setCity(e.target.value); setPage(1) }}
              className="input w-auto"
            >
              <option value="">Toutes les villes</option>
              {CITIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          {/* Filtres type */}
          <div className="flex gap-2 mt-3">
            {TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => { setType(t.value as ListingType | ''); setPage(1) }}
                className={clsx(
                  'text-sm px-4 py-1.5 rounded-full border transition-all',
                  type === t.value
                    ? 'bg-brand text-white border-brand'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Résultats */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card p-4 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-1/3 mb-3" />
                <div className="h-5 bg-gray-100 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">
              {data?.pagination.total ?? 0} annonce{(data?.pagination.total ?? 0) > 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data?.listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>

            {/* Pagination */}
            {data && data.pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: data.pagination.totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={clsx(
                      'w-9 h-9 rounded-lg text-sm font-medium transition-all',
                      page === i + 1
                        ? 'bg-brand text-white'
                        : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                    )}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
