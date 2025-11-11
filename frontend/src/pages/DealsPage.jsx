import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { api } from '../api/api'
import toast from 'react-hot-toast'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

export default function DealsPage() {
  const { user } = useAuth()
  const [deals, setDeals] = useState([])
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedDeal, setSelectedDeal] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    value: '',
    stage: 'PROSPECTING',
    probability: 10,
    closeDate: '',
    contactId: null
  })

  const normalizeRole = (role) => {
    if (!role) return 'USER'
    return role.replace(/^ROLE_/, '').toUpperCase()
  }

  const userRole = normalizeRole(user?.role || 'USER')
  const isAdmin = userRole === 'ADMIN'
  const isManager = userRole === 'MANAGER'
  const isUser = userRole === 'USER'
  const canCreate = isAdmin || isManager
  const canEdit = isAdmin || isManager
  const canDelete = isAdmin

  useEffect(() => {
    fetchDeals()
    if (canCreate) {
      fetchContacts()
    }
  }, [])

  const fetchDeals = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/deals')
      if (response.data === 'no data' || !response.data) {
        setDeals([])
      } else {
        const dealsData = Array.isArray(response.data) ? response.data : []
        // For USER role, filter to show only their deals (when backend supports it)
        // For now, show all deals
        setDeals(dealsData)
      }
    } catch (error) {
      console.error('Error fetching deals:', error)
      toast.error('Failed to load deals')
      setDeals([])
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
      console.error('Error fetching contacts:', error)
      // If user doesn't have access, set empty array
      setContacts([])
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...formData,
        value: formData.value ? parseFloat(formData.value) : null,
        contactId: formData.contactId ? parseInt(formData.contactId) : null,
        closeDate: formData.closeDate || null
      }
      await api.post('/api/deals', payload)
      toast.success('Deal created successfully')
      setShowCreateModal(false)
      resetForm()
      fetchDeals()
    } catch (error) {
      console.error('Error creating deal:', error)
      toast.error('Failed to create deal')
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...formData,
        value: formData.value ? parseFloat(formData.value) : null,
        contactId: formData.contactId ? parseInt(formData.contactId) : null,
        closeDate: formData.closeDate || null
      }
      await api.put(`/api/deals/${selectedDeal.id}`, payload)
      toast.success('Deal updated successfully')
      setShowEditModal(false)
      setSelectedDeal(null)
      resetForm()
      fetchDeals()
    } catch (error) {
      console.error('Error updating deal:', error)
      toast.error('Failed to update deal')
    }
  }

  const handleStatusUpdate = async (dealId, newStage) => {
    try {
      await api.put(`/api/deals/${dealId}`, {
        ...deals.find(d => d.id === dealId),
        stage: newStage
      })
      toast.success('Deal status updated')
      fetchDeals()
    } catch (error) {
      console.error('Error updating deal status:', error)
      toast.error('Failed to update deal status')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this deal?')) return
    try {
      await api.delete(`/api/deals/${id}`)
      toast.success('Deal deleted successfully')
      fetchDeals()
    } catch (error) {
      console.error('Error deleting deal:', error)
      toast.error('Failed to delete deal')
    }
  }

  const openEditModal = (deal) => {
    setSelectedDeal(deal)
    setFormData({
      name: deal.name || '',
      description: deal.description || '',
      value: deal.value?.toString() || '',
      stage: deal.stage || 'PROSPECTING',
      probability: deal.probability || 10,
      closeDate: deal.closeDate || '',
      contactId: deal.contact?.id?.toString() || ''
    })
    setShowEditModal(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      value: '',
      stage: 'PROSPECTING',
      probability: 10,
      closeDate: '',
      contactId: null
    })
  }

  const getStageBadgeVariant = (stage) => {
    switch (stage?.toUpperCase()) {
      case 'PROSPECTING':
        return 'default'
      case 'QUALIFICATION':
        return 'secondary'
      case 'PROPOSAL':
        return 'default'
      case 'NEGOTIATION':
        return 'secondary'
      case 'CLOSED_WON':
        return 'default'
      case 'CLOSED_LOST':
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

  return (
    <Sidebar>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Deals</h1>
            <p className="text-gray-600 mt-1">
              {isUser ? 'View your deals' : 'Manage all deals'}
            </p>
          </div>
          {canCreate && (
            <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Deal
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
              <CardTitle>All Deals</CardTitle>
              <CardDescription>
                {isUser ? 'Your deals' : 'List of all deals'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {deals.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No deals found</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Deal Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Stage</TableHead>
                      {!isUser && <TableHead>Value</TableHead>}
                      <TableHead>Probability</TableHead>
                      <TableHead>Close Date</TableHead>
                      {isUser && <TableHead>Status</TableHead>}
                      {canEdit && <TableHead>Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deals.map((deal) => (
                      <TableRow key={deal.id}>
                        <TableCell className="font-medium">{deal.name || 'Untitled'}</TableCell>
                        <TableCell>
                          {deal.contact
                            ? `${deal.contact.firstName} ${deal.contact.lastName}`
                            : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStageBadgeVariant(deal.stage)}>
                            {deal.stage || 'PROSPECTING'}
                          </Badge>
                        </TableCell>
                        {!isUser && (
                          <TableCell>{formatCurrency(deal.value)}</TableCell>
                        )}
                        <TableCell>{deal.probability || 0}%</TableCell>
                        <TableCell>{formatDate(deal.closeDate)}</TableCell>
                        {isUser && (
                          <TableCell>
                            <select
                              value={deal.stage || 'PROSPECTING'}
                              onChange={(e) => handleStatusUpdate(deal.id, e.target.value)}
                              className="px-2 py-1 border rounded text-sm cursor-pointer"
                            >
                              <option value="PROSPECTING">Prospecting</option>
                              <option value="QUALIFICATION">Qualification</option>
                              <option value="PROPOSAL">Proposal</option>
                              <option value="NEGOTIATION">Negotiation</option>
                              <option value="CLOSED_WON">Closed Won</option>
                              <option value="CLOSED_LOST">Closed Lost</option>
                            </select>
                          </TableCell>
                        )}
                        {canEdit && (
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditModal(deal)}
                              >
                                <PencilIcon className="h-4 w-4" />
                              </Button>
                              {canDelete && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(deal.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </Button>
                              )}
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
              <CardTitle>Create New Deal</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Deal Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Value</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Stage</label>
                  <select
                    value={formData.stage}
                    onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg cursor-pointer"
                  >
                    <option value="PROSPECTING">Prospecting</option>
                    <option value="QUALIFICATION">Qualification</option>
                    <option value="PROPOSAL">Proposal</option>
                    <option value="NEGOTIATION">Negotiation</option>
                    <option value="CLOSED_WON">Closed Won</option>
                    <option value="CLOSED_LOST">Closed Lost</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Probability (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.probability}
                    onChange={(e) => setFormData({ ...formData, probability: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Close Date</label>
                  <input
                    type="date"
                    value={formData.closeDate}
                    onChange={(e) => setFormData({ ...formData, closeDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Contact</label>
                  <select
                    value={formData.contactId || ''}
                    onChange={(e) => setFormData({ ...formData, contactId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg cursor-pointer"
                  >
                    <option value="">Select a contact</option>
                    {contacts.map((contact) => (
                      <option key={contact.id} value={contact.id}>
                        {contact.firstName} {contact.lastName} - {contact.email}
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 cursor-pointer" onClick={() => { setShowEditModal(false); setSelectedDeal(null); resetForm() }}>
          <Card className="bg-white w-full max-w-md max-h-[90vh] overflow-y-auto cursor-default" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle>Edit Deal</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Deal Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Value</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Stage</label>
                  <select
                    value={formData.stage}
                    onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg cursor-pointer"
                  >
                    <option value="PROSPECTING">Prospecting</option>
                    <option value="QUALIFICATION">Qualification</option>
                    <option value="PROPOSAL">Proposal</option>
                    <option value="NEGOTIATION">Negotiation</option>
                    <option value="CLOSED_WON">Closed Won</option>
                    <option value="CLOSED_LOST">Closed Lost</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Probability (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.probability}
                    onChange={(e) => setFormData({ ...formData, probability: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Close Date</label>
                  <input
                    type="date"
                    value={formData.closeDate}
                    onChange={(e) => setFormData({ ...formData, closeDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Contact</label>
                  <select
                    value={formData.contactId || ''}
                    onChange={(e) => setFormData({ ...formData, contactId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg cursor-pointer"
                  >
                    <option value="">Select a contact</option>
                    {contacts.map((contact) => (
                      <option key={contact.id} value={contact.id}>
                        {contact.firstName} {contact.lastName} - {contact.email}
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
                      setSelectedDeal(null)
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

