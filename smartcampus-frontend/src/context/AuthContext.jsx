import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('sc_token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        setUser({ id: payload.sub, email: payload.email, role: payload.role })
      } catch {
        logout()
      }
    }
    setLoading(false)
  }, [token])

  const login = (jwt) => {
    localStorage.setItem('sc_token', jwt)
    setToken(jwt)
    try {
      const payload = JSON.parse(atob(jwt.split('.')[1]))
      setUser({ id: payload.sub, email: payload.email, role: payload.role })
    } catch {
      logout()
    }
  }

  const logout = () => {
    localStorage.removeItem('sc_token')
    setToken(null)
    setUser(null)
  }

  const isAdmin = () => user?.role === 'ADMIN'
  const isManager = () => ['ADMIN', 'MANAGER'].includes(user?.role)
  const isTechnician = () => ['ADMIN', 'TECHNICIAN'].includes(user?.role)

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAdmin, isManager, isTechnician }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
