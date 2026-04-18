# Documentación de pruebas — MindTracker

Suite de pruebas de integración para la API REST. Se ejecutan contra la base de datos real usando un usuario de prueba con email único generado en cada ejecución (`test_<timestamp>@prueba.com`), lo que evita conflictos entre ejecuciones. Al finalizar se cierra el pool de conexiones y el servidor HTTP de prueba.

**Herramientas:** `node:test` (runner nativo de Node.js v20) + `supertest` (cliente HTTP para Express)

**Ejecución:** `npm test`

**Resultado de la última ejecución:** 25 tests — 25 pasados — 0 fallidos

---

## Archivo: `auth.test.js`

Cubre el flujo completo de autenticación: registro, login, verificación de sesión y cierre de sesión.

---

### Suite: `POST /auth/register`

#### T-01 — Registro de usuario nuevo

**Objetivo:** Verificar que un usuario puede registrarse con todos los campos correctos y que el servidor devuelve los datos del usuario creado.

**Qué hace:** Envía una petición POST con nombre, apellidos, teléfono, email y contraseña válidos.

**Comprueba:**
- El código de respuesta es `201 Created`
- El cuerpo contiene el objeto `user`
- El email del usuario devuelto coincide con el enviado

**Resultado:** PASA

---

#### T-02 — Registro con email duplicado

**Objetivo:** Verificar que el sistema impide registrar dos cuentas con el mismo email.

**Qué hace:** Envía exactamente los mismos datos del test anterior (mismo email).

**Comprueba:**
- El código de respuesta es `400 Bad Request`
- El mensaje de error contiene la palabra "registrado"

**Resultado:** PASA

---

#### T-03 — Registro con campos faltantes

**Objetivo:** Verificar que el backend valida la presencia de todos los campos obligatorios y rechaza registros incompletos.

**Qué hace:** Envía solo email y contraseña, omitiendo nombre, apellidos y teléfono.

**Comprueba:**
- El código de respuesta es `400 Bad Request`

**Resultado:** PASA

---

### Suite: `POST /auth/login`

#### T-04 — Login correcto

**Objetivo:** Verificar que un usuario registrado puede iniciar sesión y que el servidor emite correctamente el token JWT en una cookie HttpOnly.

**Qué hace:** Envía email y contraseña válidos del usuario creado en T-01.

**Comprueba:**
- El código de respuesta es `200 OK`
- El cuerpo contiene el objeto `user` con el email correcto
- La cabecera `set-cookie` existe y contiene una cookie que empieza por `jwt=`

**Resultado:** PASA

---

#### T-05 — Login con contraseña incorrecta

**Objetivo:** Verificar que el sistema rechaza intentos de login con contraseña errónea sin revelar si el usuario existe.

**Qué hace:** Envía el email correcto pero una contraseña incorrecta.

**Comprueba:**
- El código de respuesta es `400 Bad Request`
- El mensaje de error contiene la palabra "incorrecta" (sin distinguir mayúsculas)

**Resultado:** PASA

---

#### T-06 — Login con usuario inexistente

**Objetivo:** Verificar que el sistema responde con error cuando el email no está registrado.

**Qué hace:** Envía un email que no existe en la base de datos.

**Comprueba:**
- El código de respuesta es `400 Bad Request`
- El mensaje contiene "no encontrado" (sin distinguir mayúsculas)

**Resultado:** PASA

---

#### T-07 — Login sin contraseña

**Objetivo:** Verificar que el backend valida la presencia de ambos campos y rechaza peticiones incompletas.

**Qué hace:** Envía solo el email, sin incluir la contraseña.

**Comprueba:**
- El código de respuesta es `400 Bad Request`

**Resultado:** PASA

---

### Suite: `GET /api/me`

#### T-08 — Acceso sin token

**Objetivo:** Verificar que las rutas protegidas rechazan peticiones sin autenticación.

**Qué hace:** Solicita `/api/me` sin ninguna cookie.

**Comprueba:**
- El código de respuesta es `401 Unauthorized`

**Resultado:** PASA

---

#### T-09 — Acceso con token válido

**Objetivo:** Verificar que un usuario autenticado puede recuperar su información de sesión a partir de la cookie JWT.

**Qué hace:** Hace login primero para obtener la cookie y luego llama a `/api/me` adjuntándola.

**Comprueba:**
- El código de respuesta es `200 OK`
- El email devuelto coincide con el del usuario autenticado

**Resultado:** PASA

---

### Suite: `POST /auth/logout`

#### T-10 — Cierre de sesión

**Objetivo:** Verificar que el logout devuelve confirmación y elimina o expira la cookie JWT.

**Qué hace:** Envía POST a `/auth/logout`.

**Comprueba:**
- El código de respuesta es `200 OK`
- El cuerpo contiene `success: true`
- Si la cabecera `set-cookie` devuelve la cookie `jwt`, esta debe contener `Expires` o estar vacía

**Resultado:** PASA

---

## Archivo: `api.test.js`

Cubre los endpoints protegidos de la API: moods, hábitos y perfil de usuario. Antes de ejecutarse, registra un usuario de prueba, hace login y guarda la cookie para usarla en todos los tests del archivo.

---

### Suite: `Endpoints protegidos sin autenticación`

#### T-11 — `GET /api/users/logs` sin token

**Objetivo:** Confirmar que el historial de moods no es accesible sin autenticación.

