import express, { json } from 'express'
import cookieParser from 'cookie-parser'
import { moodRouter } from './backend/routes/moods.js'
import { habitRouter } from './backend/routes/habits.js'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DIST = path.join(__dirname, 'client/dist')

const app = express()

app.use(cookieParser())
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}))
app.use(express.static(DIST))
app.use(express.urlencoded({ extended: false }))
app.use(json())
app.disable('x-powered-by')

app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  next()
})

app.use('/', moodRouter)
app.use('/', habitRouter)

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(DIST, 'index.html'))
})

export { app }

// solo escucha si es el punto de entrada, no cuando se importa desde tests
if (process.argv[1] === __filename) {
  const PORT = process.env.PORT ?? 2345
  app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`)
  })
}
