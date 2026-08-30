#!/bin/bash
# Instala/atualiza o cron do robô de cotações via SSH (CageFS Hostinger).
# Uso: ./instalar-cron.sh
set -euo pipefail

USER_NAME="$(id -un)"
REMOTE_DIR="$(cd "$(dirname "$0")" && pwd)"
CRON_FILE="/var/spool/cron/${USER_NAME}"
# Servidor Hostinger roda em UTC → 18:30 BRT = 21:30 UTC
CRON_TIME="30 21 * * 1-5"
CRON_CMD="/bin/bash ${REMOTE_DIR}/rodar-cron.sh"

mkdir -p "${REMOTE_DIR}/logs"
chmod +x "${REMOTE_DIR}/rodar-cron.sh"

cat > "${CRON_FILE}" <<EOF
SHELL=/bin/bash
PATH=/usr/local/bin:/usr/bin:/bin
MAILTO=""
# Robo cotacoes Lextor - Seg-Sex 18:30 America/Sao_Paulo (21:30 UTC)
${CRON_TIME} ${CRON_CMD}
EOF

chmod 600 "${CRON_FILE}"

echo "Cron instalado em ${CRON_FILE}:"
echo "--------------------------------"
cat "${CRON_FILE}"
echo "--------------------------------"
echo "Agendamento: Seg-Sex 18:30 (Brasília) / 21:30 UTC"
echo "Comando:     ${CRON_CMD}"
echo "Logs:        ${REMOTE_DIR}/logs/cron.log"
