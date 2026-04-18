import { Router } from 'express'
import { createUser, loginUser, addMood, getLogs, updateMood, deleteMood, getProfile, updateProfile, changePassword } from '../controllers/moods.js'
import { verifyToken } from '../middleware/authentication.js'

export const moodRouter = Router()

moodRouter.get('/api/me', verifyToken, (req, res) => {
  res.json({ id: req.user.id, name: req.user.name, email: req.user.email })
})

moodRouter.post('/auth/register', createUser)
moodRouter.post('/auth/login', loginUser)

moodRouter.post('/auth/logout', (req, res) => {
  res.clearCookie('jwt')
  res.json({ success: true })
})

moodRouter.post('/api/users/moods', verifyToken, addMood)
moodRouter.get('/api/users/logs', verifyToken, getLogs)
moodRouter.put('/api/users/moods/:id', verifyToken, updateMood)
moodRouter.delete('/api/users/moods/:id', verifyToken, deleteMood)

moodRouter.get('/api/users/profile', verifyToken, getProfile)
moodRouter.put('/api/users/profile', verifyToken, updateProfile)
moodRouter.put('/api/users/password', verifyToken, changePassword)
