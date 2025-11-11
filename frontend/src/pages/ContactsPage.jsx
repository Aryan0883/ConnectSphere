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

export default function ContactsPage() {
  const { user } = useAuth()
  const [contacts, setContacts] = useState([])
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedContact, setSelectedContact] = useState(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    jobTitle: '',
    notes: ''
  })

  const normalizeRole = (role) => {
    if (!role) return 'USER'
    return role.replace(/^ROLE_/, '').toUpperCase()
  }

  const userRole = normalizeRole(user?.role || 'USER')
  const isAdmin = userRole === 'ADMIN'
  const isManager = userRole === 'MANAGER'
  const isUser = userRole === 'USER'
  const canCreate = isAdmin
  const canEdit = isAdmin
  const canDelete = isAdmin

  useEffect(() => {
    if (isAdmin) {
      fetchContacts()
    } else if (isUser) {
      // USER can see contacts through their deals
      fetchUserDealContacts()
    }
    // MANAGER cannot see contacts
  }, [])

  const fetchContacts = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/contacts')
      if (response.data === 'no data' || !response.data) {
        setContacts([])
      } else {
        setContacts(Array.isArray(response.data) ? response.data : [])
      }
    } catch (error) {
      console.error('Error fetching contacts:', error)
      toast.error('Failed to load contacts')
      setContacts([])
    } finally {
      setLoading(false)
    }
  }

  const fetchUserDealContacts = async () => {
    try {
      setLoading(true)
      // First get user's deals
      const dealsResponse = await api.get('/api/deals')
      const userDeals = Array.isArray(dealsResponse.data) ? dealsResponse.data : []
      setDeals(userDeals)
      
      // Extract unique contacts from deals
      const contactMap = new Map()
      userDeals.forEach(deal => {
        if (deal.contact) {
          contactMap.set(deal.contact.id, deal.contact)
        }
      })
      setContacts(Array.from(contactMap.values()))
    } catch (error) {
      console.error('Error fetching user deal contacts:', error)
      toast.error('Failed to load contacts')
      setContacts([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await api.post('/api/contacts', formData)
      toast.success('Contact created successfully')
      setShowCreateModal(false)
      resetForm()
      fetchContacts()
    } catch (error) {
      console.error('Error creating contact:', error)
      toast.error('Failed to create contact')
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      await api.put(`/api/contacts/${selectedContact.id}`, formData)
      toast.success('Contact updated successfully')
      setShowEditModal(false)
      setSelectedContact(null)
      resetForm()
      fetchContacts()
    } catch (error) {
      console.error('Error updating contact:', error)
      toast.error('Failed to update contact')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return
    try {
      await api.delete(`/api/contacts/${id}`)
      toast.success('Contact deleted successfully')
      fetchContacts()
    } catch (error) {
      console.error('Error deleting contact:', error)
      toast.error('Failed to delete contact')
    }
  }

  const openEditModal = (contact) => {
    setSelectedContact(contact)
    setFormData({
      firstName: contact.firstName || '',
      lastName: contact.lastName || '',
      email: contact.email || '',
      phone: contact.phone || '',
      company: contact.company || '',
      jobTitle: contact.jobTitle || '',
      notes: contact.notes || ''
    })
    setShowEditModal(true)
  }

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      jobTitle: '',
      notes: ''
    })
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // MANAGER cannot access contacts
  if (isManager) {
    return (
      <Sidebar>
        <div className="p-6">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500 text-lg">
                You do not have permission to view contacts.
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
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
            <p className="text-gray-600 mt-1">
              {isUser ? 'Contacts from your deals' : 'Manage all company contacts'}
            </p>
          </div>
          {canCreate && (
            <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Contact
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
              <CardTitle>
                {isUser ? 'Your Deal Contacts' : 'All Contacts'}
              </CardTitle>
              <CardDescription>
                {isUser 
                  ? 'Contacts associated with your deals'
                  : 'List of all company contacts'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {contacts.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  {isUser 
                    ? 'No contacts found in your deals'
                    : 'No contacts found'
                  }
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Job Title</TableHead>
                      <TableHead>Created</TableHead>
                      {canEdit && <TableHead>Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contacts.map((contact) => (
                      <TableRow key={contact.id}>
                        <TableCell className="font-medium">
                          {contact.firstName} {contact.lastName}
                        </TableCell>
                        <TableCell>{contact.email || 'N/A'}</TableCell>
                        <TableCell>{contact.phone || 'N/A'}</TableCell>
                        <TableCell>{contact.company || 'N/A'}</TableCell>
                        <TableCell>{contact.jobTitle || 'N/A'}</TableCell>
                        <TableCell>{formatDate(contact.createdAt)}</TableCell>
                        {canEdit && (
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditModal(contact)}
                              >
                                <PencilIcon className="h-4 w-4" />
                              </Button>
                              {canDelete && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(contact.id)}
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

      {/* Create Modal - Admin only */}
      {showCreateModal && canCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 cursor-pointer" onClick={() => { setShowCreateModal(false); resetForm() }}>
          <Card className="bg-white w-full max-w-md max-h-[90vh] overflow-y-auto cursor-default" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle>Create New Contact</CardTitle>
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
                  <label className="block text-sm font-medium mb-1">Job Title</label>
                  <input
                    type="text"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
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

      {/* Edit Modal - Admin only */}
      {showEditModal && canEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 cursor-pointer" onClick={() => { setShowEditModal(false); setSelectedContact(null); resetForm() }}>
          <Card className="bg-white w-full max-w-md max-h-[90vh] overflow-y-auto cursor-default" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle>Edit Contact</CardTitle>
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
                  <label className="block text-sm font-medium mb-1">Job Title</label>
                  <input
                    type="text"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
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
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                    Update
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowEditModal(false)
                      setSelectedContact(null)
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

