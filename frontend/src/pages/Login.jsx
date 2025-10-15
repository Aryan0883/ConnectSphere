import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import { EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
      toast.success('Logged in')
    } catch (err) {
      setError(err?.response?.data || 'Login failed')
      toast.error(String(err?.response?.data || 'Login failed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)', color: 'var(--brand)' }}>
      <Header />
      <div className="px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-md pt-10">
          <h2 className="text-3xl font-semibold mb-6">Log in to ClientSphere</h2>
          <div className="card p-6">
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Email</label>
                <div className="relative">
                  <EnvelopeIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#94a3b8]" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input pl-10" />
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1">Password</label>
                <div className="relative">
                  <LockClosedIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#94a3b8]" />
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="input pl-10" />
                </div>
              </div>
              {error && <p className="text-red-500 text-sm">{String(error)}</p>}
              <button type="submit" disabled={loading} className="btn-brand w-full">{loading ? 'Logging in…' : 'Login'}</button>
            </form>
            <p className="mt-4 text-sm">Don't have an account? <Link to="/signup" className="underline">Sign up</Link></p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}


