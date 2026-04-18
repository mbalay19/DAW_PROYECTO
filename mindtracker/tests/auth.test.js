import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import { app } from '../App.js'
import { pool } from '../backend/models/mariadb.js'

// usuario de prueba único para evitar conflictos con la base de datos real
const testUser = {
  name: 'Test',
  lastName: 'Usuario',
  telephone: '600000000',
  email: `test_${Date.now()}@prueba.com`,
  password: 'test1234'
}

let server

before(() => {
  server = app.listen(0)
})

after(async () => {
  server.close()
  await pool.end()
})

describe('POST /auth/register', () => {
  it('registra un usuario nuevo correctamente', async () => {
    const res = await request(server)
      .post('/auth/register')
      .send(testUser)

    assert.equal(res.status, 201)
    assert.ok(res.body.user)
    assert.equal(res.body.user.email, testUser.email)
  })

  it('devuelve 400 si el email ya está registrado', async () => {
    const res = await request(server)
      .post('/auth/register')
      .send(testUser)

    assert.equal(res.status, 400)
    assert.match(res.body.message, /registrado/)
  })

  it('devuelve 400 si faltan campos obligatorios', async () => {
    const res = await request(server)
      .post('/auth/register')
      .send({ email: 'incompleto@prueba.com', password: '123456' })

    assert.equal(res.status, 400)
  })
})

describe('POST /auth/login', () => {
  it('inicia sesión y devuelve cookie jwt', async () => {
    const res = await request(server)
      .post('/auth/login')
      .send({ email: testUser.email, password: testUser.password })

    assert.equal(res.status, 200)
    assert.ok(res.body.user)
    assert.equal(res.body.user.email, testUser.email)

    // comprobamos que viene la cookie
    const cookies = res.headers['set-cookie']
    assert.ok(cookies)
    assert.ok(cookies.some(c => c.startsWith('jwt=')))
  })

  it('devuelve 400 con contraseña incorrecta', async () => {
    const res = await request(server)
      .post('/auth/login')
      .send({ email: testUser.email, password: 'contraseña_mal' })

    assert.equal(res.status, 400)
    assert.match(res.body.message, /incorrecta/i)
  })

  it('devuelve 400 si el usuario no existe', async () => {
    const res = await request(server)
      .post('/auth/login')
      .send({ email: 'noexiste@prueba.com', password: '123456' })

    assert.equal(res.status, 400)
    assert.match(res.body.message, /no encontrado/i)
  })

  it('devuelve 400 si faltan email o contraseña', async () => {
    const res = await request(server)
      .post('/auth/login')
      .send({ email: testUser.email })

    assert.equal(res.status, 400)
  })
})

describe('GET /api/me', () => {
  it('devuelve 401 sin token', async () => {
    const res = await request(server).get('/api/me')
    assert.equal(res.status, 401)
  })

  it('devuelve el usuario autenticado con token válido', async () => {
    // primero hacemos login para obtener la cookie
    const login = await request(server)
      .post('/auth/login')
      .send({ email: testUser.email, password: testUser.password })

    const cookie = login.headers['set-cookie'][0]

    const res = await request(server)
      .get('/api/me')
      .set('Cookie', cookie)

    assert.equal(res.status, 200)
    assert.equal(res.body.email, testUser.email)
  })
})

describe('POST /auth/logout', () => {
  it('cierra sesión y limpia la cookie', async () => {
    const res = await request(server)
      .post('/auth/logout')

    assert.equal(res.status, 200)
    assert.ok(res.body.success)

    // la cookie jwt debe estar vacía o expirada
    const cookies = res.headers['set-cookie']
    if (cookies) {
      const jwtCookie = cookies.find(c => c.startsWith('jwt='))
      if (jwtCookie) {
        assert.ok(jwtCookie.includes('Expires') || jwtCookie === 'jwt=;')
      }
    }
  })
})
