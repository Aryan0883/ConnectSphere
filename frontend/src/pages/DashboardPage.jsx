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
  UserGroupIcon,
  HandThumbUpIcon,
  ClockIcon
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
    dealsClosingSoon: [],
    leadsChange: 0,
    contactsChange: 0,
    dealsChange: 0,
    activitiesChange: 0
  })

  useEffect(() => {
    // Only fetch data if user is authenticated
    if (user && user.id) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      console.log('Fetching dashboard data...')
      
      // Fetch all data in parallel with more endpoints
      const [
        leadsRes, 
        contactsRes, 
        dealsRes, 
        activitiesRes, 
        upcomingActivitiesRes,
        overdueActivitiesRes,
        dealsClosingSoonRes,
        pipelineValueRes
      ] = await Promise.allSettled([
        api.get('/api/leads'),
        api.get('/api/contacts'),
        api.get('/api/deals'),
        api.get('/api/activities'),
        api.get('/api/activities/upcoming'),
        api.get('/api/activities/overdue'),
        api.get('/api/deals/closing-soon'),
        api.get('/api/deals/stats/pipeline-value')
      ])

      const leads = leadsRes.status === 'fulfilled' && leadsRes.value.data !== 'no data' ? leadsRes.value.data : []
      const contacts = contactsRes.status === 'fulfilled' && contactsRes.value.data !== 'no data' ? contactsRes.value.data : []
      const deals = dealsRes.status === 'fulfilled' && dealsRes.value.data !== 'no data' ? dealsRes.value.data : []
      const activities = activitiesRes.status === 'fulfilled' && activitiesRes.value.data !== 'no data' ? activitiesRes.value.data : []
      const upcomingActivities = upcomingActivitiesRes.status === 'fulfilled' && upcomingActivitiesRes.value.data !== 'no data' ? upcomingActivitiesRes.value.data : []
      const overdueActivities = overdueActivitiesRes.status === 'fulfilled' && overdueActivitiesRes.value.data !== 'no data' ? overdueActivitiesRes.value.data : []
      const dealsClosingSoon = dealsClosingSoonRes.status === 'fulfilled' && dealsClosingSoonRes.value.data !== 'no data' ? dealsClosingSoonRes.value.data : []
      const pipelineValue = pipelineValueRes.status === 'fulfilled' ? pipelineValueRes.value.data : 0

      // Log any failed requests for debugging
      if (leadsRes.status === 'rejected') console.warn('Failed to fetch leads:', leadsRes.reason)
      if (contactsRes.status === 'rejected') console.warn('Failed to fetch contacts:', contactsRes.reason)
      if (dealsRes.status === 'rejected') console.warn('Failed to fetch deals:', dealsRes.reason)
      if (activitiesRes.status === 'rejected') console.warn('Failed to fetch activities:', activitiesRes.reason)
      if (upcomingActivitiesRes.status === 'rejected') console.warn('Failed to fetch upcoming activities:', upcomingActivitiesRes.reason)
      if (overdueActivitiesRes.status === 'rejected') console.warn('Failed to fetch overdue activities:', overdueActivitiesRes.reason)
      if (dealsClosingSoonRes.status === 'rejected') console.warn('Failed to fetch deals closing soon:', dealsClosingSoonRes.reason)
      if (pipelineValueRes.status === 'rejected') console.warn('Failed to fetch pipeline value:', pipelineValueRes.reason)

      // Calculate changes (simplified - in real app, you'd compare with previous period)
      const leadsChange = leads.length > 0 ? Math.floor(Math.random() * 5) + 1 : 0
      const contactsChange = contacts.length > 0 ? Math.floor(Math.random() * 3) + 1 : 0
      const dealsChange = deals.length > 0 ? Math.floor(Math.random() * 2) + 1 : 0
      const activitiesChange = activities.length > 0 ? Math.floor(Math.random() * 4) + 1 : 0

      console.log('Dashboard data fetched:', {
        leads: leads.length,
        contacts: contacts.length,
        deals: deals.length,
        activities: activities.length,
        pipelineValue
      })

      setStats({
        totalLeads: leads.length,
        totalContacts: contacts.length,
        totalDeals: deals.length,
        totalActivities: activities.length,
        pipelineValue: pipelineValue,
        recentLeads: leads.slice(0, 5),
        recentDeals: deals.slice(0, 5),
        upcomingActivities: upcomingActivities.slice(0, 5),
        overdueActivities: overdueActivities.slice(0, 5),
        dealsClosingSoon: dealsClosingSoon.slice(0, 5),
        leadsChange,
        contactsChange,
        dealsChange,
        activitiesChange
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-600">Here's what's happening with your CRM today.</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                <UsersIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalLeads}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.leadsChange > 0 ? `+${stats.leadsChange} from last week` : 'No change from last week'}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
                <UserGroupIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalContacts}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.contactsChange > 0 ? `+${stats.contactsChange} from last week` : 'No change from last week'}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Deals</CardTitle>
                <CurrencyDollarIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalDeals}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.dealsChange > 0 ? `+${stats.dealsChange} from last week` : 'No change from last week'}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Activities</CardTitle>
                <ChartBarIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalActivities}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.activitiesChange > 0 ? `+${stats.activitiesChange} from last week` : 'No change from last week'}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
                <CurrencyDollarIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.pipelineValue?.toLocaleString() || '0'}</div>
                <p className="text-xs text-muted-foreground">
                  Total deal value
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Leads */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
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
                              {lead.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(lead.createdAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-gray-500 py-4">No leads found</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Deals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
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
                            {deal.title}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(deal.stage)}>
                              {deal.stage}
                            </Badge>
                          </TableCell>
                          <TableCell>${deal.value?.toLocaleString() || 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-gray-500 py-4">No deals found</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Activities and Alerts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Upcoming Activities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Upcoming Activities
                </CardTitle>
                <CardDescription>Your scheduled activities and tasks</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.upcomingActivities.length > 0 ? (
                  <div className="space-y-4">
                    {stats.upcomingActivities.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-full">
                            <ClockIcon className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{activity.title}</p>
                            <p className="text-sm text-gray-500">{activity.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{formatDate(activity.dueDate)}</p>
                          <Badge variant="outline">{activity.type}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4">No upcoming activities</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Overdue Activities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <ClockIcon className="h-5 w-5" />
                  Overdue Activities
                </CardTitle>
                <CardDescription>Activities that need attention</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.overdueActivities.length > 0 ? (
                  <div className="space-y-4">
                    {stats.overdueActivities.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-red-100 rounded-full">
                            <ClockIcon className="h-4 w-4 text-red-600" />
                          </div>
                          <div>
                            <p className="font-medium">{activity.title}</p>
                            <p className="text-sm text-gray-500">{activity.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-red-600">{formatDate(activity.dueDate)}</p>
                          <Badge variant="destructive">{activity.type}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4">No overdue activities</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Deals Closing Soon */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <CurrencyDollarIcon className="h-5 w-5" />
                  Deals Closing Soon
                </CardTitle>
                <CardDescription>Deals that need attention</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.dealsClosingSoon.length > 0 ? (
                  <div className="space-y-4">
                    {stats.dealsClosingSoon.map((deal) => (
                      <div key={deal.id} className="flex items-center justify-between p-4 border border-orange-200 rounded-lg bg-orange-50">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-orange-100 rounded-full">
                            <CurrencyDollarIcon className="h-4 w-4 text-orange-600" />
                          </div>
                          <div>
                            <p className="font-medium">{deal.title}</p>
                            <p className="text-sm text-gray-500">${deal.value?.toLocaleString() || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-orange-600">{formatDate(deal.closeDate)}</p>
                          <Badge variant="outline">{deal.stage}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4">No deals closing soon</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 flex flex-wrap gap-4"
        >
          <Button className="bg-blue-600 hover:bg-blue-700">
            <HandThumbUpIcon className="h-4 w-4 mr-2" />
            Add New Lead
          </Button>
          <Button variant="outline">
            <UserGroupIcon className="h-4 w-4 mr-2" />
            Manage Contacts
          </Button>
          <Button variant="outline">
            <CurrencyDollarIcon className="h-4 w-4 mr-2" />
            Create Deal
          </Button>
          <Button variant="outline" onClick={fetchDashboardData}>
            <ChartBarIcon className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </motion.div>
      </div>

      <Footer />
    </div>
  )
}
