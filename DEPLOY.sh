#!/usr/bin/env bash
set -e

# ==========================================================
# Script Triển Khai Thiên Đàng & Địa Ngục Online Lên Server
# ==========================================================

SERVER_HOST="${1:-local}"
SERVER_PATH="/mnt/GAMES/server_games"
GIT_REPO="https://github.com/tanmnn-dev/game_thiendang_dianguc.git"

echo "=== [1/4] Kiem tra ket noi den Server: $SERVER_HOST ==="
ssh -o ConnectTimeout=5 "$SERVER_HOST" "echo '>> Ket noi SSH thanh cong vao server:' \$(hostname) '(\$(uname -m))'"

echo "=== [2/4] Chuan bi thu muc tren Server: $SERVER_PATH ==="
ssh "$SERVER_HOST" "mkdir -p $SERVER_PATH && cd $SERVER_PATH"

echo "=== [3/4] Dong bo ma nguon vao Server ==="
# Dong bo code tu Git hoac rsync truc tiep
if ssh "$SERVER_HOST" "[ -d $SERVER_PATH/.git ]"; then
    echo ">> Repo da ton tai, cap nhat code moi nhat tu Git..."
    ssh "$SERVER_HOST" "cd $SERVER_PATH && git pull origin main"
else
    echo ">> Clone repo moi ve server..."
    ssh "$SERVER_HOST" "git clone $GIT_REPO $SERVER_PATH || true"
fi

# Dong bo cac file cau hinh Docker neu can
rsync -avz --exclude 'node_modules' --exclude '.git' ./ "$SERVER_HOST:$SERVER_PATH/"

echo "=== [4/4] Khoi dong Docker Container tren Server ==="
ssh "$SERVER_HOST" "cd $SERVER_PATH && docker compose down 2>/dev/null || true && docker compose up -d --build"

# Mo cong tuong lua
ssh "$SERVER_HOST" "sudo ufw allow 3000/tcp 2>/dev/null || true"

echo "=== TRIEN KHAI HOAN TAT! ==="
echo "Truy cap game tai: http://192.168.1.100:3000"
