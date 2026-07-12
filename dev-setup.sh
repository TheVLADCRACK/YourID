#!/bin/bash
# dev-setup.sh — Your ID · Setup développement & production (Hostinger/VPS)
set -e
G='\033[0;32m'; Y='\033[1;33m'; B='\033[0;34m'; R='\033[0;31m'; NC='\033[0m'

echo -e "${B}╔════════════════════════════════════════╗${NC}"
echo -e "${B}║       Your ID — Setup & Démarrage      ║${NC}"
echo -e "${B}║  SQLite · Zéro cloud · Prêt Hostinger  ║${NC}"
echo -e "${B}╚════════════════════════════════════════╝${NC}\n"

# ─── Vérifications ───────────────────────────────────────────────────────────
command -v node &>/dev/null || { echo -e "${R}❌ Node.js v20+ requis${NC}"; exit 1; }
NODE_VER=$(node -v | cut -dv -f2 | cut -d. -f1)
[ "$NODE_VER" -ge 20 ] || { echo -e "${R}❌ Node.js v20+ requis (actuel: $(node -v))${NC}"; exit 1; }
echo -e "${G}✅ Node.js $(node -v)${NC}"

# ─── Variables d'environnement ────────────────────────────────────────────────
if [ ! -f ".env" ]; then
  cp .env.example .env
  echo -e "${Y}⚠  .env créé depuis .env.example — remplissez les variables !${NC}"
fi
if [ ! -f "apps/web/.env.local" ]; then
  echo "NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-http://localhost:4000/api/v1}
NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL:-http://localhost:3000}" > apps/web/.env.local
fi
if [ ! -f "apps/api/.env" ]; then cp .env apps/api/.env; fi

# ─── Dossiers nécessaires ────────────────────────────────────────────────────
mkdir -p apps/api/data
mkdir -p apps/api/uploads/{products,stores,avatars}
echo -e "${G}✅ Dossiers data/ et uploads/ créés${NC}"

# ─── Installation des dépendances ────────────────────────────────────────────
echo -e "\n${B}→ Installation des dépendances...${NC}"
npm install --legacy-peer-deps
echo -e "${G}✅ Dépendances installées${NC}"

# ─── Seed de la base SQLite ──────────────────────────────────────────────────
echo -e "\n${B}→ Initialisation de la base SQLite...${NC}"
cd apps/api
DATABASE_PATH="$(pwd)/data/yourid.db" UPLOAD_DIR="$(pwd)/uploads" \
  npx ts-node --project tsconfig.json src/database/seed.ts \
  && echo -e "${G}✅ Base de données initialisée${NC}" \
  || echo -e "${Y}⚠  Seed ignoré (base déjà existante)${NC}"
cd ../..

echo -e "\n${G}════════════════════════════════════════${NC}"
echo -e "${G}✅ Setup terminé${NC}"
echo -e ""
echo -e "  ${B}Développement :${NC}"
echo -e "   npm run dev"
echo -e ""
echo -e "  ${B}Production (build + start) :${NC}"
echo -e "   npm run build"
echo -e "   npm run start"
echo -e ""
echo -e "  Frontend  →  ${B}http://localhost:3000${NC}"
echo -e "  API       →  ${B}http://localhost:4000${NC}"
echo -e "  Swagger   →  ${B}http://localhost:4000/api/docs${NC}"
echo -e ""
echo -e "  Admin   : admin@yourid.com  / Admin@2025!"
echo -e "  Vendeur : demo@yourid.com   / Demo@2025!"
echo -e "${G}════════════════════════════════════════${NC}"
