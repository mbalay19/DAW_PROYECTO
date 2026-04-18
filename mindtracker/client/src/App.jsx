import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

function ProtectedRoute ({ children, user }) {
  if (user === undefined) return <div className="loading-screen">Cargando...</div>
  if (user === null) return <Navigate to="/login" replace />
  return children
}

function PublicRoute ({ children, user }) {
  if (user === undefined) return <div className="loading-screen">Cargando...</div>
  if (user !== null) return <Navigate to="/" replace />
  return children
}

export default function App () {
  const [user, setUser] = useState(undefined)

  useEffect(() => {
    fetch('/api/me', { credentials: 'include' })
      .then(res => (res.ok ? res.json() : null))
      .then(data => setUser(data))
      .catch(() => setUser(null))
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path='/login'
          element={
            <PublicRoute user={user}>
              <Login onLogin={setUser} />
            </PublicRoute>
          }
        />
        <Route
          path='/'
          element={
            <ProtectedRoute user={user}>
              <Dashboard user={user} onLogout={() => setUser(null)} onUserUpdate={setUser} />
            </ProtectedRoute>
          }
        />
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </BrowserRouter>
  )
}
