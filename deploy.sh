#!/usr/bin/env bash
# deploy.sh — Déploiement VPS Docker pour l'application Your ID

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [ -t 1 ]; then
  GREEN='\033[0;32m'
  YELLOW='\033[1;33m'
  BLUE='\033[0;34m'
  RED='\033[0;31m'
  NC='\033[0m'
else
  GREEN=''
  YELLOW=''
  BLUE=''
  RED=''
  NC=''
fi

info() {
  printf "%s%s%s\n" "$BLUE" "$1" "$NC"
}

success() {
  printf "%s%s%s\n" "$GREEN" "$1" "$NC"
}

warn() {
  printf "%s%s%s\n" "$YELLOW" "$1" "$NC"
}

error() {
  printf "%s%s%s\n" "$RED" "$1" "$NC" >&2
  exit 1
}

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    error "❌ La commande '$1' est requise mais introuvable. Installez-la avant de continuer."
  fi
}

load_env_var() {
  local name="$1"
  local line
  line=$(grep -E "^${name}=" "$ENV_FILE" || true)
  if [ -z "$line" ]; then
    echo ""
    return
  fi
  line=${line#${name}=}
  line=${line%\"}
  line=${line#\"}
  echo "$line"
}

usage() {
  cat <<EOF
Usage: ./deploy.sh [options]

Options:
  --env-file PATH   Fichier .env à utiliser (par défaut .env)
  --skip-seed       Ne pas exécuter le seed de la base de données
  --seed            Exécuter le seed après l'application du schéma
  --help            Afficher cette aide
EOF
}

ENV_FILE=".env"
SKIP_SEED=false
RUN_SEED=false

while [ "$#" -gt 0 ]; do
  case "$1" in
    --env-file)
      shift
      [ "$#" -gt 0 ] || error "❌ L'argument --env-file nécessite un chemin."
      ENV_FILE="$1"
      ;;
    --skip-seed)
      SKIP_SEED=true
      ;;
    --seed)
      RUN_SEED=true
      ;;
    --help)
      usage
      exit 0
      ;;
    *)
      error "❌ Option inconnue : $1"
      ;;
  esac
  shift
done

require_command docker

if command -v docker-compose >/dev/null 2>&1; then
  COMPOSE_CMD='docker-compose'
elif docker compose version >/dev/null 2>&1; then
  COMPOSE_CMD='docker compose'
else
  error "❌ Docker Compose n'est pas disponible. Installez docker-compose ou le plugin docker compose."
fi

if [ ! -f "$ENV_FILE" ]; then
  error "❌ Fichier d'environnement introuvable : $ENV_FILE"
fi

info "=============================================="
info "  Your ID — Déploiement Docker VPS           "
info "=============================================="

info "→ Utilisation du fichier d'environnement : $ENV_FILE"

export COMPOSE_FILE="docker-compose.yml"
export ENV_FILE

DATABASE_URL="$(load_env_var DATABASE_URL)"
POSTGRES_PASSWORD="$(load_env_var POSTGRES_PASSWORD)"
REDIS_PASSWORD="$(load_env_var REDIS_PASSWORD)"

if [ -z "$DATABASE_URL" ]; then
  error "❌ DATABASE_URL non défini dans $ENV_FILE."
fi

if [ -z "$POSTGRES_PASSWORD" ]; then
  error "❌ POSTGRES_PASSWORD non défini dans $ENV_FILE."
fi

if [ -z "$REDIS_PASSWORD" ]; then
  error "❌ REDIS_PASSWORD non défini dans $ENV_FILE."
fi

info "→ Variables d'environnement de base vérifiées"

info "\n→ Construction des images Docker..."
$COMPOSE_CMD --env-file "$ENV_FILE" build --pull api web
success "✅ Images Docker construites"

info "\n→ Démarrage de PostgreSQL et Redis..."
$COMPOSE_CMD --env-file "$ENV_FILE" up -d postgres redis

wait_for_health() {
  local service="$1"
  local retries=30
  local count=0

  info "   Vérification de l'état de $service..."
  until [ "$count" -ge "$retries" ]; do
    local container_id
    container_id=$($COMPOSE_CMD --env-file "$ENV_FILE" ps -q "$service" 2>/dev/null || true)
    if [ -n "$container_id" ]; then
      if docker inspect --format '{{json .State.Health.Status}}' "$container_id" 2>/dev/null | grep -q healthy; then
        success "   $service est healthy"
        return 0
      fi
    fi
    count=$((count + 1))
    sleep 2
  done
  error "❌ Le service $service n'est pas healthy après $retries tentatives. Vérifiez les logs Docker."
}

wait_for_health postgres
wait_for_health redis

info "\n→ Démarrage des services API et Web..."
$COMPOSE_CMD --env-file "$ENV_FILE" up -d api web
success "✅ Services API et Web démarrés"

info "\n→ Application du schéma Prisma..."
$COMPOSE_CMD --env-file "$ENV_FILE" run --rm --entrypoint sh api -c 'npx prisma@6.1.0 db push --schema=./prisma/schema.prisma --accept-data-loss'
success "✅ Schéma Prisma appliqué"

if [ "$SKIP_SEED" = true ]; then
  warn "⚠️  Seed désactivé (--skip-seed)."
elif [ "$RUN_SEED" = true ]; then
  info "\n→ Exécution du seed de la base de données..."
  docker run --rm -v "$SCRIPT_DIR":/workspace -w /workspace/packages/database -e DATABASE_URL="$DATABASE_URL" node:20-alpine sh -lc "apk add --no-cache python3 make g++ openssl-dev libc6-compat && npm install --legacy-peer-deps --silent && npx prisma@6.1.0 generate --schema=./schema.prisma && npm run db:seed"
  success "✅ Seed exécuté avec succès"
else
  warn "⚠️  Seed non exécuté. Utilisez --seed si vous voulez l'initialiser."
fi

success "\n=============================================="
success "✅ Déploiement Docker VPS terminé"
info "Accédez à l'application :"
info "   Frontend : http://localhost:3000"
info "   API      : http://localhost:4000"
info "=============================================="
