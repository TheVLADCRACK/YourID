# Your ID — Digital Products SaaS Platform

> La plateforme qui transforme vos connaissances en revenus.

[![CI/CD](https://github.com/YOUR_USERNAME/yourid/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/YOUR_USERNAME/yourid/actions)

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 15, React 19, TypeScript, TailwindCSS |
| Backend | NestJS, Prisma, PostgreSQL, Redis |
| Storage | Cloudflare R2 |
| Auth | JWT + Refresh Tokens, Argon2id |
| Email | Resend |
| AI | OpenAI GPT-4o-mini |
| Deploy | Cloudflare Pages + Railway |

---

## 🚀 Installation rapide

### 1. Cloner et configurer

```bash
git clone https://github.com/YOUR_USERNAME/yourid.git
cd yourid
cp .env.example .env
# Remplir .env avec vos variables
```

### 2. Lancer avec Docker (recommandé)

```bash
docker-compose up -d
```

L'application sera disponible sur :
- Frontend: http://localhost:3000
- API: http://localhost:4000
- Swagger: http://localhost:4000/api/docs

### 3. Installation manuelle

```bash
# Installer les dépendances
npm install

# Générer le client Prisma
cd packages/database && npm run db:generate

# Pousser le schéma en base
npm run db:push

# Seed initial
npm run db:seed

# Démarrer en développement
npm run dev
```

### Comptes de démo

| Rôle | Email | Mot de passe |
|---|---|---|
| Admin | admin@yourid.com | Admin@2025! |
| Vendeur | demo@yourid.com | Demo@2025! |

---

## 📦 Variables d'environnement

Copiez `.env.example` en `.env` et remplissez :

```env
DATABASE_URL=postgresql://...
JWT_ACCESS_SECRET=...           # min 32 caractères
JWT_REFRESH_SECRET=...          # min 32 caractères
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_R2_ACCESS_KEY=...
CLOUDFLARE_R2_SECRET_KEY=...
CLOUDFLARE_R2_BUCKET=yourid-files
RESEND_API_KEY=re_...
OPENAI_API_KEY=sk-...
```

---

## ☁️ Déploiement Cloudflare Pages

### Frontend (Next.js → Cloudflare Pages)

1. Connectez votre repo GitHub à Cloudflare Pages
2. **Build command:** `cd apps/web && npm run build`
3. **Output directory:** `apps/web/.next`
4. **Variables d'environnement :**
   - `NEXT_PUBLIC_API_URL` = URL de votre API
   - `NEXT_PUBLIC_APP_URL` = URL de votre frontend

### Backend (NestJS → Railway)

1. Créez un projet Railway
2. Connectez votre repo GitHub
3. **Root Directory:** `apps/api`
4. **Start Command:** `node dist/main`
5. Ajoutez un service PostgreSQL et Redis dans Railway
6. Configurez toutes les variables d'environnement

### Base de données (Supabase ou Neon — gratuit)

```bash
# Après config de DATABASE_URL
cd packages/database
npx prisma migrate deploy
npx ts-node seed.ts
```

---

## 🔐 Secrets GitHub Actions

Dans Settings → Secrets → Actions, ajoutez :

| Secret | Description |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Token API Cloudflare |
| `CLOUDFLARE_ACCOUNT_ID` | ID compte Cloudflare |
| `RAILWAY_TOKEN` | Token Railway |
| `NEXT_PUBLIC_API_URL` | URL API en production |
| `NEXT_PUBLIC_APP_URL` | URL frontend en production |

---

## 📁 Structure du projet

```
yourid/
├── apps/
│   ├── web/          # Next.js 15 – Frontend
│   └── api/          # NestJS – Backend API
├── packages/
│   ├── database/     # Prisma schema + client
│   └── types/        # Types TypeScript partagés
├── .github/
│   └── workflows/    # CI/CD GitHub Actions
├── docker-compose.yml
└── .env.example
```

---

## 💰 Business Model

La plateforme prélève **15%** sur chaque vente.

```
Produit à 10 000 FCFA
├── Commission plateforme: 1 500 FCFA (15%)
└── Revenu vendeur: 8 500 FCFA (85%)
```

---

## 🛠️ API Endpoints principaux

| Module | Endpoints |
|---|---|
| Auth | POST /auth/register, /auth/login, /auth/refresh |
| Products | GET/POST/PUT/DELETE /products |
| Orders | POST /orders, POST /orders/:id/complete |
| Payments | POST /payments/initiate, /payments/simulate/:id |
| Analytics | GET /analytics/dashboard, /analytics/revenue |
| Marketplace | GET /marketplace, /marketplace/featured |
| Withdrawals | GET/POST /withdrawals |
| AI | POST /ai/generate-description, /ai/generate-sales-page |

Documentation Swagger complète: `http://localhost:4000/api/docs`

---

## 📄 Licence

© TheVLADCRACK. Tout drois réservé