import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute() {
  const { token, loading } = useAuth()
  
  console.log('ProtectedRoute - token:', token, 'loading:', loading)
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }
  
  if (!token) {
    console.log('No token found, redirecting to login')
    return <Navigate to="/login" replace />
  }
  
  console.log('Token found, rendering protected content')
  return <Outlet />
}


