#!/bin/bash
# Wrapper para o Cron Job da Hostinger (Seg–Sex 18:30 BRT)
set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

export TZ=America/Sao_Paulo
LOG_DIR="$DIR/logs"
mkdir -p "$LOG_DIR"

# Ajuste o caminho do node se o `which node` na Hostinger for diferente
NODE_BIN="$(command -v node || true)"
if [ -z "$NODE_BIN" ]; then
  # caminhos comuns em VPS / Node Selector da Hostinger
  for candidate in \
    "$HOME/.nvm/versions/node/*/bin/node" \
    /usr/bin/node \
    /usr/local/bin/node
  do
    # shellcheck disable=SC2086
    if ls $candidate >/dev/null 2>&1; then
      NODE_BIN="$(ls $candidate | tail -n 1)"
      break
    fi
  done
fi

if [ -z "${NODE_BIN:-}" ] || [ ! -x "$NODE_BIN" ]; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERRO: node não encontrado" >> "$LOG_DIR/cron.log"
  exit 1
fi

{
  echo "======== $(date '+%Y-%m-%d %H:%M:%S %Z') ========"
  "$NODE_BIN" "$DIR/robo-cotacoes.js"
  echo ""
} >> "$LOG_DIR/cron.log" 2>&1
