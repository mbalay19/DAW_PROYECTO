#Requires -RunAsAdministrator
# MindTracker - Script de despliegue para Windows con XAMPP
# Uso: click derecho -> "Ejecutar con PowerShell" (como Administrador)
#      o desde PowerShell Admin: .\deploy-windows.ps1

$ErrorActionPreference = "Stop"

# ── Configuración ────────────────────────────────────────────────────────────
$XAMPP_PATH   = "C:\xampp"
$HTDOCS       = "$XAMPP_PATH\htdocs\mindtracker"
$APACHE_BIN   = "$XAMPP_PATH\apache\bin"
$APACHE_CONF  = "$XAMPP_PATH\apache\conf"
$MYSQL_BIN    = "$XAMPP_PATH\mysql\bin"
$MYSQL_ROOT   = "root"
$MYSQL_PASS   = ""   # contraseña root de XAMPP (vacía por defecto)
$SCRIPT_DIR   = Split-Path -Parent $MyInvocation.MyCommand.Definition

Write-Host ""
Write-Host "=== MindTracker Deploy (Windows / XAMPP) ===" -ForegroundColor Cyan
Write-Host "Directorio del proyecto: $SCRIPT_DIR"

# ── 1. Verificar requisitos ──────────────────────────────────────────────────

Write-Host ""
Write-Host "[1/7] Verificando requisitos..."

if (-not (Test-Path $XAMPP_PATH)) {
    Write-Error "XAMPP no encontrado en $XAMPP_PATH`nInstala XAMPP desde https://www.apachefriends.org"
}

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "Node.js no instalado.`nDescargalo desde https://nodejs.org (version 20 LTS)"
}

$nodeVer = node --version
Write-Host "  Node.js: $nodeVer"

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Error "npm no encontrado. Reinstala Node.js."
}

if (-not (Get-Command pm2 -ErrorAction SilentlyContinue)) {
    Write-Host "  Instalando PM2..."
    npm install -g pm2
}

# ── 2. Compilar el frontend ──────────────────────────────────────────────────

Write-Host ""
Write-Host "[2/7] Compilando frontend..."

Set-Location "$SCRIPT_DIR\client"
npm install
npm run build
Set-Location $SCRIPT_DIR

# ── 3. Desplegar archivos ────────────────────────────────────────────────────

Write-Host ""
Write-Host "[3/7] Desplegando archivos en XAMPP htdocs..."

New-Item -ItemType Directory -Force -Path $HTDOCS | Out-Null

# Frontend
if (Test-Path "$HTDOCS\frontend") {
    Remove-Item "$HTDOCS\frontend" -Recurse -Force
}
Copy-Item "$SCRIPT_DIR\client\dist" "$HTDOCS\frontend" -Recurse

# Backend
if (Test-Path "$HTDOCS\backend") {
    Remove-Item "$HTDOCS\backend" -Recurse -Force
}
Copy-Item "$SCRIPT_DIR\backend"          "$HTDOCS\backend"    -Recurse
Copy-Item "$SCRIPT_DIR\App.js"           "$HTDOCS\App.js"     -Force
Copy-Item "$SCRIPT_DIR\server.js"        "$HTDOCS\server.js"  -Force
Copy-Item "$SCRIPT_DIR\package.json"     "$HTDOCS\"           -Force
Copy-Item "$SCRIPT_DIR\package-lock.json" "$HTDOCS\"          -Force
Copy-Item "$SCRIPT_DIR\.env"             "$HTDOCS\.env"       -Force

# Dependencias del backend
Write-Host "  Instalando dependencias del backend..."
Set-Location $HTDOCS
npm install --omit=dev
Set-Location $SCRIPT_DIR

# ── 4. Configurar Apache ─────────────────────────────────────────────────────

Write-Host ""
Write-Host "[4/7] Configurando Apache..."

# Habilitar modulos necesarios en httpd.conf
$httpdConf = "$APACHE_CONF\httpd.conf"
$content = Get-Content $httpdConf -Raw

$modules = @(
    'rewrite_module modules/mod_rewrite.so',
    'proxy_module modules/mod_proxy.so',
    'proxy_http_module modules/mod_proxy_http.so',
    'headers_module modules/mod_headers.so'
)
foreach ($mod in $modules) {
    # Descomenta la linea si estaba comentada
    $content = $content -replace "(?m)^#(LoadModule $([regex]::Escape($mod)))", '$1'
}

# Activar include de virtual hosts si estaba comentado
$content = $content -replace '(?m)^#(Include conf/extra/httpd-vhosts.conf)', '$1'

Set-Content $httpdConf $content -Encoding UTF8

