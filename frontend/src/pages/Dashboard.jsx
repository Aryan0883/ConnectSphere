import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const fullName = user ? `${user.firstName} ${user.lastName}` : ''

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)', color: 'var(--brand)' }}>
      <Header />
      <div className="max-w-5xl mx-auto px-6 py-12">
        <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-semibold">
          {user ? `Welcome, ${fullName}` : 'Welcome'}
        </motion.h2>
        <p className="mt-2 muted">You're authenticated with JWT.</p>
        <div className="mt-6 card p-6">
          <p className="text-black/80">Email: {user?.email}</p>
          <p className="text-black/80">Role: {user?.role}</p>
        </div>
        <button onClick={logout} className="mt-6 px-4 py-2 rounded-lg bg-white text-[var(--brand)]">Logout</button>
      </div>
    </div>
  )
}


