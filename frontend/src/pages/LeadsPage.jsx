import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'
import Footer from '../components/Footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { api } from '../api/api'
import toast from 'react-hot-toast'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

export default function LeadsPage() {
  const { user } = useAuth()
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedLead, setSelectedLead] = useState(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    status: 'NEW'
  })

  const normalizeRole = (role) => {
    if (!role) return 'USER'
    return role.replace(/^ROLE_/, '').toUpperCase()
  }

  const userRole = normalizeRole(user?.role || 'USER')
  const isAdmin = userRole === 'ADMIN'
  const isManager = userRole === 'MANAGER'
  const canEdit = isAdmin || isManager

  useEffect(() => {
    fetchLeads()
  }, [])

  const fetchLeads = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/leads')
      if (response.data === 'no data' || !response.data) {
        setLeads([])
      } else {
        setLeads(Array.isArray(response.data) ? response.data : [])
      }
    } catch (error) {
      console.error('Error fetching leads:', error)
      toast.error('Failed to load leads')
      setLeads([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await api.post('/api/leads', formData)
      toast.success('Lead created successfully')
      setShowCreateModal(false)
      setFormData({ firstName: '', lastName: '', email: '', phone: '', company: '', status: 'NEW' })
      fetchLeads()
    } catch (error) {
      console.error('Error creating lead:', error)
      toast.error('Failed to create lead')
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      await api.put(`/api/leads/${selectedLead.id}`, formData)
      toast.success('Lead updated successfully')
      setShowEditModal(false)
      setSelectedLead(null)
      setFormData({ firstName: '', lastName: '', email: '', phone: '', company: '', status: 'NEW' })
      fetchLeads()
    } catch (error) {
      console.error('Error updating lead:', error)
      toast.error('Failed to update lead')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return
    try {
      await api.delete(`/api/leads/${id}`)
      toast.success('Lead deleted successfully')
      fetchLeads()
    } catch (error) {
      console.error('Error deleting lead:', error)
      toast.error('Failed to delete lead')
    }
  }

  const openEditModal = (lead) => {
    setSelectedLead(lead)
    setFormData({
      firstName: lead.firstName || '',
      lastName: lead.lastName || '',
      email: lead.email || '',
      phone: lead.phone || '',
      company: lead.company || '',
      status: lead.status || 'NEW'
    })
    setShowEditModal(true)
  }

  const getStatusBadgeVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'new':
        return 'default'
      case 'qualified':
      case 'contacted':
        return 'secondary'
      case 'converted':
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

  return (
    <Sidebar>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
            <p className="text-gray-600 mt-1">Manage your company leads</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="cursor-pointer bg-blue-600 text-white hover:bg-blue-700">
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Lead
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>All Leads</CardTitle>
              <CardDescription>List of all company leads</CardDescription>
            </CardHeader>
            <CardContent>
              {leads.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No leads found</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      {canEdit && <TableHead>Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell className="font-medium">
                          {lead.firstName} {lead.lastName}
                        </TableCell>
                        <TableCell>{lead.email || 'N/A'}</TableCell>
                        <TableCell>{lead.phone || 'N/A'}</TableCell>
                        <TableCell>{lead.company || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(lead.status)}>
                            {lead.status || 'NEW'}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(lead.createdAt)}</TableCell>
                        {canEdit && (
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditModal(lead)}
                              >
                                <PencilIcon className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(lead.id)}
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
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 cursor-pointer" onClick={() => setShowCreateModal(false)}>
          <Card className="bg-white w-full max-w-md cursor-default" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle>Create New Lead</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Company</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg cursor-pointer"
                  >
                    <option value="NEW">New</option>
                    <option value="CONTACTED">Contacted</option>
                    <option value="QUALIFIED">Qualified</option>
                    <option value="CONVERTED">Converted</option>
                    <option value="LOST">Lost</option>
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
                      setFormData({ firstName: '', lastName: '', email: '', phone: '', company: '', status: 'NEW' })
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
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 cursor-pointer" onClick={() => { setShowEditModal(false); setSelectedLead(null); setFormData({ firstName: '', lastName: '', email: '', phone: '', company: '', status: 'NEW' }) }}>
          <Card className="bg-white w-full max-w-md cursor-default" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle>Edit Lead</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Company</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg cursor-pointer"
                  >
                    <option value="NEW">New</option>
                    <option value="CONTACTED">Contacted</option>
                    <option value="QUALIFIED">Qualified</option>
                    <option value="CONVERTED">Converted</option>
                    <option value="LOST">Lost</option>
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
                      setSelectedLead(null)
                      setFormData({ firstName: '', lastName: '', email: '', phone: '', company: '', status: 'NEW' })
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

