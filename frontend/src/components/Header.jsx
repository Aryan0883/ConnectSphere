import { Link, NavLink } from 'react-router-dom'
import { useState } from 'react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../context/AuthContext'

export default function Header() {
  const { token, logout } = useAuth()
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-30 border-b bg-[var(--bg)]/80 backdrop-blur">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="font-semibold tracking-tight text-[var(--brand)]">ClientSphere</Link>
        <div className="hidden md:flex items-center gap-2 text-sm">
          <NavLink to="/" className={({ isActive }) => `px-3 py-2 rounded-lg ${isActive ? 'bg-white' : 'hover:bg-white'} text-[var(--brand)]`}>Home</NavLink>
          {token ? (
            <>
              <NavLink to="/dashboard" className={({ isActive }) => `px-3 py-2 rounded-lg ${isActive ? 'bg-white' : 'hover:bg-white'} text-[var(--brand)]`}>Dashboard</NavLink>
              <button onClick={logout} className="px-3 py-2 rounded-lg bg-white text-[var(--brand)]">Logout</button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={({ isActive }) => `px-3 py-2 rounded-lg ${isActive ? 'bg-white' : 'hover:bg-white'} text-[var(--brand)]`}>Login</NavLink>
              <NavLink to="/signup" className={({ isActive }) => `px-3 py-2 rounded-lg ${isActive ? 'bg-white' : 'hover:bg-white'} text-[var(--brand)]`}>Signup</NavLink>
            </>
          )}
        </div>
        <button className="md:hidden p-2 rounded hover:bg-white" onClick={() => setOpen((v) => !v)} aria-label="Toggle Menu">
          {open ? <XMarkIcon className="h-6 w-6 text-[var(--brand)]" /> : <Bars3Icon className="h-6 w-6 text-[var(--brand)]" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden px-6 pb-4 space-y-2 bg-[var(--bg)] border-b">
          <NavLink to="/" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-lg hover:bg-white text-[var(--brand)]">Home</NavLink>
          {token ? (
            <>
              <NavLink to="/dashboard" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-lg hover:bg-white text-[var(--brand)]">Dashboard</NavLink>
              <button onClick={() => { setOpen(false); logout(); }} className="block w-full text-left px-3 py-2 rounded-lg bg-white text-[var(--brand)]">Logout</button>
            </>
          ) : (
            <>
              <NavLink to="/login" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-lg hover:bg-white text-[var(--brand)]">Login</NavLink>
              <NavLink to="/signup" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-lg hover:bg-white text-[var(--brand)]">Signup</NavLink>
            </>
          )}
        </div>
      )}
    </header>
  )
}


