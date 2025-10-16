import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import { UserIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (password !== confirmPassword) {
        setLoading(false)
        setError('Passwords do not match')
        toast.error('Passwords do not match')
        return
      }
      await signup({ firstName, lastName, email, password })
      toast.success('Account created. You are now logged in.')
      navigate('/dashboard')
    } catch (err) {
      setError(err?.response?.data || 'Signup failed')
      toast.error(String(err?.response?.data || 'Signup failed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)', color: 'var(--brand)' }}>
      <Header />
      <div className="px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-md pt-10">
          <h2 className="text-3xl font-semibold mb-6">Create your ClientSphere account</h2>
          <div className="card p-6">
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1">First name</label>
                  <div className="relative">
                    <UserIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#94a3b8]" />
                    <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="input pl-10" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-1">Last name</label>
                  <div className="relative">
                    <UserIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#94a3b8]" />
                    <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="input pl-10" />
                  </div>
                </div>
              </div>
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
              <div>
                <label className="block text-sm mb-1">Confirm Password</label>
                <div className="relative">
                  <LockClosedIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#94a3b8]" />
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="input pl-10" />
                </div>
              </div>
              {error && <p className="text-red-500 text-sm">{String(error)}</p>}
              <button type="submit" disabled={loading} className="btn-brand w-full">{loading ? 'Creating…' : 'Create account'}</button>
            </form>
            <p className="mt-4 text-sm">Already have an account? <Link to="/login" className="underline">Log in</Link></p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}


