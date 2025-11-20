import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getQuote, updateQuote, acceptQuote, declineQuote, removeQuoteItem, recalculateQuoteTotals, type Quote, type QuoteStatus, type QuoteItem, type Customer, type Lead } from '@wyalink/supabase-client'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { useAuth } from '@wyalink/supabase-client'
import QuoteItemModal from '../components/QuoteItemModal'
import { PDFDownloadLink } from '@react-pdf/renderer'
import QuotePDF from '../components/QuotePDF'
import SendQuoteModal from '../components/SendQuoteModal'
import { ChevronLeft, Download, Mail, Check, X, Plus, Trash2, Tag } from 'lucide-react'

// Extended Quote type with relations
interface QuoteWithRelations extends Quote {
  customer?: Customer
  lead?: Lead
  quote_items?: Array<QuoteItem & { inventory?: any; plan?: any }>
  quote_promotions?: Array<{ id: string; promotion?: any; discount_type: string; discount_amount: number }>
}

const statusVariants: Record<QuoteStatus, 'default' | 'info' | 'success' | 'error' | 'warning' | 'secondary'> = {
  draft: 'default',
  sent: 'info',
  accepted: 'success',
  declined: 'error',
  expired: 'warning',
  converted: 'secondary',
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
        <p className="text-muted-foreground">Loading quote...</p>
      </div>
    )
  }

  if (error || !quote) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error || 'Quote not found'}</p>
        </div>
        <Button
          onClick={() => navigate('/quotes')}
          variant="ghost"
          className="mt-4"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Quotes
        </Button>
      </div>
    )
  }

  const isExpired = new Date(quote.expires_at) < new Date() && quote.status === 'sent'

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Button
          onClick={() => navigate('/quotes')}
          variant="ghost"
          className="mb-4"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Quotes
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">Quote {quote.quote_number}</h1>
              <Badge variant={statusVariants[quote.status]}>
                {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
              </Badge>
              {isExpired && (
                <Badge variant="error">
                  Expired
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1">Created {formatDate(quote.created_at)}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* PDF Download Button */}
            <PDFDownloadLink
              document={<QuotePDF quote={quote} />}
              fileName={`WyaLink-Quote-${quote.quote_number}.pdf`}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2"
            >
              {({ loading: pdfLoading }) => (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  {pdfLoading ? 'Generating PDF...' : 'Download PDF'}
                </>
              )}
            </PDFDownloadLink>

            {quote.status === 'draft' && (
              <Button
                onClick={() => setIsSendQuoteModalOpen(true)}
                disabled={actionLoading}
              >
                <Mail className="w-4 h-4 mr-2" />
                Send to Customer
              </Button>
            )}
            {quote.status === 'sent' && (
              <>
                <Button
                  onClick={handleAcceptQuote}
                  disabled={actionLoading}
                  variant="default"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Accept Quote
                </Button>
                <Button
                  onClick={() => setShowDeclineModal(true)}
                  disabled={actionLoading}
                  variant="default"
                  className="bg-red-600 hover:bg-red-700"
                >
                  <X className="w-4 h-4 mr-2" />
                  Decline Quote
                </Button>
              </>
            )}
            {quote.status === 'accepted' && (
              <Button
                onClick={() => navigate(`/quotes/${quote.id}/convert`)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Convert to Order
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer/Lead Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              {quote.customer_id && quote.customer ? (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Customer</p>
                  <Link
                    to={`/customers/${quote.customer_id}`}
                    className="text-primary-600 hover:text-primary-700 font-semibold"
                  >
                    {quote.customer.first_name} {quote.customer.last_name}
                  </Link>
                  {quote.customer.account_number && (
                    <p className="text-sm text-muted-foreground mt-1">Account: {quote.customer.account_number}</p>
                  )}
                </div>
              ) : quote.lead_id && quote.lead ? (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Lead</p>
                  <Link
                    to={`/leads/${quote.lead_id}`}
                    className="text-primary-600 hover:text-primary-700 font-semibold"
                  >
                    {quote.lead.first_name || ''} {quote.lead.last_name || quote.lead.email}
                  </Link>
                  <p className="text-sm text-muted-foreground mt-1">{quote.lead.email}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No customer or lead associated</p>
              )}
            </CardContent>
          </Card>

          {/* Quote Items */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Quote Items</CardTitle>
                {quote.status === 'draft' && (
                  <Button
                    onClick={() => setIsItemModalOpen(true)}
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
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
                              <p className="text-xs text-muted-foreground">{item.inventory.category}</p>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <Badge variant={item.item_type === 'inventory' ? 'info' : 'success'}>
                              {item.item_type.charAt(0).toUpperCase() + item.item_type.slice(1)}
                            </Badge>
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
                              <Button
                                onClick={() => handleRemoveItem(item.id)}
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                title="Remove item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">No items added yet</div>
              )}
            </CardContent>
          </Card>

          {/* Promotions */}
          {quote.quote_promotions && quote.quote_promotions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Applied Promotions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {quote.quote_promotions.map((qp: any) => (
                    <div
                      key={qp.id}
                      className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Tag className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {qp.promotion?.promotion_name || 'Promotion'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {qp.discount_type === 'percent'
                              ? `${qp.discount_amount}% off`
                              : `$${qp.discount_amount} off`}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-red-600 hover:bg-red-50"
                        title="Remove promotion"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes & Terms */}
          <Card>
            <CardHeader>
              <CardTitle>Notes & Terms</CardTitle>
            </CardHeader>
            <CardContent>
              {quote.notes && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Internal Notes</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{quote.notes}</p>
                </div>
              )}

              {quote.terms && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Terms & Conditions</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{quote.terms}</p>
                </div>
              )}

              {!quote.notes && !quote.terms && (
                <p className="text-sm text-muted-foreground">No notes or terms added</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Subtotal</span>
                  <span className="text-sm font-semibold text-gray-900">{formatPrice(quote.subtotal)}</span>
                </div>

                {quote.discount_total > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Discounts</span>
                    <span className="text-sm font-semibold text-green-600">
                      -{formatPrice(quote.discount_total)}
                    </span>
                  </div>
                )}

                {quote.tax_total > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Tax</span>
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
            </CardContent>
          </Card>

          {/* Quote Details */}
          <Card>
            <CardHeader>
              <CardTitle>Quote Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Quote Number</p>
                  <p className="text-sm font-mono font-semibold text-gray-900">{quote.quote_number}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Created Date</p>
                  <p className="text-sm text-gray-900">{formatDate(quote.created_at)}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Expires</p>
                  <p className={`text-sm font-medium ${isExpired ? 'text-red-600' : 'text-gray-900'}`}>
                    {formatDate(quote.expires_at)}
                    {isExpired && ' (Expired)'}
                  </p>
                </div>

                {quote.accepted_at && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Accepted Date</p>
                    <p className="text-sm text-gray-900">{formatDate(quote.accepted_at)}</p>
                  </div>
                )}

                {quote.declined_at && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Declined Date</p>
                    <p className="text-sm text-gray-900">{formatDate(quote.declined_at)}</p>
                  </div>
                )}

                {quote.declined_reason && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Decline Reason</p>
                    <p className="text-sm text-gray-900">{quote.declined_reason}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Status Management (Admin Only) */}
          <Card>
            <CardHeader>
              <CardTitle>Status Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button
                  onClick={() => handleUpdateStatus('draft')}
                  disabled={actionLoading || quote.status === 'draft'}
                  variant="outline"
                  className="w-full justify-start"
                >
                  Mark as Draft
                </Button>
                <Button
                  onClick={() => handleUpdateStatus('sent')}
                  disabled={actionLoading || quote.status === 'sent'}
                  variant="outline"
                  className="w-full justify-start"
                >
                  Mark as Sent
                </Button>
                <Button
                  onClick={() => handleUpdateStatus('accepted')}
                  disabled={actionLoading || quote.status === 'accepted'}
                  variant="outline"
                  className="w-full justify-start"
                >
                  Mark as Accepted
                </Button>
                <Button
                  onClick={() => setShowDeclineModal(true)}
                  disabled={actionLoading || quote.status === 'declined'}
                  variant="outline"
                  className="w-full justify-start"
                >
                  Mark as Declined
                </Button>
              </div>
            </CardContent>
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
                <Button
                  onClick={() => {
                    setShowDeclineModal(false)
                    setDeclineReason('')
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeclineQuote}
                  disabled={actionLoading}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  Decline Quote
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
