import axios from 'axios'

// Backend base URL: prefer envs, fallback to detected Spring Boot port 8080
const BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  'http://localhost:8080'

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Attach Authorization header if JWT exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Convenience helpers for known auth endpoints
export const AuthAPI = {
  login: (email, password) => api.post('/api/auth/login', { email, password }),
  register: ({ firstName, lastName, email, password, role }) =>
    api.post('/api/auth/register', { firstName, lastName, email, password, role }),
  me: () => api.get('/api/auth/me')
}

export default api


