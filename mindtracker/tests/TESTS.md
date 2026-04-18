# Tests — MindTracker

Pruebas de integración contra la API. Se usan `node:test` y `supertest`.

Para ejecutarlos: `npm test`

Cada ejecución crea un usuario con email único (`test_<timestamp>@...`) para no ensuciar la base de datos con datos repetidos.

---

## auth.test.js

Cubre registro, login, `/api/me` y logout.

- registro correcto → 201
- registro con email duplicado → 400
- registro sin campos → 400
- login correcto → 200 + cookie jwt
- login con contraseña mal → 400
- login con usuario que no existe → 400
- login sin contraseña → 400
- `/api/me` sin token → 401
- `/api/me` con token → 200
- logout → 200 + limpia cookie

## api.test.js

Cubre moods, hábitos y perfil. Antes de correr hace login y guarda la cookie.

- endpoints protegidos sin token → 401 (logs, moods, habits)
- GET /api/habits → devuelve array con opciones
- crear mood → 201
- obtener historial → 200
- crear mood sin campos → 400
- eliminar mood → 200
- eliminar mood que no existe → 404
- registrar hábito → 201
- registrar mismo hábito dos veces el mismo día (upsert) → 201 sin duplicar
- hábitos por fecha → 200 con habitName y optionLabel
- registrar hábito sin campos → 400
- GET perfil → 200
- PUT perfil → 200 con datos actualizados
