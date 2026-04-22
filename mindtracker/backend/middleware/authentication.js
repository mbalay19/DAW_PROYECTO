import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

/**
 * Middleware que verifica el token JWT guardado en la cookie.
 * Si el token es válido añade req.user con los datos del usuario.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function verifyToken (req, res, next) {
  const token = req.cookies?.jwt
  if (!token) {
    return res.status(401).json({ error: 'Token requerido' })
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch (err) {
    return res.status(401).clearCookie('jwt').json({ error: 'Token inválido' })
  }
}
