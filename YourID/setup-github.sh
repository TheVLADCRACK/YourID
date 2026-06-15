#!/usr/bin/env bash
# setup-github.sh — Script pour initialiser et pousser sur GitHub

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Couleurs si le terminal le supporte
if [ -t 1 ]; then
  YELLOW='\033[1;33m'
  GREEN='\033[0;32m'
  BLUE='\033[0;34m'
  NC='\033[0m'
else
  YELLOW=''
  GREEN=''
  BLUE=''
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

if ! command -v git >/dev/null 2>&1; then
  echo "❌ Git n'est pas installé. Installez git avant d'exécuter ce script."
  exit 1
fi

info "============================================"
info "   Your ID — Push vers GitHub"
info "============================================"

read -rp "👤 Votre nom d'utilisateur GitHub : " GITHUB_USER
read -rp "📦 Nom du dépôt GitHub (ex: yourid) : " REPO_NAME

if [ -z "$GITHUB_USER" ] || [ -z "$REPO_NAME" ]; then
  echo "❌ Nom d'utilisateur et nom du dépôt sont requis."
  exit 1
fi

warn "ℹ️  Assurez-vous que le dépôt https://github.com/$GITHUB_USER/$REPO_NAME existe et qu'il est vide."
read -rp "Appuyez sur Entrée pour continuer... " _

if [ ! -d .git ]; then
  info "→ Initialisation du dépôt Git..."
  git init
else
  info "→ Dépôt Git existant détecté."
fi

git config --local init.defaultBranch main

git add .

if git diff --cached --quiet && git rev-parse --verify HEAD >/dev/null 2>&1; then
  info "Aucun changement à valider."
else
  if git rev-parse --verify HEAD >/dev/null 2>&1; then
    COMMIT_MSG="📌 Mise à jour du projet Your ID"
  else
    COMMIT_MSG="🚀 Initial commit — Your ID"
  fi
  git commit -m "$COMMIT_MSG"
fi

REMOTE_URL="https://github.com/${GITHUB_USER}/${REPO_NAME}.git"
info "→ Configuration du remote : $REMOTE_URL"

if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "$REMOTE_URL"
else
  git remote add origin "$REMOTE_URL"
fi

git branch -M main

info "→ Envoi vers GitHub..."
warn "⚠️  Si GitHub demande un jeton personnel, utilisez un Personal Access Token."

git push -u origin main

success "\n✅ Projet poussé avec succès !"
info "\nProchaines étapes utiles :"
info "1. Vérifiez le dépôt sur GitHub : https://github.com/$GITHUB_USER/$REPO_NAME"
info "2. Configurez les secrets ou variables d'environnement nécessaires pour votre déploiement."
info "3. Consultez README.md pour les instructions de build et d'exécution."
