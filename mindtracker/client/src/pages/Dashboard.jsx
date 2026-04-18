import { useState, useEffect, useCallback, useRef } from 'react'

const TODAY = new Date().toISOString().split('T')[0]

const ICON_MAP = {
  moon: 'fa-moon',
  dumbbell: 'fa-dumbbell',
  book: 'fa-book',
  pencil: 'fa-pen',
  apple: 'fa-apple-whole'
}

function scoreClass (n) {
  if (n >= 7) return 'high'
  if (n >= 4) return 'mid'
  return 'low'
}

function formatDate (iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

export default function Dashboard ({ user, onLogout, onUserUpdate }) {
  const [view, setView] = useState('entrada')

  function navigate (v) { setView(v) }

  return (
    <div className='app-shell'>
      <AppHeader user={user} onLogout={onLogout} onNavigate={navigate} activeView={view} />

      <div className='view-container'>
        {view === 'entrada' && <EntradaView />}
        {view === 'registros' && <RegistrosView />}
        {view === 'perfil' && <PerfilView user={user} onUserUpdate={onUserUpdate} />}
      </div>

      <footer className='app-footer'>
        © {new Date().getFullYear()} MindTracker — Mathias Balay
      </footer>
    </div>
  )
}

function AppHeader ({ user, onLogout, onNavigate, activeView }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClick (e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function pick (v) {
    onNavigate(v)
    setOpen(false)
  }

  async function handleLogout () {
    await fetch('/auth/logout', { method: 'POST', credentials: 'include' })
    onLogout()
  }

  return (
    <header className='app-header'>
      <button className='app-header-logo btn-unstyled' onClick={() => pick('entrada')}>
        <i className='fa-solid fa-brain' />
        MindTracker
      </button>

      <div className='dropdown' ref={ref}>
        <button className='dropdown-trigger' onClick={() => setOpen(o => !o)}>
          <span className='dropdown-trigger-name'>{user?.name}</span>
          <i className={`fa-solid fa-chevron-down dropdown-chevron ${open ? 'open' : ''}`} />
        </button>

        {open && (
          <div className='dropdown-menu'>
            <button
              className={`dropdown-item ${activeView === 'registros' ? 'active' : ''}`}
              onClick={() => pick('registros')}
            >
              <i className='fa-solid fa-chart-line' />
              Registros
            </button>
            <button
              className={`dropdown-item ${activeView === 'perfil' ? 'active' : ''}`}
              onClick={() => pick('perfil')}
            >
              <i className='fa-solid fa-user' />
              Mi perfil
            </button>
            <div className='dropdown-divider' />
            <button className='dropdown-item danger' onClick={handleLogout}>
              <i className='fa-solid fa-arrow-right-from-bracket' />
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

function EntradaView () {
  const [date, setDate] = useState(TODAY)

  return (
    <div className='dashboard-body'>
      <div className='dashboard-left'>
        <MoodForm date={date} setDate={setDate} />
      </div>
      <div className='dashboard-right'>
        <HabitsPanel date={date} />
      </div>
    </div>
  )
}

function RegistrosView () {
  const [logs, setLogs] = useState([])
  const [habitLogsByDate, setHabitLogsByDate] = useState({})
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [moodRes, habitRes] = await Promise.all([
        fetch('/api/users/logs', { credentials: 'include' }),
        fetch('/api/habits/logs', { credentials: 'include' })
      ])
      if (moodRes.ok) {
        const data = await moodRes.json()
        setLogs(data.log ?? [])
      }
      if (habitRes.ok) {
        const habitLogs = await habitRes.json()
        const byDate = {}
        habitLogs.forEach(hl => {
          const d = new Date(hl.date).toISOString().split('T')[0]
          if (!byDate[d]) byDate[d] = []
          byDate[d].push(hl)
        })
        setHabitLogsByDate(byDate)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleDelete (id) {
    const res = await fetch(`/api/users/moods/${id}`, { method: 'DELETE', credentials: 'include' })
    if (res.ok) setLogs(prev => prev.filter(l => l.id !== id))
  }

  return (
    <div className='view-full'>
      <div className='view-header'>
        <h2 className='view-title'>Registros</h2>
        {!loading && logs.length > 0 && (
          <span className='panel-count'>{logs.length} {logs.length === 1 ? 'entrada' : 'entradas'}</span>
        )}
      </div>

      {loading
        ? <p className='logs-empty'>Cargando...</p>
        : logs.length === 0
          ? <p className='logs-empty'>No hay registros todavía. ¡Empieza añadiendo tu primer día!</p>
          : (
            <div className='panel'>
              <ul className='logs-list'>
                {logs.map(log => (
                  <li key={log.id} className='log-item'>
                    <div className={`log-score ${scoreClass(log.mood)}`}>{log.mood}</div>
                    <div className='log-content'>
                      <p className='log-date'>{formatDate(log.date)}</p>
                      <p className='log-notes'>{log.notes}</p>
                      {habitLogsByDate[log.date]?.length > 0 && (
                        <div className='log-habits'>
                          {habitLogsByDate[log.date].map(hl => (
                            <span key={hl.id} className='log-habit-tag'>
                              <i className={`fa-solid ${ICON_MAP[hl.habitIcon] ?? 'fa-circle'}`} />
                              {hl.habitName}: {hl.optionLabel}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className='log-actions'>
                      <button className='btn-delete' title='Eliminar' onClick={() => handleDelete(log.id)}>
                        <i className='fa-solid fa-trash-can' />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            )}
    </div>
  )
}

function PerfilView ({ user, onUserUpdate }) {
  return (
    <div className='view-centered'>
      <div className='view-header'>
        <h2 className='view-title'>Mi perfil</h2>
      </div>
      <div className='perfil-grid'>
        <ProfileForm user={user} onUserUpdate={onUserUpdate} />
        <PasswordForm />
      </div>
    </div>
  )
}

function ProfileForm ({ user, onUserUpdate }) {
  const [form, setForm] = useState({ name: '', lastName: '', telephone: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetch('/api/users/profile', { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setForm({ name: data.name, lastName: data.lastName, telephone: data.telephone ?? '' })
        setLoading(false)
      })
  }, [])

  function set (field) {
    return e => setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSubmit (e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!form.name || !form.lastName) { setError('Nombre y apellidos son requeridos.'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
        credentials: 'include'
      })
      const data = await res.json()
      if (res.ok) {
        setSuccess('Perfil actualizado.')
        onUserUpdate({ ...user, name: data.name })
        setTimeout(() => setSuccess(''), 2500)
      } else {
        setError(data.error || 'Error al guardar.')
      }
    } catch {
      setError('No se pudo conectar con el servidor.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className='panel'><p className='logs-empty'>Cargando...</p></div>

  return (
    <div className='panel'>
      <div className='panel-header'>
        <span className='panel-title'>Datos personales</span>
      </div>
      <div className='panel-body'>
        <form onSubmit={handleSubmit} noValidate>
          <div className='form-field'>
            <label htmlFor='p-name'>Nombre</label>
            <input id='p-name' type='text' value={form.name} onChange={set('name')} />
          </div>
          <div className='form-field'>
            <label htmlFor='p-lastname'>Apellidos</label>
            <input id='p-lastname' type='text' value={form.lastName} onChange={set('lastName')} />
          </div>
          <div className='form-field'>
            <label htmlFor='p-tel'>Teléfono</label>
            <input id='p-tel' type='tel' value={form.telephone} onChange={set('telephone')} />
          </div>
          {error && <p className='form-error'>{error}</p>}
          {success && <p className='form-success'>{success}</p>}
          <button type='submit' className='btn-primary' disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>
    </div>
  )
}

function PasswordForm () {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function set (field) {
    return e => setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSubmit (e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (form.newPassword !== form.confirm) { setError('Las contraseñas no coinciden.'); return }
    if (form.newPassword.length < 6) { setError('Mínimo 6 caracteres.'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/users/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword }),
        credentials: 'include'
      })
      const data = await res.json()
      if (res.ok) {
        setSuccess('Contraseña actualizada.')
        setForm({ currentPassword: '', newPassword: '', confirm: '' })
        setTimeout(() => setSuccess(''), 2500)
      } else {
        setError(data.error || 'Error al cambiar la contraseña.')
      }
    } catch {
      setError('No se pudo conectar con el servidor.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className='panel'>
      <div className='panel-header'>
        <span className='panel-title'>Cambiar contraseña</span>
      </div>
      <div className='panel-body'>
        <form onSubmit={handleSubmit} noValidate>
          <div className='form-field'>
            <label htmlFor='pw-current'>Contraseña actual</label>
            <input id='pw-current' type='password' value={form.currentPassword} onChange={set('currentPassword')} placeholder='········' />
          </div>
          <div className='form-field'>
            <label htmlFor='pw-new'>Nueva contraseña</label>
            <input id='pw-new' type='password' value={form.newPassword} onChange={set('newPassword')} placeholder='Mínimo 6 caracteres' />
          </div>
          <div className='form-field'>
            <label htmlFor='pw-confirm'>Confirmar nueva contraseña</label>
            <input id='pw-confirm' type='password' value={form.confirm} onChange={set('confirm')} placeholder='········' />
          </div>
          {error && <p className='form-error'>{error}</p>}
          {success && <p className='form-success'>{success}</p>}
          <button type='submit' className='btn-primary' disabled={saving}>
            {saving ? 'Guardando...' : 'Cambiar contraseña'}
          </button>
        </form>
      </div>
    </div>
  )
}

function HabitsPanel ({ date }) {
  const [habits, setHabits] = useState([])
  const [selected, setSelected] = useState({})
  const [saving, setSaving] = useState(null)

  useEffect(() => {
    fetch('/api/habits', { credentials: 'include' })
      .then(res => res.ok ? res.json() : [])
      .then(setHabits)
  }, [])

  useEffect(() => {
    fetch(`/api/habits/logs/date/${date}`, { credentials: 'include' })
      .then(res => res.ok ? res.json() : [])
      .then(logs => {
        const map = {}
        logs.forEach(l => { map[l.habitId] = l.habitOptionId })
        setSelected(map)
      })
  }, [date])

  async function handleSelect (habitId, habitOptionId) {
    setSaving(habitId)
    try {
      const res = await fetch('/api/habits/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habitId, habitOptionId, date }),
        credentials: 'include'
      })
      if (res.ok) setSelected(prev => ({ ...prev, [habitId]: habitOptionId }))
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className='panel'>
      <div className='panel-header'>
        <span className='panel-title'>Hábitos</span>
      </div>
      <div className='habits-body'>
        {habits.length === 0
          ? <p className='logs-empty'>Cargando hábitos...</p>
          : habits.map(habit => (
            <div key={habit.id} className='habit-row'>
              <div className='habit-label'>
                <i className={`fa-solid ${ICON_MAP[habit.icon] ?? 'fa-circle'}`} />
                <span>{habit.name}</span>
              </div>
              <div className='habit-options'>
                {habit.options.map(opt => (
                  <button
                    key={opt.id}
                    type='button'
                    className={`habit-opt-btn ${Number(selected[habit.id]) === Number(opt.id) ? 'selected' : ''}`}
                    onClick={() => handleSelect(habit.id, opt.id)}
                    disabled={saving === habit.id}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}

function MoodForm ({ date, setDate }) {
  const [mood, setMood] = useState(null)
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit (e) {
    e.preventDefault()
    setError('')
    setSuccess(false)
    if (!mood) { setError('Selecciona un estado de ánimo.'); return }
    if (!notes.trim()) { setError('Escribe una nota.'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/users/moods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood, notes, date }),
        credentials: 'include'
      })
      const data = await res.json()
      if (res.ok) {
        setMood(null)
        setNotes('')
        setSuccess(true)
        setTimeout(() => setSuccess(false), 2500)
      } else {
        setError(data.error || 'Error al guardar.')
      }
    } catch {
      setError('No se pudo conectar con el servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='panel'>
      <div className='panel-header'>
        <span className='panel-title'>Estado de ánimo</span>
      </div>
      <div className='panel-body'>
        <form onSubmit={handleSubmit} noValidate>
          <div className='form-field'>
            <label>Puntuación</label>
            <div className='mood-grid'>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                <button
                  key={n}
                  type='button'
                  className={`mood-btn ${mood === n ? 'selected' : ''}`}
                  onClick={() => setMood(n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <div className='form-field'>
            <label htmlFor='notes'>Notas</label>
            <input
              id='notes'
              type='text'
              placeholder='¿Cómo ha ido el día?'
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>
          <div className='form-field'>
            <label htmlFor='entry-date'>Fecha</label>
            <input
              id='entry-date'
              type='date'
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>
          {error && <p className='form-error'>{error}</p>}
          {success && <p className='form-success'>Registro guardado.</p>}
          <button type='submit' className='btn-primary' disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </form>
      </div>
    </div>
  )
}
