#!/bin/bash
# dev-setup.sh — Installation et démarrage complet en développement
set -e

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; RED='\033[0;31m'; NC='\033[0m'

echo -e "${BLUE}╔══════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Your ID — Setup développement    ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════╝${NC}\n"

# Check Node.js
if ! command -v node &>/dev/null; then echo -e "${RED}❌ Node.js requis (v20+)${NC}"; exit 1; fi
NODE_VER=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VER" -lt 20 ]; then echo -e "${RED}❌ Node.js v20+ requis (actuel: $(node -v))${NC}"; exit 1; fi
echo -e "${GREEN}✅ Node.js $(node -v)${NC}"

# Check Docker
if ! command -v docker &>/dev/null; then echo -e "${YELLOW}⚠️  Docker non trouvé — PostgreSQL/Redis manuel requis${NC}"; SKIP_DOCKER=true; fi

# Copy env files
echo -e "\n${BLUE}→ Configuration des variables d'environnement...${NC}"
if [ ! -f ".env" ]; then
  cp .env.example .env
  echo -e "${YELLOW}⚠️  Fichier .env créé depuis .env.example${NC}"
  echo -e "${YELLOW}   Veuillez remplir les variables requises dans .env${NC}"
fi
if [ ! -f "apps/web/.env.local" ]; then
  cp apps/web/.env.local.example apps/web/.env.local 2>/dev/null || echo "NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1" > apps/web/.env.local
fi
if [ ! -f "apps/api/.env" ]; then
  cp apps/api/.env.example apps/api/.env
fi

# Start Docker services
if [ -z "$SKIP_DOCKER" ]; then
  echo -e "\n${BLUE}→ Démarrage de PostgreSQL et Redis...${NC}"
  docker compose up -d postgres redis
  echo -e "${GREEN}✅ Services démarrés${NC}"
  sleep 3
fi

# Install dependencies
echo -e "\n${BLUE}→ Installation des dépendances...${NC}"
npm install
echo -e "${GREEN}✅ Dépendances installées${NC}"

# Generate Prisma client
echo -e "\n${BLUE}→ Génération du client Prisma...${NC}"
cd packages/database && npm install && npm run db:generate
echo -e "${GREEN}✅ Client Prisma généré${NC}"
cd ../..

# Push schema to DB
echo -e "\n${BLUE}→ Migration de la base de données...${NC}"
cd packages/database
DATABASE_URL=$(grep DATABASE_URL ../../.env | cut -d'=' -f2-)
DATABASE_URL=$DATABASE_URL npx prisma db push
echo -e "${GREEN}✅ Schéma appliqué${NC}"

# Seed database
echo -e "\n${BLUE}→ Initialisation des données...${NC}"
DATABASE_URL=$DATABASE_URL npm run db:seed 2>/dev/null || echo -e "${YELLOW}⚠️  Seed ignoré (données déjà présentes)${NC}"
cd ../..

echo -e "\n${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Setup terminé ! Démarrez l'app avec:${NC}"
echo -e "${GREEN}   npm run dev${NC}"
echo -e ""
echo -e "   Frontend: ${BLUE}http://localhost:3000${NC}"
echo -e "   API:      ${BLUE}http://localhost:4000${NC}"
echo -e "   Swagger:  ${BLUE}http://localhost:4000/api/docs${NC}"
echo -e ""
echo -e "   Admin:    admin@yourid.com / Admin@2025!"
echo -e "   Demo:     demo@yourid.com  / Demo@2025!"
echo -e "${GREEN}════════════════════════════════════════${NC}"
