import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { UserIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

// Utility function to extract error message
const getErrorMessage = (error) => {
  if (typeof error === 'string') return error
  if (error?.response?.data?.message) return error.response.data.message
  if (error?.response?.data) return error.response.data
  if (error?.message) return error.message
  return 'An error occurred'
}

export default function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
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
      console.log('Signup form submitted')
      const result = await signup({ firstName, lastName, email, password })
      console.log('Signup successful, result:', result)
      toast.success('Account created successfully!')
      console.log('Navigating to dashboard...')
      navigate('/dashboard')
    } catch (err) {
      console.error('Signup failed:', err)
      const errorMessage = getErrorMessage(err)
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg)', color: 'var(--brand)' }}>
      <Header />

      <div className="flex-grow px-4 py-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-md pt-10"
        >
          <h2 className="text-3xl font-semibold mb-6">Create your ClientSphere account</h2>

          <div className="card p-6">
            <form onSubmit={onSubmit} className="space-y-4">
              {/* First & Last Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1">First name</label>
                  <div className="flex items-center border border-gray-300 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                    <div className="p-4 bg-gray-100">
                      <UserIcon className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      placeholder="First name"
                      className="flex-1 p-3 outline-none bg-transparent text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-1">Last name</label>
                  <div className="flex items-center border border-gray-300 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                    <div className="p-4 bg-gray-100">
                      <UserIcon className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      placeholder="Last name"
                      className="flex-1 p-3 outline-none bg-transparent text-gray-900"
                    />
                  </div>
                </div>
              </div>

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
                    placeholder="Enter password"
                    className="flex-1 p-3 outline-none bg-transparent text-gray-900"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm mb-1">Confirm Password</label>
                <div className="flex items-center border border-gray-300 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                  <div className="p-4 bg-gray-100">
                    <LockClosedIcon className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Confirm password"
                    className="flex-1 p-3 outline-none bg-transparent text-gray-900"
                  />
                </div>
              </div>

              {error && <p className="text-red-500 text-sm">{String(error)}</p>}

              <button type="submit" disabled={loading} className="btn-brand w-full">
                {loading ? 'Creating account…' : 'Create account'}
              </button>
            </form>

            <p className="mt-4 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="underline">
                Log in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Fixed footer same as Login */}
      <div className="fixed bottom-0 left-0 right-0">
        <Footer />
      </div>
    </div>
  )
}
