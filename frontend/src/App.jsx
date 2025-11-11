import { Route, Routes } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Signup from './pages/Signup'
import DashboardPage from './pages/DashboardPage'
import LeadsPage from './pages/LeadsPage'
import DealsPage from './pages/DealsPage'
import ContactsPage from './pages/ContactsPage'
import ActivitiesPage from './pages/ActivitiesPage'
import UserManagementPage from './pages/UserManagementPage'
import TeamPerformancePage from './pages/TeamPerformancePage'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/leads" element={<LeadsPage />} />
        <Route path="/deals" element={<DealsPage />} />
        <Route path="/contacts" element={<ContactsPage />} />
        <Route path="/activities" element={<ActivitiesPage />} />
        <Route path="/users" element={<UserManagementPage />} />
        <Route path="/team-performance" element={<TeamPerformancePage />} />
      </Route>
    </Routes>
  )
}