**Comprueba:** Código `401 Unauthorized`

**Resultado:** PASA

---

#### T-12 — `POST /api/users/moods` sin token

**Objetivo:** Confirmar que no se puede crear un mood sin autenticación.

**Comprueba:** Código `401 Unauthorized`

**Resultado:** PASA

---

#### T-13 — `GET /api/habits` sin token

**Objetivo:** Confirmar que el catálogo de hábitos tampoco es accesible sin autenticación.

**Comprueba:** Código `401 Unauthorized`

**Resultado:** PASA

---

### Suite: `GET /api/habits`

#### T-14 — Obtener catálogo de hábitos

**Objetivo:** Verificar que el endpoint devuelve todos los hábitos del sistema junto con sus opciones configuradas.

**Qué hace:** Solicita `/api/habits` con la cookie de sesión.

**Comprueba:**
- Código `200 OK`
- La respuesta es un array con al menos un elemento
- Cada hábito tiene `id`, `name` y un array `options` con al menos una opción

**Resultado:** PASA

---

### Suite: `Moods CRUD`

#### T-15 — Crear entrada de estado de ánimo

**Objetivo:** Verificar que se puede registrar un mood con valor numérico, notas y fecha, y que el servidor devuelve el registro creado.

**Qué hace:** Envía `{ mood: 7, notes: "Buen día de prueba", date: <hoy> }`.

**Comprueba:**
- Código `201 Created`
- El valor `mood` devuelto es 7
- Las notas coinciden con las enviadas
- El registro tiene `id` (se guarda para T-18)

**Resultado:** PASA

---

#### T-16 — Obtener historial de moods

**Objetivo:** Verificar que el historial del usuario devuelve los registros existentes con el contador correcto.

**Qué hace:** Solicita `GET /api/users/logs` con la cookie de sesión.

**Comprueba:**
- Código `200 OK`
- `log` es un array
- `count` es mayor o igual a 1

**Resultado:** PASA

---

#### T-17 — Crear mood con campos faltantes

**Objetivo:** Verificar que el backend rechaza registros de mood incompletos.

**Qué hace:** Envía solo `{ mood: 5 }` sin notas ni fecha.

**Comprueba:**
- Código `400 Bad Request`

**Resultado:** PASA

---

#### T-18 — Eliminar entrada de mood

**Objetivo:** Verificar que un usuario puede eliminar sus propios registros.

**Qué hace:** Envía DELETE a `/api/users/moods/:id` usando el id obtenido en T-15.

**Comprueba:**
- Código `200 OK`

**Resultado:** PASA

---

#### T-19 — Eliminar mood inexistente

**Objetivo:** Verificar que intentar borrar un registro que no existe devuelve 404 en lugar de un error de servidor.

**Qué hace:** Envía DELETE a `/api/users/moods/999999`.

**Comprueba:**
- Código `404 Not Found`

**Resultado:** PASA

---

### Suite: `Habit logs`

Antes de correr esta suite se obtiene automáticamente el id del primer hábito y su primera opción del catálogo.

#### T-20 — Registrar un hábito

**Objetivo:** Verificar que se puede guardar la opción elegida para un hábito en una fecha concreta.

**Qué hace:** Envía `{ habitId, habitOptionId, date: <hoy> }`.

**Comprueba:**
- Código `201 Created`
- El registro devuelto tiene `id`
- El `habitId` del registro coincide con el enviado

**Resultado:** PASA

---

#### T-21 — Upsert: registrar el mismo hábito dos veces el mismo día

**Objetivo:** Verificar que registrar el mismo hábito en la misma fecha no genera un error ni duplica el registro, sino que actualiza el existente gracias a la restricción `UNIQUE(userId, habitId, date)`.

**Qué hace:** Envía exactamente los mismos datos que T-20.

**Comprueba:**
- Código `201 Created` (no falla con 409 ni 500)

**Resultado:** PASA

---

#### T-22 — Obtener hábitos por fecha

**Objetivo:** Verificar que el endpoint de consulta por fecha devuelve los hábitos registrados ese día con su nombre e información de opción.

**Qué hace:** Solicita `GET /api/habits/logs/date/<hoy>`.

**Comprueba:**
- Código `200 OK`
- La respuesta es un array con al menos un registro
- Cada registro tiene `habitName` y `optionLabel`

**Resultado:** PASA

---

#### T-23 — Registrar hábito con campos faltantes

**Objetivo:** Verificar que el backend valida los campos obligatorios de un log de hábito.

**Qué hace:** Envía solo `{ habitId }` sin `habitOptionId` ni `date`.

**Comprueba:**
- Código `400 Bad Request`

**Resultado:** PASA

---

### Suite: `Perfil de usuario`

#### T-24 — Obtener perfil

**Objetivo:** Verificar que un usuario autenticado puede consultar sus datos personales.

**Qué hace:** Solicita `GET /api/users/profile` con la cookie de sesión.

**Comprueba:**
- Código `200 OK`
- El cuerpo contiene `name` y `email`

**Resultado:** PASA

---

#### T-25 — Actualizar perfil

**Objetivo:** Verificar que un usuario puede modificar su nombre, apellidos y teléfono.

**Qué hace:** Envía PUT con `{ name: "ApiActualizado", lastName: "TesterActualizado", telephone: "622222222" }`.

**Comprueba:**
- Código `200 OK`
- El `name` devuelto es "ApiActualizado"

**Resultado:** PASA
