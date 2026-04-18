import { useState } from 'react'

const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/

export default function Login ({ onLogin }) {
  const [tab, setTab] = useState('login')

  return (
    <div className='login-page'>
      <div className='login-brand'>
        <div className='login-brand-logo'>
          <i className='fa-solid fa-brain' />
          <span>MindTracker</span>
        </div>
        <p className='login-brand-tagline'>
          Lleva un registro de tu estado de ánimo y hábitos día a día.
        </p>
      </div>

      <div className='login-form-panel'>
        <div className='login-form-inner'>
          <div className='tabs'>
            <button
              className={`tab-btn ${tab === 'login' ? 'active' : ''}`}
              onClick={() => setTab('login')}
            >
              Entrar
            </button>
            <button
              className={`tab-btn ${tab === 'register' ? 'active' : ''}`}
              onClick={() => setTab('register')}
            >
              Registrarse
            </button>
          </div>

          {tab === 'login'
            ? <LoginForm onLogin={onLogin} />
            : <RegisterForm onRegistered={() => setTab('login')} />}
        </div>
      </div>
    </div>
  )
}

function LoginForm ({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit (e) {
    e.preventDefault()
    setError('')

    if (!EMAIL_RE.test(email)) {
      setError('El email no tiene un formato válido.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      })
      const data = await res.json()
      if (res.ok) {
        onLogin(data.user)
      } else {
        setError(data.message || 'Error al iniciar sesión.')
      }
    } catch {
      setError('No se pudo conectar con el servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className='form-field'>
        <label htmlFor='login-email'>Email</label>
        <input
          id='login-email'
          type='email'
          placeholder='tu@email.com'
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoComplete='email'
        />
      </div>
      <div className='form-field'>
        <label htmlFor='login-password'>Contraseña</label>
        <input
          id='login-password'
          type='password'
          placeholder='········'
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          autoComplete='current-password'
        />
      </div>
      {error && <p className='form-error'>{error}</p>}
      <button type='submit' className='btn-primary' disabled={loading}>
        {loading ? 'Entrando...' : 'Iniciar sesión'}
      </button>
    </form>
  )
}

function RegisterForm ({ onRegistered }) {
  const [form, setForm] = useState({
    nombre: '', apellidos: '', telefono: '', email: '', password: '', password2: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  function set (field) {
    return e => setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSubmit (e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!EMAIL_RE.test(form.email)) {
      setError('El email no tiene un formato válido.')
      return
    }
    if (form.password !== form.password2) {
      setError('Las contraseñas no coinciden.')
      return
    }
    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.nombre,
          lastName: form.apellidos,
          telephone: form.telefono,
          email: form.email,
          password: form.password
        })
      })
      const data = await res.json()
      if (res.ok) {
        setSuccess('Cuenta creada. Ya puedes iniciar sesión.')
        setForm({ nombre: '', apellidos: '', telefono: '', email: '', password: '', password2: '' })
        setTimeout(onRegistered, 1500)
      } else {
        setError(data.message || 'Error al crear la cuenta.')
      }
    } catch {
      setError('No se pudo conectar con el servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className='form-field'>
        <label htmlFor='reg-nombre'>Nombre</label>
        <input id='reg-nombre' type='text' placeholder='Tu nombre' value={form.nombre} onChange={set('nombre')} required />
      </div>
      <div className='form-field'>
        <label htmlFor='reg-apellidos'>Apellidos</label>
        <input id='reg-apellidos' type='text' placeholder='Tus apellidos' value={form.apellidos} onChange={set('apellidos')} required />
      </div>
      <div className='form-field'>
        <label htmlFor='reg-telefono'>Teléfono</label>
        <input id='reg-telefono' type='tel' placeholder='+34 600 000 000' value={form.telefono} onChange={set('telefono')} required />
      </div>
      <div className='form-field'>
        <label htmlFor='reg-email'>Email</label>
        <input id='reg-email' type='email' placeholder='tu@email.com' value={form.email} onChange={set('email')} required autoComplete='email' />
      </div>
      <div className='form-field'>
        <label htmlFor='reg-password'>Contraseña</label>
        <input id='reg-password' type='password' placeholder='Mínimo 6 caracteres' value={form.password} onChange={set('password')} required autoComplete='new-password' />
      </div>
      <div className='form-field'>
        <label htmlFor='reg-password2'>Repite la contraseña</label>
        <input id='reg-password2' type='password' placeholder='········' value={form.password2} onChange={set('password2')} required autoComplete='new-password' />
      </div>
      {error && <p className='form-error'>{error}</p>}
      {success && <p className='form-success'>{success}</p>}
      <button type='submit' className='btn-primary' disabled={loading}>
        {loading ? 'Creando cuenta...' : 'Crear cuenta'}
      </button>
    </form>
  )
}
