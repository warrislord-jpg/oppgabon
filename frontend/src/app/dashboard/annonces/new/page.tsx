'use client'
// src/app/dashboard/annonces/new/page.tsx

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { useCreateListing } from '@/hooks/useListings'
import { ListingType } from '@/types'
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react'
import clsx from 'clsx'

// ── Schéma de validation ──────────────────
const schema = z.object({
  type:         z.enum(['EMPLOI', 'STAGE', 'LOGEMENT']),
  title:        z.string().min(5, 'Titre trop court (min 5 caractères)'),
  description:  z.string().min(30, 'Description trop courte (min 30 caractères)'),
  city:         z.string().min(1, 'Ville requise'),
  quartier:     z.string().optional(),
  price:        z.string().optional(),
  // Emploi / Stage
  contractType: z.string().optional(),
  sector:       z.string().optional(),
  experience:   z.string().optional(),
  education:    z.string().optional(),
  // Logement
  roomType:     z.string().optional(),
  furnished:    z.boolean().optional(),
  surface:      z.string().optional(),
})

type FormData = z.infer<typeof schema>

const LISTING_TYPES = [
  { value: 'EMPLOI',   label: 'Offre d\'emploi', icon: '💼', desc: 'CDI, CDD, temps partiel...' },
  { value: 'STAGE',    label: 'Stage / alternance', icon: '🎓', desc: 'Étudiants et jeunes diplômés' },
  { value: 'LOGEMENT', label: 'Logement', icon: '🏠', desc: 'Sous-location, cession de bail' },
]

const CITIES     = ['Libreville', 'Port-Gentil', 'Franceville', 'Oyem', 'Moanda']
const SECTORS    = ['Santé / Médical', 'Finance / Comptabilité', 'Technologie / IT', 'BTP', 'Commerce', 'Éducation', 'Pétrole / Mines', 'Autre']
const CONTRACTS  = ['CDI', 'CDD', 'Stage', 'Temps partiel', 'Freelance']
const ROOM_TYPES = ['Studio', 'F2', 'F3', 'F4', 'F5+', 'Villa', 'Chambre']

const SKILL_TAGS = ['Word / Excel', 'Permis B', 'Anglais', 'Travail en équipe', 'Rigueur', 'BAC+2', 'BAC+3', '2 ans d\'exp.']
const AMENITY_TAGS = ['Meublé', 'Climatisé', 'Eau courante', 'Électricité SEEG', 'Gardiennage', 'Parking', 'Internet', 'Cuisine équipée']

