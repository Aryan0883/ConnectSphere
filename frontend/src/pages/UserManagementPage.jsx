import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { UserAPI } from '../api/api'
import toast from 'react-hot-toast'
import { TrashIcon } from '@heroicons/react/24/outline'

export default function UserManagementPage() {
  const { user, loading: authLoading } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingUser, setEditingUser] = useState(null)
  const [selectedRole, setSelectedRole] = useState('')

  const normalizeRole = (role) => {
    if (!role) return 'USER'
    return role.replace(/^ROLE_/, '').toUpperCase()
  }

  const userRole = normalizeRole(user?.role || 'USER')
  const isAdmin = userRole === 'ADMIN'
  const isManager = userRole === 'MANAGER'
  const canDelete = isAdmin
  const canUpdateRole = isAdmin

  useEffect(() => {
    console.log('UserManagementPage useEffect - user:', user, 'isAdmin:', isAdmin, 'userRole:', userRole)
    if (isAdmin && user?.id) {
      console.log('Fetching users for admin user:', user)
      fetchUsers()
    } else {
      console.log('Not fetching users - isAdmin:', isAdmin, 'user?.id:', user?.id)
    }
  }, [user, isAdmin, userRole])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      console.log('UserManagementPage: Starting to fetch users...')
      console.log('Token in localStorage:', localStorage.getItem('token') ? 'Present' : 'Missing')
      
      const response = await UserAPI.getAllUsers()
      console.log('UserManagementPage: API response received:', response)
      console.log('UserManagementPage: Response status:', response?.status)
      console.log('UserManagementPage: Response data:', response?.data)
      
      if (response && response.data) {
        const usersData = Array.isArray(response.data) ? response.data : []
        console.log('UserManagementPage: Parsed users data:', usersData)
        console.log('UserManagementPage: Number of users:', usersData.length)
        setUsers(usersData)
        if (usersData.length === 0) {
          toast.info('No users found in the system')
        } else {
          toast.success(`Loaded ${usersData.length} user(s)`)
        }
      } else {
        console.warn('UserManagementPage: Unexpected response format:', response)
        setUsers([])
        toast.warning('Unexpected response format from server')
      }
    } catch (error) {
      console.error('UserManagementPage: Error fetching users:', error)
      console.error('UserManagementPage: Error response:', error.response)
      console.error('UserManagementPage: Error status:', error.response?.status)
      console.error('UserManagementPage: Error data:', error.response?.data)
      console.error('UserManagementPage: Error message:', error.message)
      
      if (error.response?.status === 403) {
        toast.error('You do not have permission to access this page. Please ensure you are logged in as ADMIN.')
      } else if (error.response?.status === 401) {
        toast.error('Session expired. Please login again')
      } else if (error.response?.status === 404) {
        setUsers([])
        toast.info('No users found')
      } else if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        toast.error('Cannot connect to server. Please ensure the backend is running.')
      } else {
        const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to load users'
        toast.error(`Error: ${errorMsg}`)
        setUsers([])
      }
    } finally {
      setLoading(false)
      console.log('UserManagementPage: Finished fetching users, loading set to false')
    }
  }

  const handleRoleUpdate = async (userId, newRole) => {
    try {
      await UserAPI.updateUserRole(userId, newRole)
      toast.success('User role updated successfully')
      fetchUsers()
      setEditingUser(null)
      setSelectedRole('')
    } catch (error) {
      console.error('Error updating user role:', error)
      toast.error(error.response?.data?.error || 'Failed to update user role')
    }
  }

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return
    try {
      await UserAPI.deleteUser(userId)
      toast.success('User deleted successfully')
      fetchUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Failed to delete user')
    }
  }

  const getRoleBadgeVariant = (role) => {
    switch (role?.toUpperCase()) {
      case 'ADMIN':
        return 'default'
      case 'MANAGER':
        return 'secondary'
      case 'USER':
        return 'outline'
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

  if (!isAdmin) {
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
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-1">
              {isAdmin ? 'Manage all employees and their roles' : 'Manage team member roles'}
            </p>
          </div>
          <Button 
            onClick={fetchUsers} 
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
          <Card>
            <CardHeader>
              <CardTitle>All Employees</CardTitle>
              <CardDescription>
                {isAdmin 
                  ? 'List of all company employees. You can update roles and delete users.'
                  : 'List of all employees. You can update roles.'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No users found</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Current Role</TableHead>
                      <TableHead>Change Role</TableHead>
                      <TableHead>Created</TableHead>
                      {canDelete && <TableHead>Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((userItem) => (
                      <TableRow key={userItem.id}>
                        <TableCell className="font-medium">
                          {userItem.firstName} {userItem.lastName}
                        </TableCell>
                        <TableCell>{userItem.email}</TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(userItem.role)}>
                            {userItem.role || 'USER'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {editingUser === userItem.id ? (
                            <div className="flex gap-2 items-center">
                              <select
                                value={selectedRole || userItem.role}
                                onChange={(e) => setSelectedRole(e.target.value)}
                                className="px-2 py-1 border rounded text-sm cursor-pointer"
                              >
                                <option value="USER">USER</option>
                                <option value="MANAGER">MANAGER</option>
                              </select>
                              <Button
                                size="sm"
                                onClick={() => handleRoleUpdate(userItem.id, selectedRole || userItem.role)}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingUser(null)
                                  setSelectedRole('')
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingUser(userItem.id)
                                setSelectedRole(userItem.role)
                              }}
                              disabled={!canUpdateRole}
                            >
                              Change Role
                            </Button>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(userItem.createdAt)}</TableCell>
                        {canDelete && (
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(userItem.id)}
                              className="text-red-600 hover:text-red-700"
                              disabled={userItem.id === user?.id}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Sidebar>
  )
}