# Escribir configuracion del Virtual Host
$frontendPath = $HTDOCS.Replace('\', '/')
$vhostConf = @"

# MindTracker VirtualHost - generado por deploy-windows.ps1
<VirtualHost *:80>
    ServerName mindtracker.local
    DocumentRoot "$frontendPath/frontend"

    ProxyRequests Off
    ProxyPreserveHost On

    ProxyPass /api http://localhost:2345/api
    ProxyPassReverse /api http://localhost:2345/api

    ProxyPass /auth http://localhost:2345/auth
    ProxyPassReverse /auth http://localhost:2345/auth

    <Directory "$frontendPath/frontend">
        Options -Indexes +FollowSymLinks
        AllowOverride None
        Require all granted

        <IfModule mod_rewrite.c>
            RewriteEngine On
            RewriteBase /

            RewriteCond %{REQUEST_URI} !^/api
            RewriteCond %{REQUEST_URI} !^/auth
            RewriteCond %{REQUEST_FILENAME} !-f
            RewriteCond %{REQUEST_FILENAME} !-d
            RewriteRule . /index.html [L]
        </IfModule>
    </Directory>

    Header always set X-Frame-Options "DENY"
    Header always set X-Content-Type-Options "nosniff"

    ErrorLog "logs/mindtracker_error.log"
    CustomLog "logs/mindtracker_access.log" combined
</VirtualHost>
"@

$vhostsFile = "$APACHE_CONF\extra\httpd-vhosts.conf"
$vhostsContent = Get-Content $vhostsFile -Raw -ErrorAction SilentlyContinue

if ($vhostsContent -match "ServerName mindtracker\.local") {
    # Reemplazar el bloque existente
    $vhostsContent = [regex]::Replace(
        $vhostsContent,
        '(?s)# MindTracker VirtualHost.*?</VirtualHost>',
        $vhostConf.Trim()
    )
    Set-Content $vhostsFile $vhostsContent -Encoding UTF8
} else {
    Add-Content $vhostsFile $vhostConf -Encoding UTF8
}

# Añadir entrada en hosts si no existe
$hostsFile = "C:\Windows\System32\drivers\etc\hosts"
$hostsContent = Get-Content $hostsFile -Raw
if ($hostsContent -notmatch "mindtracker\.local") {
    Add-Content $hostsFile "`r`n127.0.0.1`tmindtracker.local"
    Write-Host "  Entrada 'mindtracker.local' añadida al archivo hosts"
}

# ── 5. Base de datos ─────────────────────────────────────────────────────────

Write-Host ""
Write-Host "[5/7] Configurando base de datos..."

$envContent = Get-Content "$SCRIPT_DIR\.env"
$dbPass = ($envContent | Where-Object { $_ -match "^DB_PASSWORD=" }) -replace "^DB_PASSWORD=", "" -replace '"', ''
$dbName = ($envContent | Where-Object { $_ -match "^DB_NAME=" })     -replace "^DB_NAME=", ""     -replace '"', ''
$dbUser = ($envContent | Where-Object { $_ -match "^DB_USER=" })     -replace "^DB_USER=", ""     -replace '"', ''

$sqlCommands = @"
CREATE DATABASE IF NOT EXISTS ``${dbName}``;
CREATE USER IF NOT EXISTS '${dbUser}'@'localhost' IDENTIFIED BY '${dbPass}';
GRANT ALL PRIVILEGES ON ``${dbName}``.* TO '${dbUser}'@'localhost';
FLUSH PRIVILEGES;
"@

$mysqlArgs = @("-u", $MYSQL_ROOT)
if ($MYSQL_PASS -ne "") { $mysqlArgs += @("-p$MYSQL_PASS") }

$sqlCommands | & "$MYSQL_BIN\mysql.exe" @mysqlArgs

# ── 6. Backend con PM2 ───────────────────────────────────────────────────────

Write-Host ""
Write-Host "[6/7] Iniciando backend con PM2..."

pm2 delete mindtracker 2>$null
pm2 start "$HTDOCS\server.js" --name "mindtracker" --cwd $HTDOCS
pm2 save

# Startup automatico en Windows
if (Get-Command pm2-startup -ErrorAction SilentlyContinue) {
    pm2-startup install
} else {
    Write-Host ""
    Write-Host "  Para arranque automatico con Windows instala:" -ForegroundColor Yellow
    Write-Host "    npm install -g pm2-windows-startup" -ForegroundColor Yellow
    Write-Host "    pm2-startup install" -ForegroundColor Yellow
}

# ── 7. Reiniciar Apache ──────────────────────────────────────────────────────

Write-Host ""
Write-Host "[7/7] Reiniciando Apache..."

# Intentar por servicio Windows primero, luego por proceso
$restarted = $false
foreach ($svcName in @("Apache2.4", "Apache")) {
    $svc = Get-Service -Name $svcName -ErrorAction SilentlyContinue
    if ($svc) {
        Restart-Service $svcName
        $restarted = $true
        break
    }
}

if (-not $restarted) {
    # Apache no corre como servicio: matar y reiniciar el proceso
    Get-Process httpd -ErrorAction SilentlyContinue | Stop-Process -Force
    Start-Sleep -Seconds 2
    Start-Process -FilePath "$APACHE_BIN\httpd.exe" -NoNewWindow
    Write-Host "  Apache reiniciado como proceso (no como servicio)"
}

# ── Verificacion final ───────────────────────────────────────────────────────

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "=== Verificacion ===" -ForegroundColor Cyan

$apacheOk = (Get-Process httpd -ErrorAction SilentlyContinue) -ne $null
$mysqlOk  = (Get-Process mysqld -ErrorAction SilentlyContinue) -ne $null
$pm2Out   = pm2 list 2>$null | Out-String
$nodeOk   = $pm2Out -match "mindtracker"

if ($apacheOk) { Write-Host "✓ Apache   funcionando" -ForegroundColor Green }
else           { Write-Host "✗ Apache   no funciona (abre XAMPP Control Panel y arranca Apache)" -ForegroundColor Red }

if ($mysqlOk)  { Write-Host "✓ MySQL    funcionando" -ForegroundColor Green }
else           { Write-Host "✗ MySQL    no funciona (abre XAMPP Control Panel y arranca MySQL)" -ForegroundColor Red }

if ($nodeOk)   { Write-Host "✓ Node.js  funcionando" -ForegroundColor Green }
else           { Write-Host "✗ Node.js  no funciona - revisa: pm2 logs mindtracker" -ForegroundColor Red }

Write-Host ""
Write-Host "=== Despliegue completado ===" -ForegroundColor Cyan
Write-Host "Disponible en: http://mindtracker.local  o  http://localhost" -ForegroundColor White
Write-Host ""
Write-Host "Logs:   pm2 logs mindtracker"
Write-Host "Estado: pm2 status"
