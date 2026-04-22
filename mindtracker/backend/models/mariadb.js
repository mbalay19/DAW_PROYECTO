import * as mariadb from 'mariadb'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'

dotenv.config()

// el pool reutiliza conexiones en vez de abrir una nueva por peticion
const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 5,
  allowPublicKeyRetrieval: true
})

/**
 * Crea las tablas necesarias si no existen y rellena los hábitos iniciales.
 * @returns {Promise<void>}
 */
export async function initializeDatabase () {
  let conn
  try {
    conn = await pool.getConnection()

    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        lastName VARCHAR(100) NOT NULL,
        telephone VARCHAR(20),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await conn.query(`
      CREATE TABLE IF NOT EXISTS moods (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        mood INT NOT NULL CHECK (mood >= 0 AND mood <= 10),
        notes TEXT,
        date DATE NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `)

    await conn.query(`
      CREATE TABLE IF NOT EXISTS habits (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description VARCHAR(255),
        icon VARCHAR(50),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await conn.query(`
      CREATE TABLE IF NOT EXISTS habit_options (
        id INT AUTO_INCREMENT PRIMARY KEY,
        habitId INT NOT NULL,
        label VARCHAR(100) NOT NULL,
        sortOrder INT DEFAULT 0,
        FOREIGN KEY (habitId) REFERENCES habits(id) ON DELETE CASCADE
      )
    `)

    await conn.query(`
      CREATE TABLE IF NOT EXISTS habit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        habitId INT NOT NULL,
        habitOptionId INT NOT NULL,
        date DATE NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_habit_date (userId, habitId, date),
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (habitId) REFERENCES habits(id) ON DELETE CASCADE,
        FOREIGN KEY (habitOptionId) REFERENCES habit_options(id) ON DELETE CASCADE
      )
    `)

    await seedHabits(conn)

    // solo imprime la primera vez que se arranca, después las tablas ya existen
    console.log('DB lista')
  } catch (error) {
    console.error('Error inicializando la base de datos:', error)
    throw error
  } finally {
    if (conn) conn.release()
  }
}

async function seedHabits (conn) {
  const [{ count }] = await conn.query('SELECT COUNT(*) as count FROM habits')
  if (Number(count) > 0) return

  const habitsData = [
    {
      name: 'Sueño',
      description: 'Horas de sueño',
      icon: 'moon',
      options: ['Menos de 5h', '5-6h', '6-7h', '7-8h', 'Más de 8h']
    },
    {
      name: 'Deporte',
      description: 'Actividad física',
      icon: 'dumbbell',
      options: ['No hice', '15-30min', '30-60min', 'Más de 1h']
    },
    {
      name: 'Lectura',
      description: 'Tiempo de lectura',
      icon: 'book',
      options: ['No leí', '15-30min', '30-60min', 'Más de 1h']
    },
    {
      name: 'Estudio',
      description: 'Tiempo de estudio',
      icon: 'pencil',
      options: ['No estudié', '30min-1h', '1-2h', 'Más de 2h']
    },
    {
      name: 'Alimentación',
      description: 'Calidad de la dieta',
      icon: 'apple',
      options: ['Muy mala', 'Mala', 'Regular', 'Buena', 'Muy buena']
    }
  ]

  for (const habit of habitsData) {
    const result = await conn.query(
      'INSERT INTO habits (name, description, icon) VALUES (?, ?, ?)',
      [habit.name, habit.description, habit.icon]
    )
    const habitId = result.insertId

    for (let i = 0; i < habit.options.length; i++) {
      await conn.query(
        'INSERT INTO habit_options (habitId, label, sortOrder) VALUES (?, ?, ?)',
        [habitId, habit.options[i], i]
      )
    }
  }
}

export class UserModel {
  /**
   * Crea un nuevo usuario hasheando la contraseña antes de guardarla.
   * @param {{ name: string, lastName: string, telephone: string, email: string, password: string }} param0
   * @returns {Promise<Object>} usuario creado (sin contraseña)
   */
  static async create ({ name, lastName, telephone, email, password }) {
    let conn
    try {
      conn = await pool.getConnection()
      const hashedPassword = await bcrypt.hash(password, 10)

      const result = await conn.query(
        'INSERT INTO users (name, lastName, telephone, email, password) VALUES (?, ?, ?, ?, ?)',
        [name, lastName, telephone, email, hashedPassword]
      )

      const user = await conn.query(
        'SELECT id, name, lastName, telephone, email, createdAt FROM users WHERE id = ?',
        [result.insertId]
      )

      return user[0]
    } finally {
      if (conn) conn.release()
    }
  }

  /**
   * Busca un usuario por email, devuelve null si no existe.
   * @param {string} email
   * @returns {Promise<Object|null>}
   */
  static async findByEmail (email) {
    let conn
    try {
      conn = await pool.getConnection()
      const users = await conn.query('SELECT * FROM users WHERE email = ?', [email])
      return users[0] || null
    } finally {
      if (conn) conn.release()
    }
  }

  /**
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  static async findById (id) {
    let conn
    try {
      conn = await pool.getConnection()
      const users = await conn.query(
        'SELECT id, name, lastName, telephone, email, createdAt FROM users WHERE id = ?',
        [id]
      )
      return users[0] || null
    } finally {
      if (conn) conn.release()
    }
  }

  /**
   * Compara la contraseña en texto plano con el hash guardado en la BD.
   * @param {string} plainPassword
   * @param {string} hashedPassword
   * @returns {Promise<boolean>}
   */
  static async verifyPassword (plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword)
  }

  /**
   * @param {{ id: number, name: string, lastName: string, telephone: string }} param0
   * @returns {Promise<Object>} usuario actualizado
   */
  static async updateProfile ({ id, name, lastName, telephone }) {
    let conn
    try {
      conn = await pool.getConnection()
      await conn.query(
        'UPDATE users SET name = ?, lastName = ?, telephone = ? WHERE id = ?',
        [name, lastName, telephone, id]
      )
      return await UserModel.findById(id)
    } finally {
      if (conn) conn.release()
    }
  }

  /**
   * @param {{ id: number, hashedPassword: string }} param0
   * @returns {Promise<void>}
   */
  static async updatePassword ({ id, hashedPassword }) {
    const conn = await pool.getConnection()
    await conn.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id])
    conn.release()
  }
}

export class MoodModel {
  /**
   * Inserta un nuevo registro de estado de ánimo.
   * @param {{ userId: number, mood: number, notes: string, date: string }} param0
   * @returns {Promise<Object>} registro creado
   */
  static async create ({ userId, mood, notes, date }) {
    let conn
    try {
      conn = await pool.getConnection()

      const moodValue = Number(mood)
      if (isNaN(moodValue) || moodValue < 0 || moodValue > 10) {
        throw new Error('El valor del estado de ánimo debe estar entre 0 y 10')
      }

      const moodDate = date ? new Date(date) : new Date()
      const formattedDate = moodDate.toISOString().split('T')[0]

      const result = await conn.query(
        'INSERT INTO moods (userId, mood, notes, date) VALUES (?, ?, ?, ?)',
        [userId, moodValue, notes, formattedDate]
      )

      const newMood = await conn.query('SELECT * FROM moods WHERE id = ?', [result.insertId])
      return newMood[0]
    } finally {
      if (conn) conn.release()
    }
  }

  /**
   * Obtiene los registros de mood de un usuario con filtros opcionales.
   * @param {{ userId: number, from: string, to: string, limit: number }} param0
   * @returns {Promise<Object[]>}
   */
  static async getLogsByUser ({ userId, from, to, limit }) {
    let conn
    try {
      conn = await pool.getConnection()

      let query = 'SELECT * FROM moods WHERE userId = ?'
      const params = [userId]

      if (from && to) {
        query += ' AND date BETWEEN ? AND ?'
        params.push(from, to)
      } else if (from) {
        query += ' AND date >= ?'
        params.push(from)
      } else if (to) {
        query += ' AND date <= ?'
        params.push(to)
      }

      query += ' ORDER BY date DESC'

      if (limit) {
        query += ' LIMIT ?'
        params.push(Number(limit))
      }

      return await conn.query(query, params)
    } finally {
      if (conn) conn.release()
    }
  }

  /**
   * @param {{ userId: number }} param0
   * @returns {Promise<number>} total de registros del usuario
   */
  static async countByUser ({ userId }) {
    const conn = await pool.getConnection()
    try {
      const [row] = await conn.query(
        'SELECT COUNT(*) as count FROM moods WHERE userId = ?',
        [userId]
      )
      return Number(row.count)
    } finally {
      conn.release()
    }
  }

  /**
   * Actualiza un registro de mood. Devuelve null si no existe o no pertenece al usuario.
   * @param {{ id: number, userId: number, mood: number, notes: string, date: string }} param0
   * @returns {Promise<Object|null>}
   */
  static async updateById ({ id, userId, mood, notes, date }) {
    let conn
    try {
      conn = await pool.getConnection()

      const moodValue = Number(mood)
      if (isNaN(moodValue) || moodValue < 0 || moodValue > 10) {
        throw new Error('El valor del estado de ánimo debe estar entre 0 y 10')
      }

      await conn.query(
        'UPDATE moods SET mood = ?, notes = ?, date = ? WHERE id = ? AND userId = ?',
        [moodValue, notes, date, id, userId]
      )

      const updatedMood = await conn.query(
        'SELECT * FROM moods WHERE id = ? AND userId = ?',
        [id, userId]
      )

      return updatedMood[0] || null
    } finally {
      if (conn) conn.release()
    }
  }

  /**
   * @param {{ id: number, userId: number }} param0
   * @returns {Promise<boolean>} true si se eliminó, false si no existía
   */
  static async deleteById ({ id, userId }) {
    let conn
    try {
      conn = await pool.getConnection()
      const result = await conn.query(
        'DELETE FROM moods WHERE id = ? AND userId = ?',
        [id, userId]
      )
      return result.affectedRows > 0
    } finally {
      if (conn) conn.release()
    }
  }
}

export class HabitModel {
  /**
   * Devuelve todos los hábitos con sus opciones incluidas.
   * @returns {Promise<Object[]>}
   */
  static async getAll () {
    let conn
    try {
      conn = await pool.getConnection()

      const habits = await conn.query('SELECT * FROM habits ORDER BY id')
      const options = await conn.query('SELECT * FROM habit_options ORDER BY habitId, sortOrder')

      return habits.map(habit => ({
        ...habit,
        options: options.filter(o => Number(o.habitId) === Number(habit.id))
      }))
    } finally {
      if (conn) conn.release()
    }
  }

  /**
   * @param {number} id
   * @returns {Promise<Object|null>} hábito con sus opciones, o null si no existe
   */
  static async getById (id) {
    let conn
    try {
      conn = await pool.getConnection()

      const habits = await conn.query('SELECT * FROM habits WHERE id = ?', [id])
      if (!habits[0]) return null

      const options = await conn.query(
        'SELECT * FROM habit_options WHERE habitId = ? ORDER BY sortOrder',
        [id]
      )

      return { ...habits[0], options }
    } finally {
      if (conn) conn.release()
    }
  }
}

export class HabitLogModel {
  /**
   * Inserta o actualiza el log de un hábito para una fecha (ON DUPLICATE KEY UPDATE).
   * @param {{ userId: number, habitId: number, habitOptionId: number, date: string }} param0
   * @returns {Promise<Object|null>} log resultante con los datos del hábito y la opción
   */
  static async upsert ({ userId, habitId, habitOptionId, date }) {
    let conn
    try {
      conn = await pool.getConnection()

      await conn.query(
        `INSERT INTO habit_logs (userId, habitId, habitOptionId, date)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE habitOptionId = ?`,
        [userId, habitId, habitOptionId, date, habitOptionId]
      )

      const logs = await conn.query(
        `SELECT hl.*, ho.label, h.name AS habitName
         FROM habit_logs hl
         JOIN habit_options ho ON hl.habitOptionId = ho.id
         JOIN habits h ON hl.habitId = h.id
         WHERE hl.userId = ? AND hl.habitId = ? AND hl.date = ?`,
        [userId, habitId, date]
      )

      return logs[0] || null
    } finally {
      if (conn) conn.release()
    }
  }

  /**
   * @param {{ userId: number, from: string, to: string }} param0
   * @returns {Promise<Object[]>}
   */
  static async getLogsByUser ({ userId, from, to }) {
    let conn
    try {
      conn = await pool.getConnection()

      let query = `
        SELECT hl.id, hl.date, hl.habitId, hl.habitOptionId,
               h.name AS habitName, h.icon AS habitIcon,
               ho.label AS optionLabel
        FROM habit_logs hl
        JOIN habits h ON hl.habitId = h.id
        JOIN habit_options ho ON hl.habitOptionId = ho.id
        WHERE hl.userId = ?
      `
      const params = [userId]

      if (from && to) {
        query += ' AND hl.date BETWEEN ? AND ?'
        params.push(from, to)
      } else if (from) {
        query += ' AND hl.date >= ?'
        params.push(from)
      } else if (to) {
        query += ' AND hl.date <= ?'
        params.push(to)
      }

      query += ' ORDER BY hl.date DESC, h.id'

      return await conn.query(query, params)
    } finally {
      if (conn) conn.release()
    }
  }

  /**
   * @param {{ userId: number, date: string }} param0
   * @returns {Promise<Object[]>}
   */
  static async getLogsByUserAndDate ({ userId, date }) {
    let conn
    try {
      conn = await pool.getConnection()

      return await conn.query(
        `SELECT hl.id, hl.date, hl.habitId, hl.habitOptionId,
                h.name AS habitName, h.icon AS habitIcon,
                ho.label AS optionLabel
         FROM habit_logs hl
         JOIN habits h ON hl.habitId = h.id
         JOIN habit_options ho ON hl.habitOptionId = ho.id
         WHERE hl.userId = ? AND hl.date = ?
         ORDER BY h.id`,
        [userId, date]
      )
    } finally {
      if (conn) conn.release()
    }
  }

  /**
   * @param {{ id: number, userId: number }} param0
   * @returns {Promise<boolean>}
   */
  static async deleteById ({ id, userId }) {
    const conn = await pool.getConnection()
    try {
      const result = await conn.query(
        'DELETE FROM habit_logs WHERE id = ? AND userId = ?',
        [id, userId]
      )
      return result.affectedRows > 0
    } finally {
      conn.release()
    }
  }
}

export { pool }

initializeDatabase().catch(console.error)
