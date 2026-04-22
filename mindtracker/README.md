# MindTracker

Aplicación web para llevar un diario de estado de ánimo y hábitos diarios.
Desarrollada como Proyecto Integrado del ciclo DAW (2º curso, 2025-2026).

## Tecnologías

- **Backend:** Node.js 20 + Express.js 5
- **Base de datos:** MariaDB 10.6
- **Frontend:** React 18 + Vite + React Router v6
- **Autenticación:** JWT en cookies HttpOnly + bcrypt
- **Servidor:** Apache 2.4 (proxy inverso + SSL)

## Funcionalidades

- Registro e inicio de sesión con email y contraseña
- Registro diario del estado de ánimo (escala 0-10 + notas)
- Seguimiento de 5 hábitos: sueño, deporte, lectura, estudio, alimentación
- Historial de registros con etiquetas de hábitos por día
- Edición de perfil y cambio de contraseña

## Instalación

1. Clonar el repositorio e instalar dependencias:

```bash
npm install
cd client && npm install
```

2. Crear el archivo `.env` en la raíz:

```env
PORT=2345
DB_HOST=localhost
DB_PORT=3306
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=mindtracker
JWT_SECRET=tu_secreto_jwt
CORS_ORIGIN=http://localhost:5173
```

3. Compilar el frontend:

```bash
cd client && npm run build
```

4. Arrancar el servidor:

```bash
npm run dev
```

La app queda disponible en `http://localhost:2345`.

## Despliegue en producción

Requiere ejecutar como `root` en una máquina con Debian/Ubuntu:

```bash
sudo ./deploy.sh
```

El script instala y configura Apache 2.4, MariaDB, Node.js y PM2, copia los archivos
a `/var/www/html/mindtracker/` y arranca la aplicación con PM2.

La app queda disponible en `http://mindtracker.local`.

Para ver los logs de la aplicación:

```bash
sudo pm2 logs mindtracker
```

## Estructura

```
├── App.js                  # Punto de entrada Express
├── backend/
│   ├── controllers/        # Lógica de negocio
│   ├── middleware/         # Verificación JWT
│   ├── models/             # Modelos MariaDB
│   └── routes/             # Definición de rutas
└── client/
    └── src/
        ├── App.jsx
        └── pages/
            ├── Login.jsx
            └── Dashboard.jsx
```
