import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getLead, updateLead, type Lead, type LeadStatus } from '@wyalink/supabase-client'
import { Card, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { ChevronLeft, Mail, Phone, Zap, Loader2, AlertCircle } from 'lucide-react'
import CallLogForm from '../components/CallLogForm'
import EmailForm from '../components/EmailForm'
import NoteForm from '../components/NoteForm'
import ActivityTimeline from '../components/ActivityTimeline'
import QuotesList from '../components/QuotesList'

const statusVariants: Record<LeadStatus, 'info' | 'warning' | 'secondary' | 'success' | 'default'> = {
  new: 'info',
  contacted: 'warning',
  qualified: 'secondary',
  converted: 'success',
  lost: 'default',
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
          <Loader2 className="w-16 h-16 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading lead...</p>
        </div>
      </div>
    )
  }

  if (error || !lead) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="flex items-start gap-3 p-6">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-destructive font-medium">{error || 'Lead not found'}</p>
            </div>
          </CardContent>
        </Card>
        <Link to="/leads" className="text-primary-600 hover:text-primary-700 mt-4 inline-flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" />
          Back to Leads
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Header with breadcrumb */}
      <div className="mb-6">
        <Link to="/leads" className="text-sm text-muted-foreground hover:text-primary-600 inline-flex items-center gap-1 mb-2">
          <ChevronLeft className="w-4 h-4" />
          Back to Leads
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Lead Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Lead Details */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-white font-semibold text-xl">
                  {lead.first_name?.[0] || lead.last_name?.[0] || lead.email[0].toUpperCase()}
                </div>
                <Badge variant={statusVariants[lead.status]}>
                  {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                </Badge>
              </div>

              <h2 className="text-xl font-bold text-gray-900 mb-1">
                {lead.first_name || lead.last_name
                  ? `${lead.first_name || ''} ${lead.last_name || ''}`.trim()
                  : 'No Name'}
              </h2>
              {lead.company && <p className="text-sm text-muted-foreground mb-4">{lead.company}</p>}

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-gray-900">{lead.email}</span>
                </div>

                {lead.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-gray-900">{lead.phone}</span>
                  </div>
                )}

                {lead.source && (
                  <div className="flex items-center gap-2 text-sm">
                    <Zap className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Source: {lead.source}</span>
                  </div>
                )}
              </div>

              {lead.notes && (
                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Notes</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{lead.notes}</p>
                </div>
              )}

              {/* Quick Status Change */}
              <div className="border-t pt-4 mt-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Change Status</h3>
                <div className="grid grid-cols-2 gap-2">
                  {(['new', 'contacted', 'qualified', 'converted', 'lost'] as LeadStatus[]).map((status) => (
                    <Button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      disabled={lead.status === status}
                      variant={lead.status === status ? 'ghost' : 'outline'}
                      size="sm"
                      className="text-xs"
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Activities */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="pt-6">
              {/* Activity Tabs */}
              <div className="flex gap-2 mb-6 border-b pb-4">
                <Button
                  onClick={() => setActiveTab('timeline')}
                  variant={activeTab === 'timeline' ? 'default' : 'ghost'}
                  size="sm"
                >
                  Timeline
                </Button>
                <Button
                  onClick={() => setActiveTab('call')}
                  variant={activeTab === 'call' ? 'default' : 'ghost'}
                  size="sm"
                >
                  Log Call
                </Button>
                <Button
                  onClick={() => setActiveTab('email')}
                  variant={activeTab === 'email' ? 'default' : 'ghost'}
                  size="sm"
                >
                  Send Email
                </Button>
                <Button
                  onClick={() => setActiveTab('note')}
                  variant={activeTab === 'note' ? 'default' : 'ghost'}
                  size="sm"
                >
                  Add Note
                </Button>
                <Button
                  onClick={() => setActiveTab('quotes')}
                  variant={activeTab === 'quotes' ? 'default' : 'ghost'}
                  size="sm"
                >
                  Quotes
                </Button>
              </div>

              {/* Activity Content */}
              {activeTab === 'timeline' && <ActivityTimeline leadId={lead.id} refreshKey={refreshKey} />}
              {activeTab === 'call' && <CallLogForm leadId={lead.id} onSuccess={handleActivityLogged} />}
              {activeTab === 'email' && <EmailForm leadId={lead.id} leadEmail={lead.email} onSuccess={handleActivityLogged} />}
              {activeTab === 'note' && <NoteForm leadId={lead.id} onSuccess={handleActivityLogged} />}
              {activeTab === 'quotes' && <QuotesList leadId={lead.id} />}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
