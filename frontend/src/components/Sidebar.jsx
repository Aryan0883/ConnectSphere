import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { 
  Bars3Icon, 
  XMarkIcon,
  HomeIcon,
  UsersIcon,
  CurrencyDollarIcon,
  PhoneIcon,
  CalendarIcon,
  UserGroupIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'

export default function Sidebar({ children }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  // Normalize role
  const normalizeRole = (role) => {
    if (!role) return 'USER'
    return role.replace(/^ROLE_/, '').toUpperCase()
  }

  const userRole = normalizeRole(user?.role || 'USER')
  const isAdmin = userRole === 'ADMIN'
  const isManager = userRole === 'MANAGER'
  const isUser = userRole === 'USER'

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: HomeIcon,
      roles: ['USER', 'MANAGER', 'ADMIN']
    },
    {
      name: 'Leads',
      path: '/leads',
      icon: UsersIcon,
      roles: ['USER', 'MANAGER', 'ADMIN']
    },
    {
      name: 'Deals',
      path: '/deals',
      icon: CurrencyDollarIcon,
      roles: ['USER', 'MANAGER', 'ADMIN']
    },
    {
      name: 'Contacts',
      path: '/contacts',
      icon: PhoneIcon,
      roles: ['USER', 'ADMIN']
    },
    {
      name: 'Activities',
      path: '/activities',
      icon: CalendarIcon,
      roles: ['USER', 'MANAGER', 'ADMIN']
    },
    {
      name: 'Team Performance',
      path: '/team-performance',
      icon: ChartBarIcon,
      roles: ['MANAGER', 'ADMIN']
    },
    {
      name: 'User Management',
      path: '/users',
      icon: UserGroupIcon,
      roles: ['ADMIN']
    }
  ]

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(userRole)
  )

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#fdfcfb] via-[#f7f5ec] to-[#faf6e9]">
      {/* Mobile menu overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden cursor-pointer"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-white shadow-lg
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">ClientSphere</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
          >
            <XMarkIcon className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {/* User info */}
        <div className="p-4 border-b bg-gray-50">
          <p className="text-sm font-medium text-gray-900">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-xs text-gray-500">{user?.email}</p>
          <span className="inline-block mt-2 px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
            {userRole}
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.path)
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg
                      transition-colors duration-200 cursor-pointer
                      ${active 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200 cursor-pointer"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar with hamburger */}
        <div className="bg-white border-b px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => setIsOpen(true)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
          >
            <Bars3Icon className="h-6 w-6 text-gray-600" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">
            {filteredMenuItems.find(item => isActive(item.path))?.name || 'Dashboard'}
          </h1>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

