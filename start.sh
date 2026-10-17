#!/usr/bin/env bash
# Запуск «Сквозь чащу» на macOS / Linux: собирает клиентов (если изменились) и стартует сервер.
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"

build_if_needed() {
  local dir="$ROOT/$1"
  if [ ! -d "$dir/node_modules" ]; then (cd "$dir" && npm install --silent); fi
  if [ ! -d "$dir/build" ] || [ -n "$(find "$dir/src" "$dir/public" -newer "$dir/build" -type f 2>/dev/null | head -1)" ]; then
    echo "  $1: сборка..."
    (cd "$dir" && npm run build --silent)
    touch "$dir/build"
  else
    echo "  $1: без изменений"
  fi
}

echo "[1/3] client-screen"; build_if_needed client-screen
echo "[2/3] client-phone";  build_if_needed client-phone
echo "[3/3] server"
cd "$ROOT/server"
[ -d node_modules ] || npm install --silent
exec node src/index.js
