import { useState } from 'react'
import { pdf } from '@react-pdf/renderer'
import QuotePDF from './QuotePDF'
import type { Quote, Customer, Lead, QuoteItem } from '@wyalink/supabase-client'

interface SendQuoteModalProps {
  isOpen: boolean
  onClose: () => void
  quote: Quote & {
    customer?: Customer
    lead?: Lead
    quote_items?: QuoteItem[]
  }
  onSuccess?: () => void
}

export default function SendQuoteModal({ isOpen, onClose, quote, onSuccess }: SendQuoteModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recipientEmail, setRecipientEmail] = useState(
    quote.customer?.email || quote.lead?.email || ''
  )
  const [subject, setSubject] = useState(`Your Quote from WyaLink - #${quote.quote_number}`)
  const [message, setMessage] = useState(
    `Hello ${quote.customer ? `${quote.customer.first_name}` : quote.lead?.first_name || ''},

Thank you for your interest in WyaLink's wireless services!

Please find attached your personalized quote (#${quote.quote_number}). This quote is valid until ${new Date(quote.expires_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.

Quote Summary:
" Total: $${quote.total.toFixed(2)}
${quote.discount_total > 0 ? `" Discount Applied: -$${quote.discount_total.toFixed(2)}\n` : ''}
If you have any questions or would like to proceed with this quote, please don't hesitate to contact us.

Best regards,
The WyaLink Team

---
WyaLink - Your Wireless Provider
Email: support@wyalink.com
Website: www.wyalink.com`
  )
  const [includePDF, setIncludePDF] = useState(true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      let pdfBase64 = ''

      if (includePDF) {
        // Generate PDF as blob
        const blob = await pdf(<QuotePDF quote={quote} />).toBlob()

        // Convert blob to base64
        const reader = new FileReader()
        pdfBase64 = await new Promise<string>((resolve, reject) => {
          reader.onloadend = () => {
            const base64 = reader.result as string
            // Remove the data URL prefix
            const base64String = base64.split(',')[1]
            resolve(base64String)
          }
          reader.onerror = reject
          reader.readAsDataURL(blob)
        })
      }

      // Check if email service is configured
      // This is a placeholder - you need to set up the email service first
      // See QUOTE_EMAIL_SETUP.md for instructions

      throw new Error(
        'Email service not yet configured. Please follow the setup instructions in QUOTE_EMAIL_SETUP.md to enable email functionality. ' +
        'For now, you can download the PDF and send it manually via your email client.'
      )

      /* Uncomment this code after setting up the email service:

      // Call the email API endpoint (Supabase Edge Function)
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

      const response = await fetch(
        `${supabaseUrl}/functions/v1/send-quote-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({
            to: recipientEmail,
            subject,
            message,
            quoteNumber: quote.quote_number,
            includePDF,
            pdfBase64,
            pdfFileName: `WyaLink-Quote-${quote.quote_number}.pdf`,
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
        throw new Error(errorData.message || 'Failed to send email')
      }

      // Update quote status to 'sent' using Supabase client
      const { updateQuote } = await import('@wyalink/supabase-client')
      const updateResult = await updateQuote(quote.id, {
        status: 'sent',
        sent_at: new Date().toISOString(),
      })

      if (updateResult.error) {
        console.error('Failed to update quote status:', updateResult.error)
      }

      onSuccess?.()
      onClose()
      */
    } catch (err: any) {
      setError(err.message || 'Failed to send email')
      console.error('Error sending quote email:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const customerName =
    quote.customer
      ? `${quote.customer.first_name} ${quote.customer.last_name}`
      : quote.lead
      ? `${quote.lead.first_name || ''} ${quote.lead.last_name || ''}`.trim() || 'Lead'
      : 'Customer'

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Send Quote via Email</h2>
              <p className="text-sm text-gray-600 mt-1">
                Quote #{quote.quote_number} to {customerName}
              </p>
            </div>
            <button
              onClick={onClose}
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
            {/* Recipient Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipient Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="customer@example.com"
              />
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Message <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                This message will be sent to the customer along with the quote details.
              </p>
            </div>

            {/* Include PDF Option */}
            <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <input
                type="checkbox"
                id="includePDF"
                checked={includePDF}
                onChange={(e) => setIncludePDF(e.target.checked)}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="includePDF" className="flex-1 cursor-pointer">
                <span className="text-sm font-medium text-gray-900">Attach PDF Quote</span>
                <p className="text-xs text-gray-600 mt-0.5">
                  Include a professionally formatted PDF version of the quote as an attachment
                </p>
              </label>
            </div>

            {/* Info Box */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-900">What happens when you send?</p>
                  <ul className="text-xs text-gray-600 mt-1 space-y-1 list-disc list-inside">
                    <li>Quote will be marked as "Sent"</li>
                    <li>Customer will receive a branded email with quote details</li>
                    {includePDF && <li>PDF attachment will be included</li>}
                    <li>You'll be able to track when the customer views or accepts the quote</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary-800 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  Send Quote
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
