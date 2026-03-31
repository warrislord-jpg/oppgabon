# Guide de déploiement OppGabon
## Railway (backend + base de données) + Vercel (frontend)

---

## Vue d'ensemble

```
Internet
   │
   ├── oppgabon.ga          → Vercel (Next.js frontend)
   └── api.oppgabon.ga      → Railway (Node.js backend + PostgreSQL)
```

---

## ÉTAPE 1 — Préparer le backend pour Railway

### 1.1 Ajouter le script de démarrage dans backend/package.json

Modifier la section "scripts" :
```json
"scripts": {
  "dev":        "ts-node-dev --respawn --transpile-only src/index.ts",
  "build":      "tsc",
  "start":      "node dist/index.js",
  "postinstall": "prisma generate",
  "db:migrate": "prisma migrate deploy",
  "db:seed":    "ts-node prisma/seed.ts"
}
```

### 1.2 Créer backend/Procfile (Railway l'utilise)
```
web: npm run build && prisma migrate deploy && npm start
```

### 1.3 Créer backend/.railwayignore
```
node_modules
*.log
.env
dist
```

---

## ÉTAPE 2 — Déployer le backend sur Railway

### 2.1 Créer un compte Railway
→ https://railway.app (connexion avec GitHub recommandée)

### 2.2 Créer un nouveau projet
1. Cliquer "New Project"
2. Choisir "Deploy from GitHub repo"
3. Sélectionner votre repo OppGabon
4. Choisir le dossier racine : `backend`

### 2.3 Ajouter PostgreSQL
Dans votre projet Railway :
1. Cliquer "+ New Service"
2. Choisir "Database" → "PostgreSQL"
3. Railway génère automatiquement la variable `DATABASE_URL`

### 2.4 Configurer les variables d'environnement
Dans Railway → Settings → Variables, ajouter :

```
NODE_ENV=production
JWT_SECRET=votre_secret_tres_long_et_aleatoire_min_32_chars
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://oppgabon.vercel.app
PORT=4000

# Cloudinary (pour les images/fichiers)
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret
```

Note : DATABASE_URL est injectée automatiquement par Railway.

### 2.5 Configurer le domaine
Dans Railway → Settings → Networking :
- "Generate Domain" → Railway donne une URL type `oppgabon-backend.up.railway.app`
- OU configurer votre domaine custom : `api.oppgabon.ga`
  → Ajouter un enregistrement CNAME chez votre registrar :
    `api.oppgabon.ga → oppgabon-backend.up.railway.app`

### 2.6 Déclencher le déploiement
Railway détecte automatiquement les commits sur la branche `main`.
Premier déploiement : cliquer "Deploy" manuellement.

---

## ÉTAPE 3 — Déployer le frontend sur Vercel

### 3.1 Créer un compte Vercel
→ https://vercel.com (connexion avec GitHub recommandée)

### 3.2 Importer le projet
1. "Add New Project"
2. Sélectionner votre repo GitHub
3. Root Directory : `frontend`
4. Framework Preset : Next.js (auto-détecté)

### 3.3 Configurer les variables d'environnement
Dans Vercel → Settings → Environment Variables :

```
NEXT_PUBLIC_API_URL=https://oppgabon-backend.up.railway.app/api
NEXT_PUBLIC_SOCKET_URL=https://oppgabon-backend.up.railway.app
```

### 3.4 Configurer le domaine custom (optionnel)
Dans Vercel → Settings → Domains :
- Ajouter `oppgabon.ga` et `www.oppgabon.ga`
- Vercel donne les enregistrements DNS à configurer chez votre registrar

### 3.5 Déployer
Cliquer "Deploy" — Vercel build et déploie automatiquement.
Chaque `git push` sur `main` redéploie automatiquement.

---

## ÉTAPE 4 — Peupler la base de données

Une fois le backend déployé, exécuter le seed via Railway CLI :

```bash
# Installer Railway CLI
npm install -g @railway/cli

# Se connecter
railway login

# Lancer le seed dans l'environnement Railway
railway run npm run db:seed
```

OU via l'interface Railway :
Settings → "Run Command" → `npm run db:seed`

---

## ÉTAPE 5 — Vérifications

### Tester l'API
```
GET https://oppgabon-backend.up.railway.app/api/health
→ { "status": "ok", "app": "OppGabon API" }

GET https://oppgabon-backend.up.railway.app/api/listings
→ Liste des annonces
```

### Tester le frontend
```
https://oppgabon.vercel.app
→ Page d'accueil OppGabon

https://oppgabon.vercel.app/auth/register
→ Formulaire d'inscription
```

---

## ÉTAPE 6 — Configuration CORS en production

Mettre à jour backend/src/index.ts pour accepter le domaine Vercel :

```typescript
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://oppgabon.vercel.app',
    'https://oppgabon.ga',
    'https://www.oppgabon.ga',
  ],
  credentials: true,
}))
```

---

## Coûts estimés

| Service | Plan | Coût |
|---------|------|------|
| Railway Starter | 5$/mois inclus | ~5$/mois |
| PostgreSQL Railway | Inclus dans Starter | 0$ |
| Vercel Hobby | Frontend | Gratuit |
| Domaine .ga | Annuel | ~20$/an |
| Cloudinary Free | 25GB stockage | Gratuit |
| **Total** | | **~7$/mois** |

---

## Commandes utiles après déploiement

```bash
# Voir les logs Railway en temps réel
railway logs

# Accéder à la DB en ligne de commande
railway connect PostgreSQL

# Redéployer manuellement
railway up

# Variables d'environnement
railway variables
```

---

## En cas de problème

### Erreur "Cannot find module"
→ Vérifier que `postinstall: "prisma generate"` est dans package.json

### Erreur de connexion DB
→ Vérifier que DATABASE_URL est bien injectée par Railway
→ `railway variables` pour voir toutes les variables

### CORS bloqué
→ Ajouter l'URL Vercel dans la liste CORS du backend
→ Redéployer le backend

### Socket.io ne fonctionne pas
→ Activer WebSocket dans Railway : Settings → Networking → Enable WebSocket
