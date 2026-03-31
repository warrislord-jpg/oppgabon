# OppGabon — Plateforme emploi & logement

Marketplace double marché pour le Gabon : emplois, stages et logements.

## Stack technique

| Couche | Tech |
|--------|------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, React Query |
| Backend | Node.js, Express, TypeScript |
| Base de données | PostgreSQL via Prisma ORM |
| Cache | Redis |
| Fichiers | Cloudinary |
| Temps réel | Socket.io |
| Paiements | Airtel Money, Moov Money |
| Déploiement | Vercel (front) + Railway (back) + Supabase (DB) |

## Structure du projet

```
oppgabon/
├── frontend/          # Next.js app
│   └── src/
│       ├── app/       # Routes Next.js App Router
│       ├── components/
│       ├── lib/       # Helpers, API client
│       ├── hooks/     # Custom React hooks
│       └── types/     # Types TypeScript partagés
└── backend/           # API Express
    ├── src/
    │   ├── controllers/
    │   ├── routes/
    │   ├── middleware/
    │   ├── services/
    │   └── utils/
    └── prisma/        # Schéma DB + migrations
```

## Démarrage rapide

```bash
# Backend
cd backend && npm install && npm run dev

# Frontend
cd frontend && npm install && npm run dev
```

## Variables d'environnement

Copier `.env.example` → `.env` dans chaque dossier.
