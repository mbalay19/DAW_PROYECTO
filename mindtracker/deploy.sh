#!/bin/bash
set -e

# MindTracker - Script de despliegue para Linux (Debian/Ubuntu)
# Uso: sudo bash deploy.sh
# Requisitos previos: ninguno (el script instala todo lo necesario)

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=== MindTracker Deployment Script ==="
echo "Directorio del proyecto: $SCRIPT_DIR"

command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# ── 1. Dependencias del sistema ─────────────────────────────────────────────

echo ""
echo "[1/7] Verificando dependencias del sistema..."

apt update -qq

# curl (necesario para instalar nodesource)
if ! command_exists curl; then
    apt install -y curl
fi

# Apache2
if ! command_exists apache2; then
    echo "  → Instalando Apache2..."
    apt install -y apache2
fi
systemctl enable apache2
systemctl start apache2

# MariaDB
if ! command_exists mysql; then
    echo "  → Instalando MariaDB..."
    apt install -y mariadb-server mariadb-client
fi
systemctl enable mariadb
systemctl start mariadb

# Node.js 20
if ! command_exists node; then
    echo "  → Instalando Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
fi

# PM2
if ! command_exists pm2; then
    echo "  → Instalando PM2..."
    npm install -g pm2
fi

# ── 2. Configuración de Apache ───────────────────────────────────────────────

echo ""
echo "[2/7] Configurando Apache..."

a2enmod rewrite
a2enmod proxy
a2enmod proxy_http
a2enmod headers
a2enmod ssl

cp "$SCRIPT_DIR/apache-config/mindtracker.conf" /etc/apache2/sites-available/
a2ensite mindtracker.conf
a2dissite 000-default || true

# ── 3. Compilar el frontend ──────────────────────────────────────────────────

echo ""
echo "[3/7] Compilando frontend..."

cd "$SCRIPT_DIR/client"
npm install
npm run build
cd "$SCRIPT_DIR"

# ── 4. Desplegar archivos ────────────────────────────────────────────────────

echo ""
echo "[4/7] Desplegando archivos..."

mkdir -p /var/www/html/mindtracker

rm -rf /var/www/html/mindtracker/frontend
cp -r "$SCRIPT_DIR/client/dist"   /var/www/html/mindtracker/frontend
cp -r "$SCRIPT_DIR/backend"       /var/www/html/mindtracker/
cp    "$SCRIPT_DIR/App.js"        /var/www/html/mindtracker/
cp    "$SCRIPT_DIR/server.js"     /var/www/html/mindtracker/
cp    "$SCRIPT_DIR/package.json"  /var/www/html/mindtracker/
cp    "$SCRIPT_DIR/package-lock.json" /var/www/html/mindtracker/
cp    "$SCRIPT_DIR/.env"          /var/www/html/mindtracker/

chown -R www-data:www-data /var/www/html/mindtracker
chmod -R 755 /var/www/html/mindtracker

# ── 5. Base de datos ─────────────────────────────────────────────────────────

echo ""
echo "[5/7] Configurando base de datos..."

DB_PASS=$(grep '^DB_PASSWORD=' "$SCRIPT_DIR/.env" | cut -d'=' -f2- | tr -d '"')
DB_NAME=$(grep '^DB_NAME='     "$SCRIPT_DIR/.env" | cut -d'=' -f2- | tr -d '"')
DB_USER=$(grep '^DB_USER='     "$SCRIPT_DIR/.env" | cut -d'=' -f2- | tr -d '"')

mysql -u root << EOF
CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';
GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'localhost';
FLUSH PRIVILEGES;
EOF

# ── 6. Backend: dependencias y PM2 ──────────────────────────────────────────

echo ""
echo "[6/7] Instalando dependencias del backend y configurando PM2..."

cd /var/www/html/mindtracker
npm install --omit=dev

pm2 delete mindtracker 2>/dev/null || true
pm2 start /var/www/html/mindtracker/server.js --name "mindtracker" --cwd /var/www/html/mindtracker
pm2 startup
pm2 save

# ── 7. Reiniciar Apache ──────────────────────────────────────────────────────

echo ""
echo "[7/7] Reiniciando Apache..."
systemctl restart apache2

# ── Verificación final ───────────────────────────────────────────────────────

echo ""
echo "=== Verificación ==="
systemctl is-active --quiet apache2  && echo "✓ Apache   funcionando" || echo "✗ Apache   no funciona"
systemctl is-active --quiet mariadb  && echo "✓ MariaDB  funcionando" || echo "✗ MariaDB  no funciona"
pm2 list | grep -q "mindtracker"     && echo "✓ Node.js  funcionando" || echo "✗ Node.js  no funciona"

echo ""
echo "=== Despliegue completado ==="
echo "Disponible en: http://localhost  o  http://mindtracker.local"
echo ""
echo "Logs:   sudo pm2 logs mindtracker"
echo "Estado: sudo pm2 status"
