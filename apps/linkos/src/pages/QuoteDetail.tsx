import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getQuote, updateQuote, sendQuote, acceptQuote, declineQuote, removeQuoteItem, recalculateQuoteTotals, type Quote, type QuoteStatus, type QuoteItem, type Customer, type Lead } from '@wyalink/supabase-client'
import { Card } from '@wyalink/ui'
import { useAuth } from '@wyalink/supabase-client'
import QuoteItemModal from '../components/QuoteItemModal'
import { PDFDownloadLink } from '@react-pdf/renderer'
import QuotePDF from '../components/QuotePDF'
import SendQuoteModal from '../components/SendQuoteModal'

// Extended Quote type with relations
interface QuoteWithRelations extends Quote {
  customer?: Customer
  lead?: Lead
  quote_items?: Array<QuoteItem & { inventory?: any; plan?: any }>
  quote_promotions?: Array<{ id: string; promotion?: any; discount_type: string; discount_amount: number }>
}

const statusColors: Record<QuoteStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  accepted: 'bg-green-100 text-green-800',
  declined: 'bg-red-100 text-red-800',
  expired: 'bg-orange-100 text-orange-800',
  converted: 'bg-purple-100 text-purple-800',
}

export default function QuoteDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [quote, setQuote] = useState<QuoteWithRelations | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [showDeclineModal, setShowDeclineModal] = useState(false)
  const [declineReason, setDeclineReason] = useState('')
  const [isItemModalOpen, setIsItemModalOpen] = useState(false)
  const [isSendQuoteModalOpen, setIsSendQuoteModalOpen] = useState(false)

  useEffect(() => {
    if (id) {
      fetchQuote()
    }
  }, [id])

  const fetchQuote = async () => {
    if (!id) return

    setLoading(true)
    setError(null)

    try {
      const result = await getQuote(id)

      if (result.error) throw result.error

      setQuote(result.data as QuoteWithRelations)
    } catch (err: any) {
      setError('Failed to load quote')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleItemModalClose = async (shouldRefresh?: boolean) => {
    setIsItemModalOpen(false)
    if (shouldRefresh && id) {
      // Recalculate totals after adding item
      await recalculateQuoteTotals(id)
      await fetchQuote()
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    if (!id || !window.confirm('Remove this item from the quote?')) return

    try {
      const result = await removeQuoteItem(itemId)
      if (result.error) throw result.error

      // Recalculate totals after removing item
      await recalculateQuoteTotals(id)
      await fetchQuote()
    } catch (err: any) {
      alert('Failed to remove item')
      console.error(err)
    }
  }

  const handleSendQuoteSuccess = async () => {
    // Refresh the quote after sending
    await fetchQuote()
  }

  const handleAcceptQuote = async () => {
    if (!id || !user?.id) return

    setActionLoading(true)
    try {
      const result = await acceptQuote(id, user.id)
      if (result.error) throw result.error

      await fetchQuote()
    } catch (err: any) {
      alert('Failed to accept quote')
      console.error(err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeclineQuote = async () => {
    if (!id) return

    setActionLoading(true)
    try {
      const result = await declineQuote(id, declineReason)
      if (result.error) throw result.error

      setShowDeclineModal(false)
      setDeclineReason('')
      await fetchQuote()
    } catch (err: any) {
      alert('Failed to decline quote')
      console.error(err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleUpdateStatus = async (status: QuoteStatus) => {
    if (!id) return

    setActionLoading(true)
    try {
      const result = await updateQuote(id, { status })
      if (result.error) throw result.error

      await fetchQuote()
    } catch (err: any) {
      alert('Failed to update quote status')
      console.error(err)
    } finally {
      setActionLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading quote...</p>
      </div>
    )
  }

  if (error || !quote) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error || 'Quote not found'}</p>
        </div>
        <button
          onClick={() => navigate('/quotes')}
          className="mt-4 px-4 py-2 text-sm text-primary-600 hover:text-primary-700"
        >
          ← Back to Quotes
        </button>
      </div>
    )
  }

  const isExpired = new Date(quote.expires_at) < new Date() && quote.status === 'sent'

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/quotes')}
          className="mb-4 px-4 py-2 text-sm text-primary-600 hover:text-primary-700 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Quotes
        </button>

        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">Quote {quote.quote_number}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[quote.status]}`}>
                {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
              </span>
              {isExpired && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  Expired
                </span>
              )}
            </div>
            <p className="text-gray-600 mt-1">Created {formatDate(quote.created_at)}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* PDF Download Button */}
            <PDFDownloadLink
              document={<QuotePDF quote={quote} />}
              fileName={`WyaLink-Quote-${quote.quote_number}.pdf`}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              {({ loading: pdfLoading }) => (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  {pdfLoading ? 'Generating PDF...' : 'Download PDF'}
                </>
              )}
            </PDFDownloadLink>

            {quote.status === 'draft' && (
              <button
                onClick={() => setIsSendQuoteModalOpen(true)}
                disabled={actionLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Send to Customer
              </button>
            )}
            {quote.status === 'sent' && (
              <>
                <button
                  onClick={handleAcceptQuote}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  Accept Quote
                </button>
                <button
                  onClick={() => setShowDeclineModal(true)}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  Decline Quote
                </button>
              </>
            )}
            {quote.status === 'accepted' && (
              <button
                onClick={() => navigate(`/quotes/${quote.id}/convert`)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Convert to Order
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer/Lead Information */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
            {quote.customer_id && quote.customer ? (
              <div>
                <p className="text-sm text-gray-600 mb-2">Customer</p>
                <Link
                  to={`/customers/${quote.customer_id}`}
                  className="text-primary-600 hover:text-primary-700 font-semibold"
                >
                  {quote.customer.first_name} {quote.customer.last_name}
                </Link>
                {quote.customer.account_number && (
                  <p className="text-sm text-gray-600 mt-1">Account: {quote.customer.account_number}</p>
                )}
              </div>
            ) : quote.lead_id && quote.lead ? (
              <div>
                <p className="text-sm text-gray-600 mb-2">Lead</p>
                <Link
                  to={`/leads/${quote.lead_id}`}
                  className="text-primary-600 hover:text-primary-700 font-semibold"
                >
                  {quote.lead.first_name || ''} {quote.lead.last_name || quote.lead.email}
                </Link>
                <p className="text-sm text-gray-600 mt-1">{quote.lead.email}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No customer or lead associated</p>
            )}
          </Card>

          {/* Quote Items */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Quote Items</h3>
              {quote.status === 'draft' && (
                <button
                  onClick={() => setIsItemModalOpen(true)}
                  className="px-3 py-1.5 text-sm bg-primary-800 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  + Add Item
                </button>
              )}
            </div>

            {quote.quote_items && quote.quote_items.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Item</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Qty</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Unit Price</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Subtotal</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quote.quote_items.map((item: any) => (
                      <tr key={item.id} className="border-b border-gray-100">
                        <td className="py-4 px-4">
                          <p className="text-sm font-semibold text-gray-900">
                            {item.inventory?.name || item.plan?.plan_name || 'Unknown Item'}
                          </p>
                          {item.inventory && (
                            <p className="text-xs text-gray-500">{item.inventory.category}</p>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            item.item_type === 'inventory'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {item.item_type.charAt(0).toUpperCase() + item.item_type.slice(1)}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right text-sm text-gray-900">{item.quantity}</td>
                        <td className="py-4 px-4 text-right text-sm text-gray-900">
                          {formatPrice(item.unit_price)}
                        </td>
                        <td className="py-4 px-4 text-right text-sm font-semibold text-gray-900">
                          {formatPrice(item.subtotal)}
                        </td>
                        <td className="py-4 px-4 text-center">
                          {quote.status === 'draft' && (
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                              title="Remove item"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-600">No items added yet</div>
            )}
          </Card>

          {/* Promotions */}
          {quote.quote_promotions && quote.quote_promotions.length > 0 && (
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Applied Promotions</h3>
              </div>

              <div className="space-y-3">
                {quote.quote_promotions.map((qp: any) => (
                  <div
                    key={qp.id}
                    className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {qp.promotion?.promotion_name || 'Promotion'}
                        </p>
                        <p className="text-xs text-gray-600">
                          {qp.discount_type === 'percent'
                            ? `${qp.discount_amount}% off`
                            : `$${qp.discount_amount} off`}
                        </p>
                      </div>
                    </div>
                    <button
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove promotion"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Notes & Terms */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes & Terms</h3>

            {quote.notes && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Internal Notes</p>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{quote.notes}</p>
              </div>
            )}

            {quote.terms && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Terms & Conditions</p>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{quote.terms}</p>
              </div>
            )}

            {!quote.notes && !quote.terms && (
              <p className="text-sm text-gray-500">No notes or terms added</p>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing Summary */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing Summary</h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Subtotal</span>
                <span className="text-sm font-semibold text-gray-900">{formatPrice(quote.subtotal)}</span>
              </div>

              {quote.discount_total > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Discounts</span>
                  <span className="text-sm font-semibold text-green-600">
                    -{formatPrice(quote.discount_total)}
                  </span>
                </div>
              )}

              {quote.tax_total > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tax</span>
                  <span className="text-sm font-semibold text-gray-900">{formatPrice(quote.tax_total)}</span>
                </div>
              )}

              <div className="pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-primary-600">{formatPrice(quote.total)}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Quote Details */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quote Details</h3>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">Quote Number</p>
                <p className="text-sm font-mono font-semibold text-gray-900">{quote.quote_number}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Created Date</p>
                <p className="text-sm text-gray-900">{formatDate(quote.created_at)}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Expires</p>
                <p className={`text-sm font-medium ${isExpired ? 'text-red-600' : 'text-gray-900'}`}>
                  {formatDate(quote.expires_at)}
                  {isExpired && ' (Expired)'}
                </p>
              </div>

              {quote.accepted_at && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Accepted Date</p>
                  <p className="text-sm text-gray-900">{formatDate(quote.accepted_at)}</p>
                </div>
              )}

              {quote.declined_at && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Declined Date</p>
                  <p className="text-sm text-gray-900">{formatDate(quote.declined_at)}</p>
                </div>
              )}

              {quote.declined_reason && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Decline Reason</p>
                  <p className="text-sm text-gray-900">{quote.declined_reason}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Status Management (Admin Only) */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Management</h3>

            <div className="space-y-2">
              <button
                onClick={() => handleUpdateStatus('draft')}
                disabled={actionLoading || quote.status === 'draft'}
                className="w-full px-4 py-2 text-sm text-left bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Mark as Draft
              </button>
              <button
                onClick={() => handleUpdateStatus('sent')}
                disabled={actionLoading || quote.status === 'sent'}
                className="w-full px-4 py-2 text-sm text-left bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Mark as Sent
              </button>
              <button
                onClick={() => handleUpdateStatus('accepted')}
                disabled={actionLoading || quote.status === 'accepted'}
                className="w-full px-4 py-2 text-sm text-left bg-green-100 hover:bg-green-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Mark as Accepted
              </button>
              <button
                onClick={() => setShowDeclineModal(true)}
                disabled={actionLoading || quote.status === 'declined'}
                className="w-full px-4 py-2 text-sm text-left bg-red-100 hover:bg-red-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Mark as Declined
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* Quote Item Modal */}
      {id && (
        <QuoteItemModal isOpen={isItemModalOpen} onClose={handleItemModalClose} quoteId={id} />
      )}

      {/* Send Quote Modal */}
      {quote && (
        <SendQuoteModal
          isOpen={isSendQuoteModalOpen}
          onClose={() => setIsSendQuoteModalOpen(false)}
          quote={quote}
          onSuccess={handleSendQuoteSuccess}
        />
      )}

      {/* Decline Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Decline Quote</h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Declining (Optional)
                </label>
                <textarea
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter the reason for declining this quote..."
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setShowDeclineModal(false)
                    setDeclineReason('')
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeclineQuote}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  Decline Quote
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
