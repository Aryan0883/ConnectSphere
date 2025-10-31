import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  UsersIcon, 
  CurrencyDollarIcon, 
  ChartBarIcon, 
  CalendarIcon,
  ClockIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline'
import { api } from '../api/api'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalLeads: 0,
    totalContacts: 0,
    totalDeals: 0,
    totalActivities: 0,
    pipelineValue: 0,
    recentLeads: [],
    recentDeals: [],
    upcomingActivities: [],
    overdueActivities: [],
    dealsClosingSoon: []
  })

  // Normalize role (remove ROLE_ prefix if present)
  const normalizeRole = (role) => {
    if (!role) return 'USER'
    return role.replace(/^ROLE_/, '').toUpperCase()
  }

  const userRole = normalizeRole(user?.role || 'USER')
  const isAdmin = userRole === 'ADMIN'
  const isManager = userRole === 'MANAGER'
  const isUser = userRole === 'USER'

  useEffect(() => {
    if (user && user.id) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Build API calls based on role
      const promises = {}
      
      // Leads: Only ADMIN and MANAGER can access
      if (isAdmin || isManager) {
        promises.leads = api.get('/api/leads').then(res => res.data).catch(() => [])
      }
      
      // Contacts: Only ADMIN can access
      if (isAdmin) {
        promises.contacts = api.get('/api/contacts').then(res => res.data).catch(() => [])
      }
      
      // Deals and Activities: All authenticated users can access
      promises.deals = api.get('/api/deals').then(res => res.data).catch(() => [])
      promises.activities = api.get('/api/activities').then(res => res.data).catch(() => [])
      promises.upcomingActivities = api.get('/api/activities/upcoming').then(res => res.data).catch(() => [])
      promises.overdueActivities = api.get('/api/activities/overdue').then(res => res.data).catch(() => [])
      promises.dealsClosingSoon = api.get('/api/deals/closing-soon').then(res => res.data).catch(() => [])
      promises.pipelineValue = api.get('/api/deals/stats/pipeline-value').then(res => res.data).catch(() => 0)

      const results = await Promise.allSettled(Object.values(promises))
      
      // Map results back to keys
      const keys = Object.keys(promises)
      const data = {}
      keys.forEach((key, index) => {
        if (results[index]?.status === 'fulfilled') {
          const value = results[index].value
          // Handle "no data" responses
          if (value === 'no data' || value === null) {
            data[key] = key === 'pipelineValue' ? 0 : []
          } else {
            data[key] = value
          }
        } else {
          data[key] = key === 'pipelineValue' ? 0 : []
        }
      })
      
      const leads = Array.isArray(data.leads) ? data.leads : []
      const contacts = Array.isArray(data.contacts) ? data.contacts : []
      const deals = Array.isArray(data.deals) ? data.deals : []
      const activities = Array.isArray(data.activities) ? data.activities : []
      const upcomingActivities = Array.isArray(data.upcomingActivities) ? data.upcomingActivities : []
      const overdueActivities = Array.isArray(data.overdueActivities) ? data.overdueActivities : []
      const dealsClosingSoon = Array.isArray(data.dealsClosingSoon) ? data.dealsClosingSoon : []
      const pipelineValue = typeof data.pipelineValue === 'number' ? data.pipelineValue : 0

      setStats({
        totalLeads: leads.length,
        totalContacts: contacts.length,
        totalDeals: deals.length,
        totalActivities: activities.length,
        pipelineValue: typeof pipelineValue === 'number' ? pipelineValue : 0,
        recentLeads: leads.slice(0, 5),
        recentDeals: deals.slice(0, 5),
        upcomingActivities: upcomingActivities.slice(0, 5),
        overdueActivities: overdueActivities.slice(0, 5),
        dealsClosingSoon: dealsClosingSoon.slice(0, 5)
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadgeVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'new':
      case 'prospect':
        return 'default'
      case 'qualified':
      case 'in progress':
        return 'secondary'
      case 'closed':
      case 'won':
        return 'default'
      case 'lost':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (value) => {
    if (!value) return '$0'
    return `$${Number(value).toLocaleString()}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fdfcfb] via-[#f7f5ec] to-[#faf6e9]">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdfcfb] via-[#f7f5ec] to-[#faf6e9]">
      <Header />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.firstName}!
              </h1>
              <p className="text-gray-600">Here's your dashboard overview.</p>
            </div>
            <Badge variant="outline" className="flex items-center gap-2">
              <UserCircleIcon className="h-4 w-4" />
              {userRole}
            </Badge>
          </div>
        </motion.div>

        {/* Stats Grid - Role-based */}
        <div className={`grid grid-cols-1 md:grid-cols-2 ${isAdmin ? 'lg:grid-cols-5' : isManager ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-6 mb-8`}>
          {/* Leads - ADMIN and MANAGER only */}
          {(isAdmin || isManager) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Leads</CardTitle>
                  <UsersIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalLeads}</div>
                  <p className="text-xs text-muted-foreground mt-1">Total leads</p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Contacts - ADMIN only */}
          {isAdmin && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Contacts</CardTitle>
                  <UsersIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalContacts}</div>
                  <p className="text-xs text-muted-foreground mt-1">Total contacts</p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Deals - All users */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: isAdmin ? 0.2 : isManager ? 0.15 : 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Deals</CardTitle>
                <CurrencyDollarIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalDeals}</div>
                <p className="text-xs text-muted-foreground mt-1">Total deals</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Activities - All users */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: isAdmin ? 0.25 : isManager ? 0.2 : 0.15 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Activities</CardTitle>
                <ChartBarIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalActivities}</div>
                <p className="text-xs text-muted-foreground mt-1">Total activities</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Pipeline Value - All users */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: isAdmin ? 0.3 : isManager ? 0.25 : 0.2 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pipeline</CardTitle>
                <CurrencyDollarIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.pipelineValue)}</div>
                <p className="text-xs text-muted-foreground mt-1">Total value</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Leads - ADMIN and MANAGER only */}
          {(isAdmin || isManager) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Recent Leads</CardTitle>
                  <CardDescription>Latest leads in your pipeline</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats.recentLeads.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stats.recentLeads.map((lead) => (
                          <TableRow key={lead.id}>
                            <TableCell className="font-medium">
                              {lead.firstName} {lead.lastName}
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadgeVariant(lead.status)}>
                                {lead.status || 'New'}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDate(lead.createdAt)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-center text-gray-500 py-8">No leads found</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Recent Deals - All users */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: isAdmin || isManager ? 0.5 : 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Recent Deals</CardTitle>
                <CardDescription>Latest deals in your pipeline</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.recentDeals.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Deal</TableHead>
                        <TableHead>Stage</TableHead>
                        <TableHead>Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.recentDeals.map((deal) => (
                        <TableRow key={deal.id}>
                          <TableCell className="font-medium">
                            {deal.name || deal.title || 'Untitled Deal'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(deal.stage)}>
                              {deal.stage || 'New'}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatCurrency(deal.value)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-gray-500 py-8">No deals found</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Activities and Alerts - Simplified */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Upcoming Activities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <CalendarIcon className="h-4 w-4" />
                  Upcoming
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.upcomingActivities.length > 0 ? (
                  <div className="space-y-3">
                    {stats.upcomingActivities.map((activity) => (
                      <div key={activity.id} className="p-3 border rounded-lg bg-white">
                        <p className="font-medium text-sm">{activity.subject || activity.title || 'Activity'}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatDate(activity.dueDate)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4 text-sm">No upcoming activities</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Overdue Activities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm text-red-600">
                  <ClockIcon className="h-4 w-4" />
                  Overdue
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.overdueActivities.length > 0 ? (
                  <div className="space-y-3">
                    {stats.overdueActivities.map((activity) => (
                      <div key={activity.id} className="p-3 border border-red-200 rounded-lg bg-red-50">
                        <p className="font-medium text-sm">{activity.subject || activity.title || 'Activity'}</p>
                        <p className="text-xs text-red-600 mt-1">{formatDate(activity.dueDate)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4 text-sm">No overdue activities</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Deals Closing Soon */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm text-orange-600">
                  <CurrencyDollarIcon className="h-4 w-4" />
                  Closing Soon
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.dealsClosingSoon.length > 0 ? (
                  <div className="space-y-3">
                    {stats.dealsClosingSoon.map((deal) => (
                      <div key={deal.id} className="p-3 border border-orange-200 rounded-lg bg-orange-50">
                        <p className="font-medium text-sm">{deal.name || deal.title || 'Deal'}</p>
                        <p className="text-xs text-orange-600 mt-1">{formatCurrency(deal.value)} • {formatDate(deal.closeDate)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4 text-sm">No deals closing soon</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Action Buttons - Role-based */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="flex flex-wrap gap-3"
        >
          {(isAdmin || isManager) && (
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => window.location.href = '/leads'}>
              <UsersIcon className="h-4 w-4 mr-2" />
              Manage Leads
            </Button>
          )}
          <Button variant="outline" onClick={() => window.location.href = '/deals'}>
            <CurrencyDollarIcon className="h-4 w-4 mr-2" />
            View Deals
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/activities'}>
            <ChartBarIcon className="h-4 w-4 mr-2" />
            Activities
          </Button>
          <Button variant="outline" onClick={fetchDashboardData}>
            Refresh
          </Button>
        </motion.div>
      </div>

      <Footer />
    </div>
  )
}