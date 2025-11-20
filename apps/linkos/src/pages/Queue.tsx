import { useState, useEffect } from 'react'
import {
  getWaitingQueue,
  getBeingAssistedEntries,
  addToQueue,
  startAssisting,
  completeAssistance,
  removeFromQueue,
  getLeads,
  getCustomers,
  createLead,
  useAuth,
  type StoreQueueEntry,
  type Lead,
  type Customer,
} from '@wyalink/supabase-client'
import { Card, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Plus, Clock, Phone, UserPlus, Trash2, CheckCircle } from 'lucide-react'

export default function Queue() {
  const { user } = useAuth()
  const [waitingQueue, setWaitingQueue] = useState<StoreQueueEntry[]>([])
  const [beingAssisted, setBeingAssisted] = useState<StoreQueueEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    fetchQueue()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchQueue, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchQueue = async () => {
    try {
      const [waitingResult, assistingResult] = await Promise.all([
        getWaitingQueue(),
        getBeingAssistedEntries(),
      ])

      if (waitingResult.data) setWaitingQueue(waitingResult.data)
      if (assistingResult.data) setBeingAssisted(assistingResult.data)
    } catch (err) {
      console.error('Failed to fetch queue:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleStartAssisting = async (entry: StoreQueueEntry) => {
    if (!user) return
    if (!confirm(`Start assisting ${entry.visitor_name}?`)) return

    const result = await startAssisting(entry.id, user.id)
    if (!result.error) {
      fetchQueue()
    } else {
      alert('Failed to start assistance: ' + result.error.message)
    }
  }

  const handleCompleteAssistance = async (entry: StoreQueueEntry) => {
    if (!confirm(`Mark assistance for ${entry.visitor_name} as complete?`)) return

    const result = await completeAssistance(entry.id)
    if (!result.error) {
      fetchQueue()
    } else {
      alert('Failed to complete assistance: ' + result.error.message)
    }
  }

  const handleRemoveFromQueue = async (entry: StoreQueueEntry) => {
    const reason = prompt(`Remove ${entry.visitor_name} from queue? (Optional: Provide a reason)`)
    if (reason === null) return // User cancelled

    const result = await removeFromQueue(entry.id, reason || undefined)
    if (!result.error) {
      fetchQueue()
    } else {
      alert('Failed to remove from queue: ' + result.error.message)
    }
  }

  const getWaitTime = (entry: StoreQueueEntry) => {
    const now = new Date()
    const checkedIn = new Date(entry.checked_in_at)
    const diffMs = now.getTime() - checkedIn.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'Just now'
    if (diffMins === 1) return '1 min'
    if (diffMins < 60) return `${diffMins} mins`
    const hours = Math.floor(diffMins / 60)
    const mins = diffMins % 60
    return `${hours}h ${mins}m`
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Store Queue</h1>
        <p className="text-muted-foreground">Loading queue...</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Store Queue</h1>
          <p className="text-muted-foreground mt-1">Manage in-store visitor queue</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add to Queue
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{waitingQueue.length}</div>
              <div className="text-sm text-muted-foreground mt-1">Waiting</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">{beingAssisted.length}</div>
              <div className="text-sm text-muted-foreground mt-1">Being Assisted</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{waitingQueue.length + beingAssisted.length}</div>
              <div className="text-sm text-muted-foreground mt-1">Total in Queue</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Waiting Queue */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Waiting ({waitingQueue.length})</h2>
        {waitingQueue.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center py-8">No one waiting in queue</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {waitingQueue.map((entry, index) => (
              <Card key={entry.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-100 text-primary-700 font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-gray-900">{entry.visitor_name}</h3>
                          <Badge variant={entry.visitor_type === 'lead' ? 'info' : 'success'}>
                            {entry.visitor_type === 'lead' ? 'Lead' : 'Customer'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          {entry.visitor_phone && (
                            <span className="flex items-center">
                              <Phone className="w-4 h-4 mr-1" />
                              {entry.visitor_phone}
                            </span>
                          )}
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            Waiting {getWaitTime(entry)}
                          </span>
                        </div>
                        {entry.notes && (
                          <p className="text-sm text-muted-foreground mt-1 italic">{entry.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleStartAssisting(entry)}
                        size="sm"
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Assist
                      </Button>
                      <Button
                        onClick={() => handleRemoveFromQueue(entry)}
                        variant="outline"
                        size="sm"
                        className="border-red-300 text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Being Assisted */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Being Assisted ({beingAssisted.length})</h2>
        {beingAssisted.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center py-8">No one currently being assisted</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {beingAssisted.map((entry) => (
              <Card key={entry.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">{entry.visitor_name}</h3>
                        <Badge variant={entry.visitor_type === 'lead' ? 'info' : 'success'}>
                          {entry.visitor_type === 'lead' ? 'Lead' : 'Customer'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        {entry.visitor_phone && (
                          <span className="flex items-center">
                            <Phone className="w-4 h-4 mr-1" />
                            {entry.visitor_phone}
                          </span>
                        )}
                        {entry.assisting_user && (
                          <span className="text-primary-600 font-medium">
                            Assisted by {entry.assisting_user.first_name || 'Staff'}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleCompleteAssistance(entry)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Complete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add to Queue Modal */}
      {showAddModal && (
        <AddToQueueModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false)
            fetchQueue()
          }}
        />
      )}
    </div>
  )
}

// Add to Queue Modal Component
function AddToQueueModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void
  onSuccess: () => void
}) {
  const [mode, setMode] = useState<'select' | 'create'>('select')
  const [visitorType, setVisitorType] = useState<'lead' | 'customer'>('lead')
  const [leads, setLeads] = useState<Lead[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Select mode
  const [selectedId, setSelectedId] = useState('')
  const [notes, setNotes] = useState('')

  // Create mode (new lead)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [createNotes, setCreateNotes] = useState('')

  useEffect(() => {
    fetchData()
  }, [visitorType])

  const fetchData = async () => {
    setLoading(true)
    try {
      if (visitorType === 'lead') {
        const result = await getLeads()
        if (result.data) setLeads(result.data)
      } else {
        const result = await getCustomers()
        if (result.data) setCustomers(result.data)
      }
    } catch (err) {
      console.error('Failed to fetch data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddExisting = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedId) return

    setSaving(true)
    try {
      const selected = visitorType === 'lead'
        ? leads.find(l => l.id === selectedId)
        : customers.find(c => c.id === selectedId)

      if (!selected) throw new Error('Visitor not found')

      const visitorName = visitorType === 'lead'
        ? `${(selected as Lead).first_name || ''} ${(selected as Lead).last_name || ''}`.trim() || (selected as Lead).email
        : `${(selected as Customer).first_name} ${(selected as Customer).last_name}`.trim()

      const result = await addToQueue({
        visitor_type: visitorType,
        [visitorType === 'lead' ? 'lead_id' : 'customer_id']: selectedId,
        visitor_name: visitorName,
        visitor_phone: (selected as any).phone || undefined,
        visitor_email: (selected as any).email || undefined,
        notes: notes || undefined,
      })

      if (result.error) throw result.error
      onSuccess()
    } catch (err) {
      alert('Failed to add to queue: ' + (err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const handleCreateNew = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!firstName || !lastName || !email) return

    setSaving(true)
    try {
      // Create new lead
      const leadResult = await createLead({
        first_name: firstName,
        last_name: lastName,
        phone: phone || undefined,
        email,
        notes: createNotes || undefined,
        source: 'in-store',
      })

      if (leadResult.error || !leadResult.data) throw leadResult.error || new Error('Failed to create lead')

      // Add to queue
      const queueResult = await addToQueue({
        visitor_type: 'lead',
        lead_id: leadResult.data.id,
        visitor_name: `${firstName} ${lastName}`.trim(),
        visitor_phone: phone || undefined,
        visitor_email: email,
        notes: createNotes || undefined,
      })

      if (queueResult.error) throw queueResult.error
      onSuccess()
    } catch (err) {
      alert('Failed to create and add to queue: ' + (err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Add to Queue</h2>

          {/* Mode Selector */}
          <div className="flex gap-2 mb-6">
            <Button
              type="button"
              onClick={() => setMode('select')}
              variant={mode === 'select' ? 'default' : 'outline'}
              className="flex-1"
            >
              Select Existing
            </Button>
            <Button
              type="button"
              onClick={() => setMode('create')}
              variant={mode === 'create' ? 'default' : 'outline'}
              className="flex-1"
            >
              Create New Lead
            </Button>
          </div>

          {mode === 'select' ? (
            <form onSubmit={handleAddExisting} className="space-y-4">
              {/* Visitor Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Visitor Type</label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={() => {
                      setVisitorType('lead')
                      setSelectedId('')
                    }}
                    variant={visitorType === 'lead' ? 'default' : 'outline'}
                    className={`flex-1 ${
                      visitorType === 'lead'
                        ? 'bg-info text-info-foreground hover:bg-info/90'
                        : ''
                    }`}
                  >
                    Lead
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setVisitorType('customer')
                      setSelectedId('')
                    }}
                    variant={visitorType === 'customer' ? 'default' : 'outline'}
                    className={`flex-1 ${
                      visitorType === 'customer'
                        ? 'bg-success text-success-foreground hover:bg-success/90'
                        : ''
                    }`}
                  >
                    Customer
                  </Button>
                </div>
              </div>

              {/* Select Visitor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select {visitorType === 'lead' ? 'Lead' : 'Customer'} *
                </label>
                {loading ? (
                  <p className="text-muted-foreground text-sm">Loading...</p>
                ) : (
                  <select
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">-- Select --</option>
                    {visitorType === 'lead'
                      ? leads.map((lead) => (
                          <option key={lead.id} value={lead.id}>
                            {lead.first_name && lead.last_name
                              ? `${lead.first_name} ${lead.last_name} - ${lead.email}`
                              : lead.email}
                          </option>
                        ))
                      : customers.map((customer) => (
                          <option key={customer.id} value={customer.id}>
                            {customer.first_name} {customer.last_name} - {customer.email}
                          </option>
                        ))}
                  </select>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Special requests, reason for visit, etc."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  onClick={onClose}
                  variant="outline"
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving || !selectedId}
                >
                  {saving ? 'Adding...' : 'Add to Queue'}
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleCreateNew} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <Input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <Input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                <textarea
                  value={createNotes}
                  onChange={(e) => setCreateNotes(e.target.value)}
                  rows={2}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Special requests, reason for visit, etc."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  onClick={onClose}
                  variant="outline"
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                >
                  {saving ? 'Creating...' : 'Create & Add to Queue'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
