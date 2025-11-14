import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getLead, updateLead, type Lead, type LeadStatus } from '@wyalink/supabase-client'
import { Card } from '@wyalink/ui'
import CallLogForm from '../components/CallLogForm'
import EmailForm from '../components/EmailForm'
import NoteForm from '../components/NoteForm'
import ActivityTimeline from '../components/ActivityTimeline'
import QuotesList from '../components/QuotesList'

const statusColors: Record<LeadStatus, string> = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-yellow-100 text-yellow-800',
  qualified: 'bg-purple-100 text-purple-800',
  converted: 'bg-green-100 text-green-800',
  lost: 'bg-gray-100 text-gray-800',
}

type ActivityTab = 'timeline' | 'call' | 'email' | 'note' | 'quotes'

export default function LeadProfile() {
  const { id } = useParams<{ id: string }>()

  const [lead, setLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<ActivityTab>('timeline')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (!id) return

    const fetchLead = async () => {
      setLoading(true)
      const { data, error } = await getLead(id)

      if (error) {
        setError('Failed to load lead')
        console.error(error)
      } else {
        setLead(data)
      }

      setLoading(false)
    }

    fetchLead()
  }, [id])

  const handleStatusChange = async (newStatus: LeadStatus) => {
    if (!lead) return

    const { error } = await updateLead(lead.id, { status: newStatus })

    if (error) {
      setError('Failed to update status')
    } else {
      setLead({ ...lead, status: newStatus })
      setRefreshKey((prev) => prev + 1) // Refresh timeline
    }
  }

  const handleActivityLogged = () => {
    setActiveTab('timeline')
    setRefreshKey((prev) => prev + 1)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lead...</p>
        </div>
      </div>
    )
  }

  if (error || !lead) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error || 'Lead not found'}</p>
        </div>
        <Link to="/leads" className="text-primary-600 hover:text-primary-700 mt-4 inline-block">
          ← Back to Leads
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Header with breadcrumb */}
      <div className="mb-6">
        <Link to="/leads" className="text-sm text-gray-600 hover:text-primary-600 flex items-center gap-1 mb-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Leads
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Lead Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Lead Details */}
        <div className="lg:col-span-1">
          <Card>
            <div className="flex items-start justify-between mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-white font-semibold text-xl">
                {lead.first_name?.[0] || lead.last_name?.[0] || lead.email[0].toUpperCase()}
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[lead.status]}`}>
                {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
              </span>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {lead.first_name || lead.last_name
                ? `${lead.first_name || ''} ${lead.last_name || ''}`.trim()
                : 'No Name'}
            </h2>
            {lead.company && <p className="text-sm text-gray-600 mb-4">{lead.company}</p>}

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-gray-900">{lead.email}</span>
              </div>

              {lead.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <span className="text-gray-900">{lead.phone}</span>
                </div>
              )}

              {lead.source && (
                <div className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  <span className="text-gray-600">Source: {lead.source}</span>
                </div>
              )}
            </div>

            {lead.notes && (
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Notes</h3>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{lead.notes}</p>
              </div>
            )}

            {/* Quick Status Change */}
            <div className="border-t pt-4 mt-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Change Status</h3>
              <div className="grid grid-cols-2 gap-2">
                {(['new', 'contacted', 'qualified', 'converted', 'lost'] as LeadStatus[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    disabled={lead.status === status}
                    className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                      lead.status === status
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Activities */}
        <div className="lg:col-span-2">
          <Card>
            {/* Activity Tabs */}
            <div className="flex gap-2 mb-6 border-b pb-4">
              <button
                onClick={() => setActiveTab('timeline')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'timeline'
                    ? 'bg-primary-800 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Timeline
              </button>
              <button
                onClick={() => setActiveTab('call')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'call'
                    ? 'bg-primary-800 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Log Call
              </button>
              <button
                onClick={() => setActiveTab('email')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'email'
                    ? 'bg-primary-800 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Send Email
              </button>
              <button
                onClick={() => setActiveTab('note')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'note'
                    ? 'bg-primary-800 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Add Note
              </button>
              <button
                onClick={() => setActiveTab('quotes')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'quotes'
                    ? 'bg-primary-800 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Quotes
              </button>
            </div>

            {/* Activity Content */}
            {activeTab === 'timeline' && <ActivityTimeline leadId={lead.id} refreshKey={refreshKey} />}
            {activeTab === 'call' && <CallLogForm leadId={lead.id} onSuccess={handleActivityLogged} />}
            {activeTab === 'email' && <EmailForm leadId={lead.id} leadEmail={lead.email} onSuccess={handleActivityLogged} />}
            {activeTab === 'note' && <NoteForm leadId={lead.id} onSuccess={handleActivityLogged} />}
            {activeTab === 'quotes' && <QuotesList leadId={lead.id} />}
          </Card>
        </div>
      </div>
    </div>
  )
}
