import { HabitModel, HabitLogModel } from '../models/mariadb.js'

export async function getHabits (req, res) {
  try {
    const habits = await HabitModel.getAll()
    return res.json(habits)
  } catch (error) {
    console.error('Error obteniendo hábitos:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export async function logHabit (req, res) {
  try {
    const { habitId, habitOptionId, date } = req.body
    const userId = req.user.id

    if (!habitId || !habitOptionId || !date) {
      return res.status(400).json({ error: 'habitId, habitOptionId y date son requeridos' })
    }

    const habit = await HabitModel.getById(habitId)
    if (!habit) {
      return res.status(404).json({ error: 'Hábito no encontrado' })
    }

    // comprobamos que la opcion elegida pertenece realmente a ese habito
    const validOption = habit.options.some(o => Number(o.id) === Number(habitOptionId))
    if (!validOption) {
      return res.status(400).json({ error: 'La opción no pertenece al hábito indicado' })
    }

    // upsert: si ya hay un registro para ese dia lo actualiza en vez de duplicar
    const log = await HabitLogModel.upsert({ userId, habitId, habitOptionId, date })
    return res.status(201).json(log)
  } catch (err) {
    console.error('Error registrando hábito:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export async function getHabitLogs (req, res) {
  try {
    const userId = req.user.id
    const { from, to } = req.query
    const logs = await HabitLogModel.getLogsByUser({ userId, from, to })
    return res.json(logs)
  } catch (error) {
    console.error('Error obteniendo logs de hábitos:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export async function getHabitLogsByDate (req, res) {
  try {
    const userId = req.user.id
    const { date } = req.params
    const logs = await HabitLogModel.getLogsByUserAndDate({ userId, date })
    return res.json(logs)
  } catch (error) {
    console.error('Error obteniendo logs por fecha:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export async function deleteHabitLog (req, res) {
  try {
    const { id } = req.params
    const userId = req.user.id

    const deleted = await HabitLogModel.deleteById({ id, userId })

    if (!deleted) {
      return res.status(404).json({ error: 'Registro no encontrado' })
    }

    return res.json({ message: 'Registro eliminado' })
  } catch (error) {
    console.error('Error eliminando log de hábito:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
