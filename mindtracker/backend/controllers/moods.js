import { UserModel, MoodModel } from '../models/mariadb.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export async function createUser (req, res) {
  try {
    const { name, lastName, telephone, email, password } = req.body

    if (!name || !lastName || !telephone || !email || !password) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' })
    }

    const existingUser = await UserModel.findByEmail(email)
    if (existingUser) {
      return res.status(400).json({ message: 'El email ya está registrado' })
    }

    const user = await UserModel.create({ name, lastName, telephone, email, password })

    return res.status(201).json({
      message: 'Usuario creado exitosamente',
      user: { id: user.id, name: user.name, email: user.email }
    })
  } catch (error) {
    console.error('Error creating user:', error)
    return res.status(500).json({ error: 'Internal server Error' })
  }
}

export async function loginUser (req, res) {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña requeridos' })
    }

    const user = await UserModel.findByEmail(email)
    if (!user) {
      return res.status(400).json({ message: 'Usuario no encontrado' })
    }

    const equal = await UserModel.verifyPassword(password, user.password)
    if (!equal) {
      return res.status(400).json({ message: 'Contraseña incorrecta' })
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    )

    res.cookie('jwt', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000
    })

    return res.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email }
    })
  } catch (error) {
    console.error('Error en login:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export async function addMood (req, res) {
  try {
    const { mood, notes, date } = req.body

    if (!mood || !notes || !date) {
      return res.status(400).json({ error: 'Todos los campos deben estar completos' })
    }

    const userId = req.user.id

    const user = await UserModel.findById(userId)
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    const moodCreated = await MoodModel.create({ userId, mood, notes, date })

    return res.status(201).json({
      id: moodCreated.id,
      mood: moodCreated.mood,
      notes: moodCreated.notes,
      date: new Date(moodCreated.date).toISOString().split('T')[0]
    })
  } catch (error) {
    console.error('Error adding mood:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

// TODO: añadir paginación cuando haya muchos registros
export async function getLogs (req, res) {
  try {
    const userId = req.user.id
    const { from, to, limit } = req.query

    const user = await UserModel.findById(userId)
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    const feelings = await MoodModel.getLogsByUser({ userId, from, to, limit })
    const count = await MoodModel.countByUser({ userId })

    return res.json({
      id: user.id,
      username: user.name,
      count,
      log: feelings.map(f => ({
        id: f.id,
        mood: f.mood,
        notes: f.notes,
        date: new Date(f.date).toISOString().split('T')[0]
      }))
    })
  } catch (error) {
    console.error('Error getting logs:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export async function updateMood (req, res) {
  try {
    const { id } = req.params
    const { mood, notes, date } = req.body
    const userId = req.user.id

    if (!mood || !notes || !date) {
      return res.status(400).json({ error: 'Todos los campos deben estar completos' })
    }

    const updatedMood = await MoodModel.updateById({ id, userId, mood, notes, date })

    if (!updatedMood) {
      return res.status(404).json({ error: 'Registro de estado de ánimo no encontrado' })
    }

    return res.json({
      id: updatedMood.id,
      mood: updatedMood.mood,
      notes: updatedMood.notes,
      date: new Date(updatedMood.date).toDateString()
    })
  } catch (error) {
    console.error('Error updating mood:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export async function deleteMood (req, res) {
  try {
    const { id } = req.params
    const userId = req.user.id

    const deleted = await MoodModel.deleteById({ id, userId })

    if (!deleted) {
      return res.status(404).json({ error: 'Registro no encontrado' })
    }

    return res.json({ message: 'Registro eliminado' })
  } catch (error) {
    console.error('Error deleting mood:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export async function getProfile (req, res) {
  try {
    const user = await UserModel.findById(req.user.id)
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' })
    return res.json({
      id: user.id,
      name: user.name,
      lastName: user.lastName,
      telephone: user.telephone,
      email: user.email
    })
  } catch (error) {
    console.error('Error getting profile:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export async function updateProfile (req, res) {
  try {
    const { name, lastName, telephone } = req.body
    if (!name || !lastName) {
      return res.status(400).json({ error: 'Nombre y apellidos son requeridos' })
    }
    const user = await UserModel.updateProfile({ id: req.user.id, name, lastName, telephone })
    return res.json({ name: user.name, lastName: user.lastName, telephone: user.telephone })
  } catch (error) {
    console.error('Error updating profile:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export async function changePassword (req, res) {
  try {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Contraseña actual y nueva son requeridas' })
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' })
    }
    const user = await UserModel.findByEmail(req.user.email)
    const valid = await UserModel.verifyPassword(currentPassword, user.password)
    if (!valid) return res.status(400).json({ error: 'Contraseña actual incorrecta' })

    const hashed = await bcrypt.hash(newPassword, 10)
    await UserModel.updatePassword({ id: req.user.id, hashedPassword: hashed })
    return res.json({ message: 'Contraseña actualizada correctamente' })
  } catch (error) {
    console.error('Error changing password:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
