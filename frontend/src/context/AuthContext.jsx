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
        console.log('AuthContext bootstrap - token:', token)
        setLoading(true)
        if (token) {
          console.log('Token exists, fetching user data...')
          const { data } = await AuthAPI.me()
          console.log('User data received:', data)
          setUser(data)
        } else {
          console.log('No token, setting user to null')
          setUser(null)
        }
      } catch (e) {
        console.error('Bootstrap error:', e)
        setUser(null)
        localStorage.removeItem('token')
        setToken(null)
      } finally {
        console.log('Bootstrap complete, setting loading to false')
        setLoading(false)
      }
    }
    bootstrap()
  }, [token])

  const login = async (email, password) => {
    setError(null)
    try {
      console.log('Attempting login with:', email)
      const { data } = await AuthAPI.login(email, password)
      console.log('Login response:', data)
      
      const jwt = data?.token
      if (jwt) {
        console.log('JWT received, storing token')
        localStorage.setItem('token', jwt)
        setToken(jwt)
        
        // Wait a bit for the token to be set, then fetch user data
        setTimeout(async () => {
          try {
            const me = await AuthAPI.me()
            console.log('User data fetched:', me.data)
            setUser(me.data)
          } catch (meError) {
            console.error('Error fetching user data:', meError)
            // Don't throw here, just log the error
          }
        }, 100)
      } else {
        throw new Error('No token received from login response')
      }
      return data
    } catch (error) {
      console.error('Login error:', error)
      setError(error)
      throw error
    }
  }

  const signup = async ({ firstName, lastName, email, password }) => {
    setError(null)
    try {
      await AuthAPI.register({ firstName, lastName, email, password })
      return login(email, password)
    } catch (error) {
      setError(error)
      throw error
    }
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


