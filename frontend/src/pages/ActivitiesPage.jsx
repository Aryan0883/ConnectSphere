import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { api } from '../api/api'
import toast from 'react-hot-toast'
import { PlusIcon, PencilIcon, TrashIcon, CheckIcon } from '@heroicons/react/24/outline'

export default function ActivitiesPage() {
  const { user } = useAuth()
  const [activities, setActivities] = useState([])
  const [contacts, setContacts] = useState([])
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [formData, setFormData] = useState({
    type: 'TASK',
    subject: '',
    notes: '',
    dueDate: '',
    completed: false,
    contactId: null,
    dealId: null
  })

  const normalizeRole = (role) => {
    if (!role) return 'USER'
    return role.replace(/^ROLE_/, '').toUpperCase()
  }

  const userRole = normalizeRole(user?.role || 'USER')
  const isAdmin = userRole === 'ADMIN'
  const isManager = userRole === 'MANAGER'
  const canCreate = isAdmin || isManager
  const canEdit = isAdmin || isManager

  useEffect(() => {
    fetchActivities()
    if (canCreate) {
      fetchContacts()
      fetchDeals()
    }
  }, [])

  const fetchActivities = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/activities')
      if (response.data === 'no data' || !response.data) {
        setActivities([])
      } else {
        setActivities(Array.isArray(response.data) ? response.data : [])
      }
    } catch (error) {
      console.error('Error fetching activities:', error)
      toast.error('Failed to load activities')
      setActivities([])
    } finally {
      setLoading(false)
    }
  }

  const fetchContacts = async () => {
    try {
      const response = await api.get('/api/contacts')
      if (response.data === 'no data' || !response.data) {
        setContacts([])
      } else {
        setContacts(Array.isArray(response.data) ? response.data : [])
      }
    } catch (error) {
      setContacts([])
    }
  }

  const fetchDeals = async () => {
    try {
      const response = await api.get('/api/deals')
      if (response.data === 'no data' || !response.data) {
        setDeals([])
      } else {
        setDeals(Array.isArray(response.data) ? response.data : [])
      }
    } catch (error) {
      setDeals([])
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...formData,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        contactId: formData.contactId ? parseInt(formData.contactId) : null,
        dealId: formData.dealId ? parseInt(formData.dealId) : null
      }
      await api.post('/api/activities', payload)
      toast.success('Activity created successfully')
      setShowCreateModal(false)
      resetForm()
      fetchActivities()
    } catch (error) {
      console.error('Error creating activity:', error)
      toast.error('Failed to create activity')
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...formData,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        contactId: formData.contactId ? parseInt(formData.contactId) : null,
        dealId: formData.dealId ? parseInt(formData.dealId) : null
      }
      await api.put(`/api/activities/${selectedActivity.id}`, payload)
      toast.success('Activity updated successfully')
      setShowEditModal(false)
      setSelectedActivity(null)
      resetForm()
      fetchActivities()
    } catch (error) {
      console.error('Error updating activity:', error)
      toast.error('Failed to update activity')
    }
  }

  const handleToggleComplete = async (activity) => {
    try {
      await api.put(`/api/activities/${activity.id}`, {
        ...activity,
        completed: !activity.completed
      })
      toast.success('Activity status updated')
      fetchActivities()
    } catch (error) {
      console.error('Error updating activity:', error)
      toast.error('Failed to update activity')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this activity?')) return
    try {
      await api.delete(`/api/activities/${id}`)
      toast.success('Activity deleted successfully')
      fetchActivities()
    } catch (error) {
      console.error('Error deleting activity:', error)
      toast.error('Failed to delete activity')
    }
  }

  const openEditModal = (activity) => {
    setSelectedActivity(activity)
    const dueDate = activity.dueDate 
      ? new Date(activity.dueDate).toISOString().slice(0, 16)
      : ''
    setFormData({
      type: activity.type || 'TASK',
      subject: activity.subject || '',
      notes: activity.notes || '',
      dueDate: dueDate,
      completed: activity.completed || false,
      contactId: activity.contact?.id?.toString() || '',
      dealId: activity.deal?.id?.toString() || ''
    })
    setShowEditModal(true)
  }

  const resetForm = () => {
    setFormData({
      type: 'TASK',
      subject: '',
      notes: '',
      dueDate: '',
      completed: false,
      contactId: null,
      dealId: null
    })
  }

  const getTypeBadgeVariant = (type) => {
    switch (type?.toUpperCase()) {
      case 'CALL':
        return 'default'
      case 'EMAIL':
        return 'secondary'
      case 'MEETING':
        return 'default'
      case 'TASK':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Sidebar>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Activities</h1>
            <p className="text-gray-600 mt-1">
              {canCreate ? 'Manage team activities' : 'View activities'}
            </p>
          </div>
          {canCreate && (
            <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Activity
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>All Activities</CardTitle>
              <CardDescription>List of all activities</CardDescription>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No activities found</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Deal</TableHead>
                      {canEdit && <TableHead>Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activities.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell>
                          <Badge variant={getTypeBadgeVariant(activity.type)}>
                            {activity.type || 'TASK'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{activity.subject || 'N/A'}</TableCell>
                        <TableCell>{formatDateTime(activity.dueDate)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {activity.completed ? (
                              <Badge variant="default" className="bg-green-600">
                                <CheckIcon className="h-3 w-3 mr-1" />
                                Completed
                              </Badge>
                            ) : (
                              <Badge variant="outline">Pending</Badge>
                            )}
                            {!activity.completed && canEdit && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleComplete(activity)}
                                className="text-green-600"
                              >
                                Mark Complete
                              </Button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {activity.contact
                            ? `${activity.contact.firstName} ${activity.contact.lastName}`
                            : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {activity.deal ? activity.deal.name || 'N/A' : 'N/A'}
                        </TableCell>
                        {canEdit && (
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditModal(activity)}
                              >
                                <PencilIcon className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(activity.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </Button>
                            </div>
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

      {/* Create Modal */}
      {showCreateModal && canCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 cursor-pointer" onClick={() => { setShowCreateModal(false); resetForm() }}>
          <Card className="bg-white w-full max-w-md max-h-[90vh] overflow-y-auto cursor-default" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle>Create New Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg cursor-pointer"
                  >
                    <option value="TASK">Task</option>
                    <option value="CALL">Call</option>
                    <option value="EMAIL">Email</option>
                    <option value="MEETING">Meeting</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Due Date & Time</label>
                  <input
                    type="datetime-local"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Contact (Optional)</label>
                  <select
                    value={formData.contactId || ''}
                    onChange={(e) => setFormData({ ...formData, contactId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg cursor-pointer"
                  >
                    <option value="">Select a contact</option>
                    {contacts.map((contact) => (
                      <option key={contact.id} value={contact.id}>
                        {contact.firstName} {contact.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Deal (Optional)</label>
                  <select
                    value={formData.dealId || ''}
                    onChange={(e) => setFormData({ ...formData, dealId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg cursor-pointer"
                  >
                    <option value="">Select a deal</option>
                    {deals.map((deal) => (
                      <option key={deal.id} value={deal.id}>
                        {deal.name || 'Untitled Deal'}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                    Create
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreateModal(false)
                      resetForm()
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && canEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 cursor-pointer" onClick={() => { setShowEditModal(false); setSelectedActivity(null); resetForm() }}>
          <Card className="bg-white w-full max-w-md max-h-[90vh] overflow-y-auto cursor-default" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle>Edit Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg cursor-pointer"
                  >
                    <option value="TASK">Task</option>
                    <option value="CALL">Call</option>
                    <option value="EMAIL">Email</option>
                    <option value="MEETING">Meeting</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Due Date & Time</label>
                  <input
                    type="datetime-local"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.completed}
                      onChange={(e) => setFormData({ ...formData, completed: e.target.checked })}
                      className="cursor-pointer"
                    />
                    Completed
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Contact (Optional)</label>
                  <select
                    value={formData.contactId || ''}
                    onChange={(e) => setFormData({ ...formData, contactId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg cursor-pointer"
                  >
                    <option value="">Select a contact</option>
                    {contacts.map((contact) => (
                      <option key={contact.id} value={contact.id}>
                        {contact.firstName} {contact.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Deal (Optional)</label>
                  <select
                    value={formData.dealId || ''}
                    onChange={(e) => setFormData({ ...formData, dealId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg cursor-pointer"
                  >
                    <option value="">Select a deal</option>
                    {deals.map((deal) => (
                      <option key={deal.id} value={deal.id}>
                        {deal.name || 'Untitled Deal'}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                    Update
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowEditModal(false)
                      setSelectedActivity(null)
                      resetForm()
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </Sidebar>
  )
}

