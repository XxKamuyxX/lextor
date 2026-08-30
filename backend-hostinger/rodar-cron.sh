#!/bin/bash
# Wrapper para o Cron Job da Hostinger (Seg–Sex 18:30 BRT)
set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

export TZ=America/Sao_Paulo
LOG_DIR="$DIR/logs"
mkdir -p "$LOG_DIR"

# Node da Hostinger (CloudLinux alt-nodejs22)
NODE_BIN="/opt/alt/alt-nodejs22/root/usr/bin/node"

{
  echo "======== $(date '+%Y-%m-%d %H:%M:%S %Z') ========"
  "$NODE_BIN" "$DIR/robo-cotacoes.js"
  echo ""
} >> "$LOG_DIR/cron.log" 2>&1
