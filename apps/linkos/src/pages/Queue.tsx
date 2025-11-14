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
import { Card } from '@wyalink/ui'

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
        <p className="text-gray-600">Loading queue...</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Store Queue</h1>
          <p className="text-gray-600 mt-1">Manage in-store visitor queue</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Add to Queue
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">{waitingQueue.length}</div>
            <div className="text-sm text-gray-600 mt-1">Waiting</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600">{beingAssisted.length}</div>
            <div className="text-sm text-gray-600 mt-1">Being Assisted</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">{waitingQueue.length + beingAssisted.length}</div>
            <div className="text-sm text-gray-600 mt-1">Total in Queue</div>
          </div>
        </Card>
      </div>

      {/* Waiting Queue */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Waiting ({waitingQueue.length})</h2>
        {waitingQueue.length === 0 ? (
          <Card>
            <p className="text-gray-600 text-center py-8">No one waiting in queue</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {waitingQueue.map((entry, index) => (
              <Card key={entry.id}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-100 text-primary-700 font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">{entry.visitor_name}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          entry.visitor_type === 'lead' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {entry.visitor_type === 'lead' ? 'Lead' : 'Customer'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        {entry.visitor_phone && (
                          <span>
                            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {entry.visitor_phone}
                          </span>
                        )}
                        <span>
                          <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Waiting {getWaitTime(entry)}
                        </span>
                      </div>
                      {entry.notes && (
                        <p className="text-sm text-gray-500 mt-1 italic">{entry.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStartAssisting(entry)}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
                    >
                      Assist
                    </button>
                    <button
                      onClick={() => handleRemoveFromQueue(entry)}
                      className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
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
            <p className="text-gray-600 text-center py-8">No one currently being assisted</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {beingAssisted.map((entry) => (
              <Card key={entry.id}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">{entry.visitor_name}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        entry.visitor_type === 'lead' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {entry.visitor_type === 'lead' ? 'Lead' : 'Customer'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                      {entry.visitor_phone && (
                        <span>
                          <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
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
                  <button
                    onClick={() => handleCompleteAssistance(entry)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    Complete
                  </button>
                </div>
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
            <button
              onClick={() => setMode('select')}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                mode === 'select'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Select Existing
            </button>
            <button
              onClick={() => setMode('create')}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                mode === 'create'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Create New Lead
            </button>
          </div>

          {mode === 'select' ? (
            <form onSubmit={handleAddExisting} className="space-y-4">
              {/* Visitor Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Visitor Type</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setVisitorType('lead')
                      setSelectedId('')
                    }}
                    className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                      visitorType === 'lead'
                        ? 'bg-blue-100 text-blue-800 border-2 border-blue-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                    }`}
                  >
                    Lead
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setVisitorType('customer')
                      setSelectedId('')
                    }}
                    className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                      visitorType === 'customer'
                        ? 'bg-green-100 text-green-800 border-2 border-green-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                    }`}
                  >
                    Customer
                  </button>
                </div>
              </div>

              {/* Select Visitor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select {visitorType === 'lead' ? 'Lead' : 'Customer'} *
                </label>
                {loading ? (
                  <p className="text-gray-600 text-sm">Loading...</p>
                ) : (
                  <select
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Special requests, reason for visit, etc."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                  disabled={saving || !selectedId}
                >
                  {saving ? 'Adding...' : 'Add to Queue'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleCreateNew} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                <textarea
                  value={createNotes}
                  onChange={(e) => setCreateNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Special requests, reason for visit, etc."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                  disabled={saving}
                >
                  {saving ? 'Creating...' : 'Create & Add to Queue'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
