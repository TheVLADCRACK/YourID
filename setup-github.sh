#!/bin/bash
# setup-github.sh — Script pour initialiser et pousser sur GitHub

set -e

YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}   Your ID — Push vers GitHub${NC}"
echo -e "${BLUE}============================================${NC}\n"

# Vérifier git
if ! command -v git &> /dev/null; then
    echo "❌ Git non installé. Installez git d'abord."
    exit 1
fi

# Demander les infos GitHub
read -p "👤 Votre nom d'utilisateur GitHub: " GITHUB_USER
read -p "📦 Nom du dépôt (ex: yourid): " REPO_NAME
echo -e "${YELLOW}ℹ️  Assurez-vous d'avoir créé le dépôt '${REPO_NAME}' sur GitHub (vide, sans README)${NC}"
read -p "Appuyez sur Entrée pour continuer..."

# Init git
cd "$(dirname "$0")"
echo -e "\n${GREEN}→ Initialisation du dépôt Git...${NC}"
git init
git add .
git commit -m "🚀 Initial commit — Your ID SaaS Platform

- Next.js 15 frontend (landing, dashboard, marketplace, checkout)
- NestJS API (auth, products, orders, payments, analytics, AI)
- Prisma schema complet (20+ tables)
- Docker + GitHub Actions CI/CD
- Commission plateforme 15%
- Support Mobile Money (MTN, Orange, Wave)
- IA génération contenu (OpenAI)"

# Configurer remote
REMOTE_URL="https://github.com/${GITHUB_USER}/${REPO_NAME}.git"
echo -e "${GREEN}→ Configuration du remote: ${REMOTE_URL}${NC}"
git remote remove origin 2>/dev/null || true
git remote add origin "$REMOTE_URL"
git branch -M main

# Push
echo -e "${GREEN}→ Push vers GitHub...${NC}"
echo -e "${YELLOW}⚠️  Entrez votre token GitHub (Personal Access Token) si demandé${NC}"
git push -u origin main

echo -e "\n${GREEN}✅ Projet pushé avec succès !${NC}"
echo -e "\n${BLUE}Prochaines étapes:${NC}"
echo -e "1. 🌐 Cloudflare Pages: https://dash.cloudflare.com → Pages → Connecter GitHub"
echo -e "   Build: cd apps/web && npm run build"
echo -e "   Output: apps/web/.next"
echo -e ""
echo -e "2. 🚂 Railway (API): https://railway.app → New Project → GitHub Repo"
echo -e "   Root: apps/api"
echo -e "   Start: node dist/main"
echo -e ""
echo -e "3. 🗄️  Base de données: https://supabase.com (gratuit)"
echo -e "   Copier DATABASE_URL dans les variables d'environnement"
echo -e ""
echo -e "4. ⚙️  Configurer les secrets GitHub Actions:"
echo -e "   Settings → Secrets → CLOUDFLARE_API_TOKEN, RAILWAY_TOKEN, etc."
echo -e ""
echo -e "${GREEN}📚 Documentation complète dans README.md${NC}"
