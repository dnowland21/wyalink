import { useState } from 'react'
import { logEmail } from '@wyalink/supabase-client'

interface EmailFormProps {
  leadId: string
  leadEmail: string
  onSuccess: () => void
}

export default function EmailForm({ leadId, leadEmail, onSuccess }: EmailFormProps) {
  const [to, setTo] = useState(leadEmail)
  const [cc, setCc] = useState('')
  const [bcc, setBcc] = useState('')
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Send email via Express API service
      const emailApiUrl = import.meta.env.VITE_EMAIL_API_URL || 'http://localhost:3001'
      const response = await fetch(`${emailApiUrl}/api/email/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to,
          cc: cc || undefined,
          bcc: bcc || undefined,
          subject,
          content,
          leadId,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to send email')
      }

      // If email was sent successfully, log it to the database
      const { error: logError } = await logEmail({
        lead_id: leadId,
        subject,
        content,
        email_to: to,
        email_cc: cc || undefined,
        email_bcc: bcc || undefined,
        email_sent: true,
        email_sent_at: new Date().toISOString(),
      })

      if (logError) {
        console.error('Failed to log email activity:', logError)
        // Don't fail the whole operation if logging fails
      }

      // Clear form and notify success
      setSubject('')
      setContent('')
      setCc('')
      setBcc('')
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Failed to send email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-800">
          Email will be sent via Office 365 and logged in the activity timeline.
        </p>
      </div>

      <div>
        <label htmlFor="to" className="block text-sm font-medium text-gray-700 mb-2">
          To *
        </label>
        <input
          id="to"
          type="email"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="cc" className="block text-sm font-medium text-gray-700 mb-2">
            CC
          </label>
          <input
            id="cc"
            type="email"
            value={cc}
            onChange={(e) => setCc(e.target.value)}
            placeholder="Optional"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label htmlFor="bcc" className="block text-sm font-medium text-gray-700 mb-2">
            BCC
          </label>
          <input
            id="bcc"
            type="email"
            value={bcc}
            onChange={(e) => setBcc(e.target.value)}
            placeholder="Optional"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
          Subject *
        </label>
        <input
          id="subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
          placeholder="Email subject"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
          Message *
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={8}
          placeholder="Write your email message..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-3 bg-primary-800 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {loading ? 'Sending Email...' : 'Send Email'}
      </button>
    </form>
  )
}
