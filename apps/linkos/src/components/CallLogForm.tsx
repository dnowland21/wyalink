import { useState } from 'react'
import { logCall, type CallOutcome } from '@wyalink/supabase-client'

interface CallLogFormProps {
  leadId: string
  onSuccess: () => void
}

export default function CallLogForm({ leadId, onSuccess }: CallLogFormProps) {
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [duration, setDuration] = useState('')
  const [outcome, setOutcome] = useState<CallOutcome>('connected')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error: apiError } = await logCall({
      lead_id: leadId,
      subject: subject || undefined,
      content: content || undefined,
      call_duration: duration ? parseInt(duration) * 60 : undefined, // Convert minutes to seconds
      call_outcome: outcome,
    })

    setLoading(false)

    if (apiError) {
      setError(apiError.message)
    } else {
      setSubject('')
      setContent('')
      setDuration('')
      setOutcome('connected')
      onSuccess()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="outcome" className="block text-sm font-medium text-gray-700 mb-2">
            Call Outcome *
          </label>
          <select
            id="outcome"
            value={outcome}
            onChange={(e) => setOutcome(e.target.value as CallOutcome)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          >
            <option value="connected">Connected</option>
            <option value="voicemail">Voicemail</option>
            <option value="no_answer">No Answer</option>
            <option value="busy">Busy</option>
            <option value="wrong_number">Wrong Number</option>
          </select>
        </div>

        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
            Duration (minutes)
          </label>
          <input
            id="duration"
            type="number"
            min="0"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="e.g., 15"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
          Subject
        </label>
        <input
          id="subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g., Follow-up call about pricing"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
          Notes
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          placeholder="Add notes about the call..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {loading ? 'Logging Call...' : 'Log Call'}
      </button>
    </form>
  )
}
