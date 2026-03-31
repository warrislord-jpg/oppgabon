'use client'
// src/app/annonces/[id]/page.tsx

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { useListing } from '@/hooks/useListings'
import { useApply } from '@/hooks/useApplications'
import { useAuthStore } from '@/lib/auth.store'
import {
  formatPrice, formatDate, LISTING_TYPE_LABELS,
  ListingType,
} from '@/types'
import {
  MapPin, Clock, Users, Eye, Briefcase, GraduationCap,
  Heart, Share2, ChevronLeft, CheckCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'

const TYPE_TAG: Record<ListingType, string> = {
  EMPLOI:   'tag-emploi',
  STAGE:    'tag-stage',
  LOGEMENT: 'tag-logement',
}

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const { data: listing, isLoading } = useListing(id)
  const applyMutation = useApply(id)

  const [saved, setSaved] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [applied, setApplied] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')

  const handleApply = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }
    try {
      await applyMutation.mutateAsync({ coverLetter })
      setApplied(true)
      setShowModal(false)
    } catch {
      // erreur gérée dans le hook
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-8 animate-pulse">
          <div className="h-8 bg-gray-100 rounded w-2/3 mb-4" />
          <div className="h-4 bg-gray-100 rounded w-1/3 mb-8" />
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-4">
              <div className="h-32 bg-gray-100 rounded-lg" />
              <div className="h-48 bg-gray-100 rounded-lg" />
            </div>
            <div className="h-64 bg-gray-100 rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center py-20 text-gray-400">
          Annonce introuvable.{' '}
          <Link href="/annonces" className="text-brand hover:underline">Retour aux annonces</Link>
        </div>
      </div>
    )
  }

  const isOwner = user?.id === listing.userId
  const isLogement = listing.type === 'LOGEMENT'

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100 py-2.5">
        <div className="max-w-5xl mx-auto px-4 flex items-center gap-2 text-xs text-gray-400">
          <button onClick={() => router.back()} className="flex items-center gap-1 hover:text-brand">
            <ChevronLeft size={12} /> Retour
          </button>
          <span>/</span>
          <Link href="/annonces" className="hover:text-brand">Annonces</Link>
          <span>/</span>
          <span className="text-gray-600 truncate max-w-48">{listing.title}</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── COLONNE GAUCHE ── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Hero */}
            <div className="card p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4">
                  <div className="w-14 h-14 rounded-xl bg-brand-50 flex items-center justify-center text-2xl flex-shrink-0 border border-gray-100">
                    {isLogement ? '🏠' : listing.type === 'STAGE' ? '🎓' : '🏥'}
                  </div>
                  <div>
                    <span className={TYPE_TAG[listing.type]}>
                      {LISTING_TYPE_LABELS[listing.type]}
                      {listing.contractType && ` · ${listing.contractType}`}
                    </span>
                    <h1 className="text-xl font-serif text-gray-900 mt-1.5 leading-tight">
                      {listing.title}
                    </h1>
                    <p className="text-brand font-medium text-sm mt-1">
                      {listing.user.fullName}
                      {listing.user.isVerified && (
                        <span className="ml-1 text-xs text-brand-400">✓ Vérifié</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => setSaved(!saved)}
                    className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${
                      saved
                        ? 'bg-accent-50 border-accent text-accent'
                        : 'border-gray-200 text-gray-400 hover:border-accent hover:text-accent'
                    }`}
                  >
                    <Heart size={14} fill={saved ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href)
                      toast.success('Lien copié !')
                    }}
                    className="w-9 h-9 rounded-full border border-gray-200 text-gray-400 flex items-center justify-center hover:border-gray-300"
                  >
                    <Share2 size={14} />
                  </button>
                </div>
              </div>

              {/* Infos rapides */}
              <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-gray-50">
                <div className="text-center">
                  <div className="text-xs text-gray-400 mb-1 flex items-center justify-center gap-1">
                    <MapPin size={11} /> Lieu
                  </div>
                  <div className="text-sm font-medium text-gray-700">
                    {listing.city}{listing.quartier && ` · ${listing.quartier}`}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-400 mb-1 flex items-center justify-center gap-1">
                    <Clock size={11} /> Publié
                  </div>
                  <div className="text-sm font-medium text-gray-700">
                    {formatDate(listing.createdAt)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-400 mb-1 flex items-center justify-center gap-1">
                    <Eye size={11} /> Vues
                  </div>
                  <div className="text-sm font-medium text-gray-700">
                    {listing.viewCount}
                  </div>
                </div>
                {listing.education && (
                  <div className="text-center">
                    <div className="text-xs text-gray-400 mb-1 flex items-center justify-center gap-1">
                      <GraduationCap size={11} /> Niveau
                    </div>
                    <div className="text-sm font-medium text-gray-700">{listing.education}</div>
                  </div>
                )}
                {listing.experience && (
                  <div className="text-center">
                    <div className="text-xs text-gray-400 mb-1 flex items-center justify-center gap-1">
                      <Briefcase size={11} /> Expérience
                    </div>
                    <div className="text-sm font-medium text-gray-700">{listing.experience}</div>
                  </div>
                )}
                {listing._count && (
                  <div className="text-center">
                    <div className="text-xs text-gray-400 mb-1 flex items-center justify-center gap-1">
                      <Users size={11} /> Candidatures
                    </div>
                    <div className="text-sm font-medium text-gray-700">
                      {listing._count.applications}
                    </div>
                  </div>
                )}
              </div>

              {/* Tags */}
              {listing.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {listing.tags.map((tag) => (
                    <span key={tag} className="text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="card p-5">
              <h2 className="font-medium text-gray-900 mb-3 pb-3 border-b border-gray-50">
                Description
              </h2>
              <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {listing.description}
              </div>
            </div>

            {/* Logement — équipements */}
            {isLogement && listing.amenities && listing.amenities.length > 0 && (
              <div className="card p-5">
                <h2 className="font-medium text-gray-900 mb-3 pb-3 border-b border-gray-50">
                  Équipements inclus
                </h2>
                <div className="grid grid-cols-2 gap-2">
                  {listing.amenities.map((a) => (
                    <div key={a} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle size={13} className="text-brand flex-shrink-0" />
                      {a}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Entreprise */}
            <div className="card p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center text-xl flex-shrink-0">
                {isLogement ? '🏠' : '🏢'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm">{listing.user.fullName}</p>
                <p className="text-xs text-gray-400 mt-0.5">{listing.user.city}</p>
              </div>
            </div>
          </div>

          {/* ── COLONNE DROITE ── */}
          <div className="space-y-4">

            {/* Carte postuler — sticky */}
            <div className="card p-5 lg:sticky lg:top-20">
              {listing.price ? (
                <>
                  <div className="text-2xl font-serif text-brand mb-0.5">
                    {formatPrice(listing.price)}
                  </div>
                  <div className="text-xs text-gray-400 mb-4">/mois</div>
                </>
              ) : (
                <div className="text-base font-medium text-gray-600 mb-4">
                  Salaire à négocier
                </div>
              )}

              {listing.deadline && (
                <p className="text-xs text-accent font-medium mb-4">
                  ⏰ Clôture le {new Date(listing.deadline).toLocaleDateString('fr-FR')}
                </p>
              )}

              {applied ? (
                <div className="bg-brand-50 text-brand-600 text-sm font-medium px-4 py-3 rounded-lg text-center flex items-center justify-center gap-2">
                  <CheckCircle size={15} />
                  Candidature envoyée !
                </div>
              ) : isOwner ? (
                <Link
                  href={`/dashboard/annonces/${listing.id}/edit`}
                  className="btn-secondary w-full text-center block"
                >
                  Modifier l'annonce
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => isAuthenticated ? setShowModal(true) : router.push('/auth/login')}
                    className="btn-primary w-full py-3 mb-2"
                  >
                    {isLogement ? 'Contacter le propriétaire' : 'Postuler maintenant'}
                  </button>
                  <button
                    onClick={() => setSaved(!saved)}
                    className="btn-secondary w-full py-2.5 text-sm"
                  >
                    {saved ? '♥ Sauvegardé' : '♡ Sauvegarder'}
                  </button>
                </>
              )}

              <div className="mt-4 pt-4 border-t border-gray-50 space-y-2">
                {[
                  ['Type', listing.contractType || listing.roomType || '—'],
                  ['Ville', listing.city],
                  ...(listing.sector ? [['Secteur', listing.sector]] : []),
                  ...(listing.furnished !== undefined ? [['Meublé', listing.furnished ? 'Oui' : 'Non']] : []),
                  ...(listing.surface ? [['Surface', `${listing.surface} m²`]] : []),
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between text-xs">
                    <span className="text-gray-400">{label}</span>
                    <span className="font-medium text-gray-700">{value}</span>
                  </div>
                ))}
              </div>

              <p className="text-xs text-gray-400 text-center mt-4">
                {listing.viewCount} vues · {listing._count?.applications ?? 0} candidatures
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── MODAL POSTULER ── */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="font-serif text-lg text-gray-900 mb-1">
              {isLogement ? 'Contacter le propriétaire' : 'Postuler à cette offre'}
            </h3>
            <p className="text-xs text-gray-400 mb-5">
              {listing.title} · {listing.user.fullName}
            </p>

            <div className="space-y-4">
              <div>
                <label className="label">
                  {isLogement ? 'Votre message' : 'Lettre de motivation'}{' '}
                  <span className="text-gray-400 font-normal">(optionnel)</span>
                </label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  className="input resize-none h-28"
                  placeholder={
                    isLogement
                      ? 'Bonjour, je suis intéressé par votre logement...'
                      : 'Présentez-vous brièvement et expliquez votre intérêt...'
                  }
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="btn-secondary flex-1"
                  disabled={applyMutation.isPending}
                >
                  Annuler
                </button>
                <button
                  onClick={handleApply}
                  className="btn-primary flex-1"
                  disabled={applyMutation.isPending}
                >
                  {applyMutation.isPending ? 'Envoi...' : 'Envoyer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
