#!/data/data/com.termux/files/usr/bin/bash
set -e

cd "$HOME/WARDOGS-Android"

echo "=== WARDOGS AUTOMATIC UPDATE ==="

if [ ! -f www/index.html ]; then
  echo "ERROR: index.html tidak ditemukan"
  exit 1
fi

echo "[1/4] Backup..."
BACKUP="www/index.html.backup-auto-$(date +%Y%m%d-%H%M%S)"
cp www/index.html "$BACKUP"
echo "$BACKUP"

echo "[2/4] Validasi JavaScript..."
awk '
/<script/ { if ($0 ~ /src=/) next; inside=1; next }
/<\/script>/ { inside=0 }
inside { print }
' www/index.html > "$HOME/wardogs-inline.js"

node --check "$HOME/wardogs-inline.js"
git diff --check

echo "[3/4] Sinkronisasi Android..."
mkdir -p android/app/src/main/assets/public
cp www/index.html android/app/src/main/assets/public/index.html
cmp -s www/index.html android/app/src/main/assets/public/index.html

echo "[4/4] Build APK..."
cd android
./gradlew assembleDebug

echo
echo "=== BUILD SELESAI ==="
echo "APK: android/app/build/outputs/apk/debug/app-debug.apk"
