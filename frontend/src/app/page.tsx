// src/app/page.tsx
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { Search } from 'lucide-react'

const STATS = [
  { value: '1 240', label: 'annonces actives' },
  { value: '380',   label: 'entreprises inscrites' },
  { value: '210',   label: 'logements disponibles' },
]

const PORTALS = [
  {
    href: '/annonces?type=EMPLOI',
    icon: '💼',
    label: 'Offres d\'emploi',
    desc: 'CDI, CDD, temps partiel — postulez en un clic',
    tag: null,
    color: 'hover:border-accent-200',
  },
  {
    href: '/annonces?type=LOGEMENT',
    icon: '🏠',
    label: 'Logements',
    desc: 'Sous-location, cession de bail, location longue durée',
    tag: 'Nouveau',
    color: 'hover:border-brand-200',
  },
  {
    href: '/annonces?type=STAGE',
    icon: '🎓',
    label: 'Stages & alternances',
    desc: 'Trouvez un stage dans votre domaine',
    tag: null,
    color: 'hover:border-green-200',
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* ── HERO ── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-600 text-xs font-medium px-4 py-2 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-brand inline-block" />
            La plateforme tout-en-un du Gabon
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-gray-900 leading-tight mb-4">
            Trouve un emploi, un stage<br />
            ou un <span className="text-brand italic">logement disponible</span>
          </h1>
          <p className="text-gray-500 max-w-lg mx-auto mb-8 leading-relaxed">
            Employeurs, locataires et candidats — tout le monde y trouve son compte
            sur une seule plateforme pensée pour le marché gabonais.
          </p>

          {/* Barre de recherche */}
          <div className="flex gap-3 max-w-xl mx-auto mb-4 flex-wrap sm:flex-nowrap">
            <select className="input w-auto flex-shrink-0">
              <option>Emploi</option>
              <option>Stage</option>
              <option>Logement</option>
            </select>
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="input pl-9 w-full" placeholder="Poste, lieu, quartier..." />
            </div>
            <Link href="/annonces" className="btn-primary flex-shrink-0 flex items-center gap-2">
              Rechercher
            </Link>
          </div>

          {/* Stats */}
          <div className="flex gap-8 justify-center flex-wrap mt-10">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-medium text-gray-900">{s.value}</div>
                <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3 PORTAILS ── */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="font-serif text-2xl text-gray-900 mb-2">Trois espaces, une seule adresse</h2>
          <p className="text-sm text-gray-500">Chaque type d'utilisateur a son espace dédié</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PORTALS.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              className={`card p-5 transition-all group ${p.color}`}
            >
              {p.tag && (
                <span className="text-xs bg-brand-50 text-brand-600 font-medium px-2.5 py-1 rounded-lg mb-3 inline-block">
                  {p.tag}
                </span>
              )}
              <div className="text-3xl mb-3">{p.icon}</div>
              <h3 className="font-medium text-gray-900 mb-1.5 group-hover:text-brand transition-colors">
                {p.label}
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">{p.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <div className="bg-brand rounded-2xl p-8 md:p-12 text-center">
          <h2 className="font-serif text-2xl md:text-3xl text-white mb-3">
            Rejoignez OppGabon aujourd'hui
          </h2>
          <p className="text-brand-100 text-sm mb-8 max-w-md mx-auto">
            Gratuit pour commencer. Des milliers d'opportunités vous attendent.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              href="/auth/register"
              className="bg-white text-brand font-medium px-6 py-3 rounded-full hover:bg-gray-50 transition-colors text-sm"
            >
              Créer un compte gratuit
            </Link>
            <Link
              href="/annonces"
              className="bg-transparent text-white font-medium px-6 py-3 rounded-full border border-white/40 hover:bg-white/10 transition-colors text-sm"
            >
              Parcourir les annonces →
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
