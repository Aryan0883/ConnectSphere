import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import { EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import Footer from '../components/Footer'

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
      <div className="px-4 py-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-md pt-10">
          <h2 className="text-3xl font-semibold mb-6">Log in to ClientSphere</h2>
          <div className="card p-6">
           <form onSubmit={onSubmit} className="space-y-4">
             {/* Email */}
             <div>
               <label className="block text-sm mb-1">Email</label>
               <div className="flex items-center border border-gray-300 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                 <div className="p-4 bg-gray-100">
                   <EnvelopeIcon className="h-5 w-5 text-gray-500" />
                 </div>
                 <input
                   type="email"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   required
                   placeholder="Enter your email"
                   className="flex-1 p-3 outline-none bg-transparent text-gray-900"
                 />
               </div>
             </div>

             {/* Password */}
             <div>
               <label className="block text-sm mb-1">Password</label>
               <div className="flex items-center border border-gray-300 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                 <div className="p-4 bg-gray-100">
                   <LockClosedIcon className="h-5 w-5 text-gray-500" />
                 </div>
                 <input
                   type="password"
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   required
                   placeholder="Enter your password"
                   className="flex-1 p-3 outline-none bg-transparent text-gray-900"
                 />
               </div>
             </div>

             {error && <p className="text-red-500 text-sm">{String(error)}</p>}

             <button type="submit" disabled={loading} className="btn-brand w-full">
               {loading ? 'Logging in…' : 'Login'}
             </button>
           </form>

            <p className="mt-4 text-sm">Don't have an account? <Link to="/signup" className="underline">Sign up</Link></p>
          </div>
        </motion.div>
      </div>
      <div className="fixed bottom-0 left-0 right-0">
        <Footer />

          </div>
    </div>
  )
}


