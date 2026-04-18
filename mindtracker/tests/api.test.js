import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import { app } from '../App.js'
import { pool } from '../backend/models/mariadb.js'

const testUser = {
  name: 'Test',
  lastName: 'Test',
  telephone: '666666666',
  email: `test_${Date.now()}@test.com`,
  password: 'test1234.'
}

let server
let cookie

before(async () => {
  server = app.listen(0)

  // registramos el usuario de prueba
  await request(server).post('/auth/register').send(testUser)

  // hacemos login y guardamos la cookie para el resto de tests
  const login = await request(server)
    .post('/auth/login')
    .send({ email: testUser.email, password: testUser.password })

  cookie = login.headers['set-cookie'][0]
})

after(async () => {
  server.close()
  await pool.end()
})

describe('Endpoints protegidos sin autenticación', () => {
  it('GET /api/users/logs devuelve 401 sin token', async () => {
    const res = await request(server).get('/api/users/logs')
    assert.equal(res.status, 401)
  })

  it('POST /api/users/moods devuelve 401 sin token', async () => {
    const res = await request(server)
      .post('/api/users/moods')
      .send({ mood: 7, notes: 'test', date: '2025-01-01' })
    assert.equal(res.status, 401)
  })

  it('GET /api/habits devuelve 401 sin token', async () => {
    const res = await request(server).get('/api/habits')
    assert.equal(res.status, 401)
  })
})

describe('GET /api/habits', () => {
  it('devuelve la lista de hábitos con sus opciones', async () => {
    const res = await request(server)
      .get('/api/habits')
      .set('Cookie', cookie)

    assert.equal(res.status, 200)
    assert.ok(Array.isArray(res.body))
    assert.ok(res.body.length > 0)

    const habit = res.body[0]
    assert.ok(habit.id)
    assert.ok(habit.name)
    assert.ok(Array.isArray(habit.options))
    assert.ok(habit.options.length > 0)
  })
})

describe('Moods CRUD', () => {
  const today = new Date().toISOString().split('T')[0]
  let moodId

  it('POST /api/users/moods crea una entrada de ánimo', async () => {
    const res = await request(server)
      .post('/api/users/moods')
      .set('Cookie', cookie)
      .send({ mood: 7, notes: 'Buen día de prueba', date: today })

    assert.equal(res.status, 201)
    assert.equal(res.body.mood, 7)
    assert.equal(res.body.notes, 'Buen día de prueba')
    assert.ok(res.body.id)

    moodId = res.body.id
  })

  it('GET /api/users/logs devuelve el historial del usuario', async () => {
    const res = await request(server)
      .get('/api/users/logs')
      .set('Cookie', cookie)

    assert.equal(res.status, 200)
    assert.ok(Array.isArray(res.body.log))
    assert.ok(res.body.count >= 1)
  })

  it('POST /api/users/moods devuelve 400 si faltan campos', async () => {
    const res = await request(server)
      .post('/api/users/moods')
      .set('Cookie', cookie)
      .send({ mood: 5 })

    assert.equal(res.status, 400)
  })

  it('DELETE /api/users/moods/:id elimina la entrada creada', async () => {
    assert.ok(moodId, 'Se necesita moodId del test anterior')

    const res = await request(server)
      .delete(`/api/users/moods/${moodId}`)
      .set('Cookie', cookie)

    assert.equal(res.status, 200)
  })

  it('DELETE /api/users/moods/:id devuelve 404 si no existe', async () => {
    const res = await request(server)
      .delete('/api/users/moods/999999')
      .set('Cookie', cookie)

    assert.equal(res.status, 404)
  })
})

describe('Habit logs', () => {
  const today = new Date().toISOString().split('T')[0]
  let habitId
  let optionId

  before(async () => {
    // obtenemos el primer hábito y su primera opción para los tests
    const res = await request(server)
      .get('/api/habits')
      .set('Cookie', cookie)

    habitId = res.body[0].id
    optionId = res.body[0].options[0].id
  })

  it('POST /api/habits/logs registra un hábito', async () => {
    const res = await request(server)
      .post('/api/habits/logs')
      .set('Cookie', cookie)
      .send({ habitId, habitOptionId: optionId, date: today })

    assert.equal(res.status, 201)
    assert.ok(res.body.id)
    assert.equal(Number(res.body.habitId), habitId)
  })

  it('POST /api/habits/logs actualiza si ya existe registro del mismo día (upsert)', async () => {
    const res = await request(server)
      .post('/api/habits/logs')
      .set('Cookie', cookie)
      .send({ habitId, habitOptionId: optionId, date: today })

    // no debe fallar, debe actualizar
    assert.equal(res.status, 201)
  })

  it('GET /api/habits/logs/date/:date devuelve los hábitos de esa fecha', async () => {
    const res = await request(server)
      .get(`/api/habits/logs/date/${today}`)
      .set('Cookie', cookie)

    assert.equal(res.status, 200)
    assert.ok(Array.isArray(res.body))
    assert.ok(res.body.length >= 1)

    const log = res.body[0]
    assert.ok(log.habitName)
    assert.ok(log.optionLabel)
  })

  it('POST /api/habits/logs devuelve 400 si faltan campos', async () => {
    const res = await request(server)
      .post('/api/habits/logs')
      .set('Cookie', cookie)
      .send({ habitId })

    assert.equal(res.status, 400)
  })
})

describe('Perfil de usuario', () => {
  it('GET /api/users/profile devuelve los datos del usuario', async () => {
    const res = await request(server)
      .get('/api/users/profile')
      .set('Cookie', cookie)

    assert.equal(res.status, 200)
    assert.ok(res.body.name)
    assert.ok(res.body.email)
  })

  it('PUT /api/users/profile actualiza nombre y apellidos', async () => {
    const res = await request(server)
      .put('/api/users/profile')
      .set('Cookie', cookie)
      .send({ name: 'ApiActualizado', lastName: 'TesterActualizado', telephone: '622222222' })

    assert.equal(res.status, 200)
    assert.equal(res.body.name, 'ApiActualizado')
  })
})
