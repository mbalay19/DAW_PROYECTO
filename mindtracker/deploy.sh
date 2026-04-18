#!/bin/bash

# Script de despliegue para MindTracker con Apache
# Ejecutar con permisos de administrador

echo "=== MindTracker Deployment Script ==="

# Función para verificar si un comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verificar y instalar dependencias del sistema
echo "Verificando dependencias del sistema..."

# Verificar Apache2
if ! command_exists apache2; then
    echo "Instalando Apache2..."
    apt update
    apt install -y apache2
fi

# Verificar MariaDB
if ! command_exists mysql; then
    echo "Instalando MariaDB..."
    apt install -y mariadb-server mariadb-client
fi

# Verificar Node.js
if ! command_exists node; then
    echo "Instalando Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
fi

# Verificar PM2 para manejo de procesos Node.js
if ! command_exists pm2; then
    echo "Instalando PM2..."
    npm install -g pm2
fi

# Configurar Apache
echo "Configurando Apache..."

# Habilitar módulos necesarios
a2enmod rewrite
a2enmod proxy
a2enmod proxy_http
a2enmod headers
a2enmod ssl

# Copiar archivo de configuración
cp ./apache-config/mindtracker.conf /etc/apache2/sites-available/

# Habilitar el sitio
a2ensite mindtracker.conf

# Deshabilitar sitio por defecto (opcional)
a2dissite 000-default

# Crear directorio de la aplicación
mkdir -p /var/www/html/mindtracker

# Copiar archivos de la aplicación
cp -r ./client/dist /var/www/html/mindtracker/frontend
cp -r ./backend /var/www/html/mindtracker/
cp ./package.json /var/www/html/mindtracker/
cp ./package-lock.json /var/www/html/mindtracker/
cp ./.env /var/www/html/mindtracker/
cp ./App.js /var/www/html/mindtracker/

# Establecer permisos correctos
chown -R www-data:www-data /var/www/html/mindtracker
chmod -R 755 /var/www/html/mindtracker

# Configurar base de datos
echo "Configurando base de datos MariaDB..."
mysql -u root << EOF
CREATE DATABASE IF NOT EXISTS mindtracker;
CREATE USER IF NOT EXISTS 'mindtracker_user'@'localhost' IDENTIFIED BY 'TU_CONTRASEÑA_AQUI';
GRANT ALL PRIVILEGES ON mindtracker.* TO 'mindtracker_user'@'localhost';
FLUSH PRIVILEGES;
EOF

# Instalar dependencias de Node.js
echo "Instalando dependencias de Node.js..."
cd /var/www/html/mindtracker
npm install --production

# Configurar PM2 para manejar la aplicación Node.js
echo "Configurando PM2..."
pm2 delete mindtracker 2>/dev/null || true  # Eliminar proceso existente si existe
pm2 start App.js --name "mindtracker" --log /var/log/pm2/mindtracker.log

# Configurar PM2 para iniciarse con el sistema
pm2 startup
pm2 save

# Reiniciar Apache
echo "Reiniciando Apache..."
systemctl restart apache2

# Verificar que los servicios estén funcionando
echo "Verificando servicios..."
if systemctl is-active --quiet apache2; then
    echo "✓ Apache está funcionando"
else
    echo "✗ Error: Apache no está funcionando"
fi

if systemctl is-active --quiet mariadb; then
    echo "✓ MariaDB está funcionando"
else
    echo "✗ Error: MariaDB no está funcionando"
fi

if pm2 list | grep -q mindtracker; then
    echo "✓ Aplicación Node.js está funcionando"
else
    echo "✗ Error: Aplicación Node.js no está funcionando"
fi

echo "=== Despliegue completado ==="
echo "La aplicación debería estar disponible en:"
echo "- HTTP: http://localhost o http://mindtracker.local"
echo "- HTTPS: https://localhost o https://mindtracker.local (si se configuran certificados SSL)"
echo ""
echo "Para ver los logs de la aplicación Node.js:"
echo "pm2 logs mindtracker"
echo ""
echo "Para ver el estado de los servicios:"
echo "systemctl status apache2"
echo "systemctl status mariadb"
echo "pm2 status"