export default function NewListingPage() {
  const router = useRouter()
  const createListing = useCreateListing()

  const [step, setStep] = useState(1)          // 1=type, 2=détails, 3=contact, 4=boost
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [boostOption, setBoostOption] = useState<'FREE' | 'BOOST_7J' | 'BOOST_30J'>('FREE')
  const [published, setPublished] = useState(false)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'EMPLOI' },
  })

  const selectedType = watch('type')
  const isLogement   = selectedType === 'LOGEMENT'

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const onSubmit = async (data: FormData) => {
    try {
      await createListing.mutateAsync({
        ...data,
        price:   data.price ? Number(data.price) : undefined,
        surface: undefined,
        tags: selectedTags,
      } as any)
      setPublished(true)
    } catch {
      // erreur gérée dans le hook
    }
  }

  // ── Écran de succès ───────────────────────
  if (published) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={30} className="text-brand" />
          </div>
          <h2 className="font-serif text-2xl text-gray-900 mb-2">Annonce publiée !</h2>
          <p className="text-sm text-gray-500 mb-8">
            Votre annonce est maintenant visible par tous les utilisateurs d'OppGabon.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => { setPublished(false); setStep(1) }}
              className="btn-secondary"
            >
              Nouvelle annonce
            </button>
            <Link href="/dashboard" className="btn-primary">
              Tableau de bord
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* En-tête */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-600">
            <ChevronLeft size={18} />
          </Link>
          <div>
            <h1 className="font-serif text-xl text-gray-900">Publier une annonce</h1>
            <p className="text-xs text-gray-400 mt-0.5">Gratuit · Visible immédiatement</p>
          </div>
        </div>

        {/* Indicateur d'étapes */}
        <div className="flex items-center gap-2 mb-8">
          {['Type', 'Détails', 'Contact & boost'].map((label, i) => (
            <div key={label} className="flex items-center gap-2 flex-1">
              <div className="flex items-center gap-2">
                <div className={clsx(
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all',
                  step > i + 1 ? 'bg-brand text-white' :
                  step === i + 1 ? 'bg-brand text-white' :
                  'bg-gray-100 text-gray-400'
                )}>
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                <span className={clsx(
                  'text-xs hidden sm:block',
                  step === i + 1 ? 'text-brand font-medium' : 'text-gray-400'
                )}>
                  {label}
                </span>
              </div>
              {i < 2 && <div className={clsx('flex-1 h-px', step > i + 1 ? 'bg-brand' : 'bg-gray-100')} />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>

          {/* ── ÉTAPE 1 : TYPE ── */}
          {step === 1 && (
            <div className="card p-6">
              <h2 className="font-medium text-gray-900 mb-4">Quel type d'annonce ?</h2>
              <div className="grid grid-cols-1 gap-3">
                {LISTING_TYPES.map((t) => (
                  <label
                    key={t.value}
                    className={clsx(
                      'flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all',
                      selectedType === t.value
                        ? 'border-brand bg-brand-50 ring-1 ring-brand'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <input
                      type="radio"
                      value={t.value}
                      {...register('type')}
                      className="sr-only"
                    />
                    <span className="text-2xl">{t.icon}</span>
                    <div>
                      <div className={clsx(
                        'font-medium text-sm',
                        selectedType === t.value ? 'text-brand-600' : 'text-gray-700'
                      )}>
                        {t.label}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">{t.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="btn-primary flex items-center gap-2"
                >
                  Suivant <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* ── ÉTAPE 2 : DÉTAILS ── */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="card p-6 space-y-4">
                <h2 className="font-medium text-gray-900 pb-3 border-b border-gray-50">
                  Informations principales
                </h2>

                <div>
                  <label className="label">Titre de l'annonce <span className="text-accent">*</span></label>
                  <input
                    {...register('title')}
                    className="input"
                    placeholder={
                      isLogement
                        ? 'Ex : F3 meublé — Batterie IV, disponible avril'
                        : 'Ex : Technicien de radiologie CDI'
                    }
                  />
                  {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Ville <span className="text-accent">*</span></label>
                    <select {...register('city')} className="input">
                      <option value="">Sélectionner</option>
                      {CITIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                    {errors.city && <p className="text-xs text-red-600 mt-1">{errors.city.message}</p>}
                  </div>
                  <div>
                    <label className="label">Quartier</label>
                    <input {...register('quartier')} className="input" placeholder="Ex : Batterie IV" />
                  </div>
                </div>

                <div>
                  <label className="label">
                    {isLogement ? 'Loyer (FCFA/mois)' : 'Salaire (FCFA/mois)'}
                  </label>
                  <input
                    {...register('price')}
                    type="number"
                    className="input"
                    placeholder="Ex : 350000"
                  />
                </div>

                {/* Champs spécifiques Emploi/Stage */}
                {!isLogement && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Type de contrat</label>
                      <select {...register('contractType')} className="input">
                        <option value="">Sélectionner</option>
                        {CONTRACTS.map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">Secteur</label>
                      <select {...register('sector')} className="input">
                        <option value="">Sélectionner</option>
                        {SECTORS.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">Expérience requise</label>
                      <input {...register('experience')} className="input" placeholder="Ex : 2 ans minimum" />
                    </div>
                    <div>
                      <label className="label">Niveau d'études</label>
                      <input {...register('education')} className="input" placeholder="Ex : BAC+2 minimum" />
                    </div>
                  </div>
                )}

                {/* Champs spécifiques Logement */}
                {isLogement && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Type de bien</label>
                      <select {...register('roomType')} className="input">
                        <option value="">Sélectionner</option>
                        {ROOM_TYPES.map((r) => <option key={r}>{r}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">Surface (m²)</label>
                      <input {...register('surface')} type="number" className="input" placeholder="Ex : 65" />
                    </div>
                    <div className="col-span-2">
                      <label className="label flex items-center gap-2">
                        <input
                          type="checkbox"
                          onChange={(e) => setValue('furnished', e.target.checked)}
                          className="rounded"
                        />
                        Logement meublé
                      </label>
                    </div>
                  </div>
                )}

                <div>
                  <label className="label">Description <span className="text-accent">*</span></label>
                  <textarea
                    {...register('description')}
                    className="input resize-none h-32"
                    placeholder={
                      isLogement
                        ? 'Décrivez le logement : état, équipements, charges...'
                        : 'Décrivez les missions, responsabilités, l\'environnement de travail...'
                    }
                  />
                  {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description.message}</p>}
                </div>
              </div>

              {/* Tags */}
              <div className="card p-5">
                <label className="label mb-3">
                  {isLogement ? 'Équipements' : 'Compétences requises'}
                  <span className="text-gray-400 font-normal ml-1">(cliquez pour sélectionner)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {(isLogement ? AMENITY_TAGS : SKILL_TAGS).map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={clsx(
                        'text-sm px-3 py-1.5 rounded-full border transition-all',
                        selectedTags.includes(tag)
                          ? 'bg-brand-50 border-brand text-brand-600 font-medium'
                          : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                      )}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary flex items-center gap-2">
                  <ChevronLeft size={15} /> Précédent
                </button>
                <button type="button" onClick={() => setStep(3)} className="btn-primary flex items-center gap-2">
                  Suivant <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* ── ÉTAPE 3 : BOOST ── */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="card p-6">
                <h2 className="font-medium text-gray-900 mb-1">Visibilité de votre annonce</h2>
                <p className="text-xs text-gray-400 mb-5">Choisissez un niveau de mise en avant</p>

                <div className="space-y-3">
                  {[
                    {
                      key: 'FREE',
                      label: 'Standard',
                      price: 'Gratuit',
                      desc: 'Visible dans les résultats normaux',
                      badge: null,
                    },
                    {
                      key: 'BOOST_7J',
                      label: 'Boosté 7 jours',
                      price: '5 000 FCFA',
                      desc: 'En tête de liste · +300% de vues estimées',
                      badge: 'Recommandé',
                    },
                    {
                      key: 'BOOST_30J',
                      label: 'Boosté 30 jours',
                      price: '15 000 FCFA',
                      desc: 'Badge premium + alerte email aux candidats',
                      badge: 'Premium',
                    },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setBoostOption(opt.key as typeof boostOption)}
                      className={clsx(
                        'w-full text-left p-4 rounded-lg border transition-all',
                        boostOption === opt.key
                          ? 'border-brand bg-brand-50 ring-1 ring-brand'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          {opt.badge && (
                            <span className="text-xs bg-amber-50 text-amber-700 font-medium px-2 py-0.5 rounded mb-1 inline-block">
                              {opt.badge}
                            </span>
                          )}
                          <div className={clsx(
                            'font-medium text-sm',
                            boostOption === opt.key ? 'text-brand-600' : 'text-gray-700'
                          )}>
                            {opt.label}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">{opt.desc}</div>
                        </div>
                        <div className={clsx(
                          'text-base font-medium',
                          boostOption === opt.key ? 'text-brand' : 'text-gray-700'
                        )}>
                          {opt.price}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <button type="button" onClick={() => setStep(2)} className="btn-secondary flex items-center gap-2">
                  <ChevronLeft size={15} /> Précédent
                </button>
                <button
                  type="submit"
                  disabled={createListing.isPending}
                  className="btn-primary flex items-center gap-2"
                >
                  {createListing.isPending ? 'Publication...' : 'Publier l\'annonce'}
                  <CheckCircle size={15} />
                </button>
              </div>
            </div>
          )}

        </form>
      </div>
    </div>
  )
}
