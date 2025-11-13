import { useState } from 'react'
import { convertLeadToCustomer, getCustomer, type Lead } from '@wyalink/supabase-client'
import { useNavigate } from 'react-router-dom'

interface ConvertLeadModalProps {
  isOpen: boolean
  onClose: (converted?: boolean) => void
  lead: Lead | null
}

export default function ConvertLeadModal({ isOpen, onClose, lead }: ConvertLeadModalProps) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [customerAccountNumber, setCustomerAccountNumber] = useState<string | null>(null)

  if (!isOpen || !lead) return null

  const handleConvert = async () => {
    setLoading(true)
    setError(null)

    try {
      // Convert lead to customer using database function
      const { data: customerId, error: convertError } = await convertLeadToCustomer(lead.id)

      if (convertError) throw convertError
      if (!customerId) throw new Error('Failed to create customer')

      // Fetch the new customer to get account number
      const { data: customer, error: customerError } = await getCustomer(customerId)

      if (customerError) throw customerError
      if (!customer) throw new Error('Failed to fetch customer data')

      setCustomerAccountNumber(customer.account_number)
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Failed to convert lead to customer')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setSuccess(false)
    setCustomerAccountNumber(null)
    setError(null)
    onClose(success)
  }

  const handleViewCustomer = () => {
    if (customerAccountNumber) {
      navigate(`/customers?account=${customerAccountNumber}`)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              {success ? 'Conversion Successful!' : 'Convert Lead to Customer'}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={loading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Lead Successfully Converted!</h3>
              <p className="text-gray-600 mb-4">
                A new customer account has been created with all lead information transferred.
              </p>
              {customerAccountNumber && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-600 mb-1">Customer Account Number</p>
                  <p className="text-2xl font-bold text-primary-600">{customerAccountNumber}</p>
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={handleViewCustomer}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  View Customer
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <p className="text-gray-700 mb-4">
                  You are about to convert this lead into a customer. This will:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 text-sm">
                  <li>Create a new customer account with a unique 10-digit account number</li>
                  <li>Transfer all lead information to the customer record</li>
                  <li>Link the lead to the new customer (preserving history)</li>
                  <li>Allow you to manage subscriptions, lines, and services</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">Lead Information</h4>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-700">
                    <span className="font-medium">Name:</span>{' '}
                    {lead.first_name || lead.last_name
                      ? `${lead.first_name || ''} ${lead.last_name || ''}`.trim()
                      : 'N/A'}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">Email:</span> {lead.email}
                  </p>
                  {lead.phone && (
                    <p className="text-gray-700">
                      <span className="font-medium">Phone:</span> {lead.phone}
                    </p>
                  )}
                  {lead.company && (
                    <p className="text-gray-700">
                      <span className="font-medium">Company:</span> {lead.company}
                    </p>
                  )}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConvert}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Converting...' : 'Convert to Customer'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
