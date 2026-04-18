import { Router } from 'express'
import { getHabits, logHabit, getHabitLogs, getHabitLogsByDate, deleteHabitLog } from '../controllers/habits.js'
import { verifyToken } from '../middleware/authentication.js'

export const habitRouter = Router()

habitRouter.get('/api/habits', verifyToken, getHabits)
habitRouter.post('/api/habits/logs', verifyToken, logHabit)
habitRouter.get('/api/habits/logs', verifyToken, getHabitLogs)
habitRouter.get('/api/habits/logs/date/:date', verifyToken, getHabitLogsByDate)
habitRouter.delete('/api/habits/logs/:id', verifyToken, deleteHabitLog)
