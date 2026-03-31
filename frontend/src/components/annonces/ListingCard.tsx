'use client'
// src/components/annonces/ListingCard.tsx

import Link from 'next/link'
import { Listing, formatPrice, formatDate, LISTING_TYPE_LABELS } from '@/types'
import { MapPin, Clock, Users } from 'lucide-react'
import clsx from 'clsx'

interface ListingCardProps {
  listing: Listing
  compact?: boolean
}

const TYPE_STYLES = {
  EMPLOI:   'tag-emploi',
  STAGE:    'tag-stage',
  LOGEMENT: 'tag-logement',
}

export default function ListingCard({ listing, compact = false }: ListingCardProps) {
  const isBoosted = listing.boostedUntil && new Date(listing.boostedUntil) > new Date()

  return (
    <Link href={`/annonces/${listing.id}`}>
      <div
        className={clsx(
          'card p-4 hover:border-gray-200 hover:shadow-sm transition-all duration-150 cursor-pointer group',
          isBoosted && 'border-brand-100 ring-1 ring-brand-100'
        )}
      >
        {/* Badge boosté */}
        {isBoosted && (
          <div className="flex items-center gap-1 mb-2">
            <span className="text-xs bg-amber-50 text-amber-700 font-medium px-2 py-0.5 rounded">
              ⭐ Mis en avant
            </span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <span className={TYPE_STYLES[listing.type]}>
              {LISTING_TYPE_LABELS[listing.type]}
              {listing.contractType && ` · ${listing.contractType}`}
            </span>
            <h3 className="font-medium text-gray-900 mt-1.5 group-hover:text-brand transition-colors line-clamp-2">
              {listing.title}
            </h3>
            <p className="text-sm text-brand font-medium mt-0.5">
              {listing.user.fullName}
              {listing.user.isVerified && (
                <span className="ml-1 text-xs text-brand-400">✓</span>
              )}
            </p>
          </div>
        </div>

        {/* Méta */}
        <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
          <span className="flex items-center gap-1">
            <MapPin size={11} />
            {listing.city}{listing.quartier && ` · ${listing.quartier}`}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {formatDate(listing.createdAt)}
          </span>
          {listing._count && (
            <span className="flex items-center gap-1">
              <Users size={11} />
              {listing._count.applications}
            </span>
          )}
        </div>

        {/* Prix */}
        <div className="flex items-center justify-between">
          <span className="text-base font-medium text-brand">
            {formatPrice(listing.price)}
            {listing.price && (
              <span className="text-xs text-gray-400 font-normal ml-1">/mois</span>
            )}
          </span>
          <span className="text-xs text-brand bg-brand-50 px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
            Voir →
          </span>
        </div>

        {/* Tags */}
        {!compact && listing.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-50">
            {listing.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
