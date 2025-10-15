import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { AuthAPI } from '../api/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function bootstrap() {
      try {
        setLoading(true)
        if (token) {
          const { data } = await AuthAPI.me()
          setUser(data)
        } else {
          setUser(null)
        }
      } catch (e) {
        setUser(null)
        localStorage.removeItem('token')
        setToken(null)
      } finally {
        setLoading(false)
      }
    }
    bootstrap()
  }, [token])

  const login = async (email, password) => {
    setError(null)
    const { data } = await AuthAPI.login(email, password)
    const jwt = data?.token
    if (jwt) {
      localStorage.setItem('token', jwt)
      setToken(jwt)
      const me = await AuthAPI.me()
      setUser(me.data)
    }
    return data
  }

  const signup = async ({ firstName, lastName, email, password }) => {
    setError(null)
    await AuthAPI.register({ firstName, lastName, email, password })
    return login(email, password)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  const value = useMemo(() => ({ token, user, loading, error, login, signup, logout }), [token, user, loading, error])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}


