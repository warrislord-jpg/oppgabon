// prisma/seed.ts
// Données de démonstration pour OppGabon

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding OppGabon...')

  // ── Utilisateurs ──────────────────────────
  const hash = await bcrypt.hash('password123', 12)

  const employeur = await prisma.user.upsert({
    where: { email: 'hopital@jeanne-ebori.ga' },
    update: {},
    create: {
      email: 'hopital@jeanne-ebori.ga',
      passwordHash: hash,
      fullName: 'Hôpital Fondation Jeanne Ebori',
      role: 'EMPLOYEUR',
      plan: 'PRO',
      city: 'Libreville',
      isVerified: true,
    },
  })

  const candidat = await prisma.user.upsert({
    where: { email: 'marie@email.ga' },
    update: {},
    create: {
      email: 'marie@email.ga',
      passwordHash: hash,
      fullName: 'Marie-Blanche Ondo',
      role: 'CANDIDAT',
      city: 'Libreville',
      phone: '+241 06 12 34 56',
    },
  })

  // ── Annonces emploi ───────────────────────
  await prisma.listing.upsert({
    where: { id: 'seed-listing-1' },
    update: {},
    create: {
      id: 'seed-listing-1',
      userId: employeur.id,
      type: 'EMPLOI',
      title: 'Technicien de radiologie',
      description: `L'Hôpital Fondation Jeanne Ebori recherche un technicien de radiologie qualifié pour renforcer son service d'imagerie médicale.

Vous travaillerez en étroite collaboration avec les médecins radiologues et le personnel soignant pour assurer la réalisation des examens d'imagerie médicale dans le respect des protocoles et des normes de radioprotection.`,
      city: 'Libreville',
      price: 480000,
      contractType: 'CDI',
      sector: 'Santé / Médical',
      experience: '2 ans minimum',
      education: 'BAC+2 minimum',
      tags: ['Radiologie', 'Imagerie médicale', 'Scanner TDM', 'Radioprotection'],
      status: 'ACTIVE',
      viewCount: 842,
    },
  })

  await prisma.listing.upsert({
    where: { id: 'seed-listing-2' },
    update: {},
    create: {
      id: 'seed-listing-2',
      userId: employeur.id,
      type: 'STAGE',
      title: 'Stage en développement web — 3 mois',
      description: `StartUp Gabon recherche un stagiaire développeur web motivé pour rejoindre notre équipe sur un projet d'application mobile pour le marché gabonais.

Vous travaillerez sur le développement frontend et backend de notre plateforme, en utilisant les technologies modernes du web.`,
      city: 'Libreville',
      price: 0,
      contractType: 'Stage',
      sector: 'Technologie / IT',
      education: 'Licence en cours',
      tags: ['HTML/CSS', 'JavaScript', 'React', 'Node.js'],
      status: 'ACTIVE',
      viewCount: 364,
    },
  })

  // ── Annonce logement ──────────────────────
  await prisma.listing.upsert({
    where: { id: 'seed-listing-3' },
    update: {},
    create: {
      id: 'seed-listing-3',
      userId: candidat.id,
      type: 'LOGEMENT',
      title: 'F3 meublé — Batterie IV',
      description: `Bel appartement F3 entièrement meublé situé au cœur du quartier Batterie IV à Libreville. L'appartement est en excellent état, climatisé, avec un gardiennage 24h/24.

Charges comprises : eau, électricité SEEG inclus jusqu'à un certain seuil. Caution équivalente à 2 mois de loyer.`,
      city: 'Libreville',
      quartier: 'Batterie IV',
      price: 180000,
      roomType: 'F3',
      furnished: true,
      surface: 75,
      amenities: ['Meublé', 'Climatisé', 'Eau courante', 'Électricité SEEG', 'Gardiennage', 'Parking'],
      tags: ['Meublé', 'Climatisé', 'Gardiennage'],
      status: 'ACTIVE',
      viewCount: 634,
      availableFrom: new Date('2025-04-01'),
    },
  })

  console.log('✅ Seed terminé !')
  console.log('\nComptes de test :')
  console.log('  Employeur : hopital@jeanne-ebori.ga / password123')
  console.log('  Candidat  : marie@email.ga / password123')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
