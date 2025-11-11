import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { UserAPI } from '../api/api'
import { api } from '../api/api'
import toast from 'react-hot-toast'
import { ChartBarIcon } from '@heroicons/react/24/outline'

export default function TeamPerformancePage() {
  const { user, loading: authLoading } = useAuth()
  const [teamMembers, setTeamMembers] = useState([])
  const [deals, setDeals] = useState([])
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  const normalizeRole = (role) => {
    if (!role) return 'USER'
    return role.replace(/^ROLE_/, '').toUpperCase()
  }

  const userRole = normalizeRole(user?.role || 'USER')
  const isAdmin = userRole === 'ADMIN'
  const isManager = userRole === 'MANAGER'

  useEffect(() => {
    console.log('TeamPerformancePage useEffect - user:', user, 'isAdmin:', isAdmin, 'isManager:', isManager, 'userRole:', userRole)
    if ((isAdmin || isManager) && user?.id) {
      console.log('Fetching team data for user:', user)
      fetchTeamData()
    } else {
      console.log('Not fetching team data - isAdmin:', isAdmin, 'isManager:', isManager, 'user?.id:', user?.id)
    }
  }, [user, isAdmin, isManager, userRole])

  const fetchTeamData = async () => {
    try {
      setLoading(true)
      console.log('TeamPerformancePage: Starting to fetch team data...')
      console.log('Token in localStorage:', localStorage.getItem('token') ? 'Present' : 'Missing')
      
      // Fetch all users - ADMIN and MANAGER can see all employees
      console.log('TeamPerformancePage: Fetching users...')
      const usersResponse = await UserAPI.getAllUsers()
      console.log('TeamPerformancePage: Users response:', usersResponse)
      console.log('TeamPerformancePage: Users data:', usersResponse?.data)
      const allUsers = Array.isArray(usersResponse.data) ? usersResponse.data : []
      console.log('TeamPerformancePage: Parsed users:', allUsers.length)
      setTeamMembers(allUsers)

      // Fetch deals for performance metrics
      try {
        console.log('TeamPerformancePage: Fetching deals...')
        const dealsResponse = await api.get('/api/deals')
        console.log('TeamPerformancePage: Deals response:', dealsResponse)
        if (dealsResponse.data === 'no data' || !dealsResponse.data) {
          setDeals([])
        } else {
          const dealsData = Array.isArray(dealsResponse.data) ? dealsResponse.data : []
          console.log('TeamPerformancePage: Parsed deals:', dealsData.length)
          setDeals(dealsData)
        }
      } catch (dealsError) {
        console.error('TeamPerformancePage: Error fetching deals:', dealsError)
        setDeals([])
      }

      // Fetch activities for performance metrics
      try {
        console.log('TeamPerformancePage: Fetching activities...')
        const activitiesResponse = await api.get('/api/activities')
        console.log('TeamPerformancePage: Activities response:', activitiesResponse)
        if (activitiesResponse.data === 'no data' || !activitiesResponse.data) {
          setActivities([])
        } else {
          const activitiesData = Array.isArray(activitiesResponse.data) ? activitiesResponse.data : []
          console.log('TeamPerformancePage: Parsed activities:', activitiesData.length)
          setActivities(activitiesData)
        }
      } catch (activitiesError) {
        console.error('TeamPerformancePage: Error fetching activities:', activitiesError)
        setActivities([])
      }
      
      console.log('TeamPerformancePage: Successfully loaded all data')
    } catch (error) {
      console.error('TeamPerformancePage: Error fetching team data:', error)
      console.error('TeamPerformancePage: Error response:', error.response)
      console.error('TeamPerformancePage: Error status:', error.response?.status)
      console.error('TeamPerformancePage: Error data:', error.response?.data)
      
      if (error.response?.status === 403) {
        toast.error('You do not have permission to access this page. Please ensure you are logged in as ADMIN or MANAGER.')
      } else if (error.response?.status === 401) {
        toast.error('Session expired. Please login again')
      } else if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        toast.error('Cannot connect to server. Please ensure the backend is running.')
      } else {
        const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to load team performance data'
        toast.error(`Error: ${errorMsg}`)
      }
      setTeamMembers([])
      setDeals([])
      setActivities([])
    } finally {
      setLoading(false)
      console.log('TeamPerformancePage: Finished fetching team data')
    }
  }

  const formatCurrency = (value) => {
    if (!value) return '$0'
    return `$${Number(value).toLocaleString()}`
  }

  // Wait for auth to finish loading and user to load before checking permissions
  if (authLoading || !user) {
    return (
      <Sidebar>
        <div className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="ml-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </Sidebar>
    )
  }

  if (!isAdmin && !isManager) {
    return (
      <Sidebar>
        <div className="p-6">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500 text-lg">
                You do not have permission to access this page.
              </p>
            </CardContent>
          </Card>
        </div>
      </Sidebar>
    )
  }

  return (
    <Sidebar>
      <div className="p-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Team Performance</h1>
            <p className="text-gray-600 mt-1">Monitor your team's performance and metrics</p>
          </div>
          <Button 
            onClick={fetchTeamData} 
            variant="outline"
            className="mt-4"
          >
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{teamMembers.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">All company employees</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Total Deals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{deals.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">All team deals</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activities.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">Team activities</p>
                </CardContent>
              </Card>
            </div>

            {/* Team Members Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Employees</CardTitle>
                <CardDescription>List of all company employees</CardDescription>
              </CardHeader>
              <CardContent>
                {teamMembers.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No employees found</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teamMembers.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell className="font-medium">
                            {member.firstName} {member.lastName}
                          </TableCell>
                          <TableCell>{member.email}</TableCell>
                          <TableCell>
                            <Badge variant={
                              normalizeRole(member.role) === 'ADMIN' ? 'default' :
                              normalizeRole(member.role) === 'MANAGER' ? 'secondary' : 'outline'
                            }>
                              {member.role || 'USER'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={member.enabled !== false ? 'default' : 'destructive'}>
                              {member.enabled !== false ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Deals Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Deals Overview</CardTitle>
                <CardDescription>Summary of all team deals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Pipeline Value:</span>
                    <span className="font-bold text-lg">{formatCurrency(
                      deals.reduce((sum, deal) => sum + (parseFloat(deal.value) || 0), 0)
                    )}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Won Deals:</span>
                    <Badge variant="default">
                      {deals.filter(d => d.stage === 'CLOSED_WON').length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>In Progress:</span>
                    <Badge variant="secondary">
                      {deals.filter(d => 
                        d.stage !== 'CLOSED_WON' && d.stage !== 'CLOSED_LOST'
                      ).length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Lost Deals:</span>
                    <Badge variant="destructive">
                      {deals.filter(d => d.stage === 'CLOSED_LOST').length}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Sidebar>
  )
}

