import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getQuotes, type Quote, type QuoteStatus } from '@wyalink/supabase-client'

interface QuotesListProps {
  customerId?: string
  leadId?: string
}

const statusColors: Record<QuoteStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  accepted: 'bg-green-100 text-green-800',
  declined: 'bg-red-100 text-red-800',
  expired: 'bg-orange-100 text-orange-800',
  converted: 'bg-purple-100 text-purple-800',
}

export default function QuotesList({ customerId, leadId }: QuotesListProps) {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchQuotes()
  }, [customerId, leadId])

  const fetchQuotes = async () => {
    setLoading(true)
    setError(null)

    try {
      const filters: any = {}
      if (customerId) filters.customer_id = customerId
      if (leadId) filters.lead_id = leadId

      const result = await getQuotes(filters)

      if (result.error) throw result.error

      setQuotes(result.data || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load quotes')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading quotes...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800">{error}</p>
      </div>
    )
  }

  if (quotes.length === 0) {
    return (
      <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-12 text-center">
        <svg
          className="w-12 h-12 text-gray-400 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="text-gray-600 font-medium">No quotes yet</p>
        <p className="text-gray-500 text-sm mt-1">Create a quote to get started</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {quotes.map((quote) => (
        <Link
          key={quote.id}
          to={`/quotes/${quote.id}`}
          className="block bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-primary-200 transition-all"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h4 className="font-semibold text-gray-900">Quote #{quote.quote_number}</h4>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[quote.status]}`}>
                  {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                </span>
              </div>
              <p className="text-sm text-gray-600">Created {formatDate(quote.created_at)}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(quote.total)}</p>
              {quote.discount_total > 0 && (
                <p className="text-xs text-green-600">-{formatCurrency(quote.discount_total)} discount</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>
              <span className="text-gray-600">Subtotal:</span>{' '}
              <span className="text-gray-900 font-medium">{formatCurrency(quote.subtotal)}</span>
            </div>
            {quote.tax_total > 0 && (
              <div>
                <span className="text-gray-600">Tax:</span>{' '}
                <span className="text-gray-900 font-medium">{formatCurrency(quote.tax_total)}</span>
              </div>
            )}
            <div>
              <span className="text-gray-600">Expires:</span>{' '}
              <span className="text-gray-900 font-medium">{formatDate(quote.expires_at)}</span>
            </div>
            {quote.accepted_at && (
              <div>
                <span className="text-gray-600">Accepted:</span>{' '}
                <span className="text-gray-900 font-medium">{formatDate(quote.accepted_at)}</span>
              </div>
            )}
          </div>

          {quote.notes && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-sm text-gray-600 line-clamp-2">{quote.notes}</p>
            </div>
          )}
        </Link>
      ))}
    </div>
  )
}
