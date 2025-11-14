import { useState, useEffect } from 'react'
import {
  createQuote,
  updateQuote,
  getCustomers,
  getLeads,
  type Quote,
  type CreateQuoteForm,
  type Customer,
  type Lead,
} from '@wyalink/supabase-client'

interface QuoteModalProps {
  isOpen: boolean
  onClose: (shouldRefresh?: boolean) => void
  quote?: Quote | null
}

export default function QuoteModal({ isOpen, onClose, quote }: QuoteModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [customerOrLeadType, setCustomerOrLeadType] = useState<'customer' | 'lead'>('customer')
  const [customerId, setCustomerId] = useState('')
  const [leadId, setLeadId] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [notes, setNotes] = useState('')
  const [terms, setTerms] = useState('')

  // Dropdown data
  const [customers, setCustomers] = useState<Customer[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [loadingData, setLoadingData] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchCustomersAndLeads()
    }
  }, [isOpen])

  useEffect(() => {
    if (quote) {
      setCustomerOrLeadType(quote.customer_id ? 'customer' : 'lead')
      setCustomerId(quote.customer_id || '')
      setLeadId(quote.lead_id || '')
      setExpiresAt(quote.expires_at ? new Date(quote.expires_at).toISOString().split('T')[0] : '')
      setNotes(quote.notes || '')
      setTerms(quote.terms || '')
    } else {
      resetForm()
    }
  }, [quote, isOpen])

  const fetchCustomersAndLeads = async () => {
    setLoadingData(true)
    try {
      const [customersResult, leadsResult] = await Promise.all([getCustomers(), getLeads()])

      if (customersResult.data) setCustomers(customersResult.data)
      if (leadsResult.data) setLeads(leadsResult.data)
    } catch (err) {
      console.error('Failed to load customers and leads:', err)
    } finally {
      setLoadingData(false)
    }
  }

  const resetForm = () => {
    setCustomerOrLeadType('customer')
    setCustomerId('')
    setLeadId('')
    // Default expiration: 30 days from now
    const defaultExpiration = new Date()
    defaultExpiration.setDate(defaultExpiration.getDate() + 30)
    setExpiresAt(defaultExpiration.toISOString().split('T')[0])
    setNotes('')
    setTerms('')
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const quoteData: CreateQuoteForm = {
        customer_id: customerOrLeadType === 'customer' ? customerId : undefined,
        lead_id: customerOrLeadType === 'lead' ? leadId : undefined,
        expires_at: expiresAt,
        notes: notes || undefined,
        terms: terms || undefined,
      }

      let result
      if (quote) {
        result = await updateQuote(quote.id, quoteData)
      } else {
        result = await createQuote(quoteData)
      }

      if (result.error) throw result.error

      onClose(true)
      resetForm()
    } catch (err: any) {
      setError(err.message || 'Failed to save quote')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              {quote ? 'Edit Quote' : 'Create New Quote'}
            </h2>
            <button
              onClick={() => onClose()}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Customer or Lead Selection */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Quote For</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quote Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={customerOrLeadType}
                    onChange={(e) => setCustomerOrLeadType(e.target.value as 'customer' | 'lead')}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="customer">Existing Customer</option>
                    <option value="lead">Potential Lead</option>
                  </select>
                </div>

                {customerOrLeadType === 'customer' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Customer <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={customerId}
                      onChange={(e) => setCustomerId(e.target.value)}
                      required
                      disabled={loadingData}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select a customer</option>
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.first_name} {customer.last_name} ({customer.account_number})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Lead <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={leadId}
                      onChange={(e) => setLeadId(e.target.value)}
                      required
                      disabled={loadingData}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select a lead</option>
                      {leads.map((lead) => (
                        <option key={lead.id} value={lead.id}>
                          {lead.first_name} {lead.last_name} - {lead.email}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Quote Details */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Quote Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiration Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Quote will automatically expire after this date</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Internal Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Internal notes (not visible to customer)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Terms & Conditions</label>
                  <textarea
                    value={terms}
                    onChange={(e) => setTerms(e.target.value)}
                    rows={4}
                    placeholder="Terms and conditions (visible to customer)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            {!quote && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-blue-900">After creating the quote</p>
                    <p className="text-xs text-blue-800 mt-1">
                      You'll be able to add items, apply promotions, and send the quote to the customer.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t">
            <button
              type="button"
              onClick={() => onClose()}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || loadingData}
              className="px-4 py-2 bg-primary-800 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : quote ? 'Update Quote' : 'Create Quote'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
