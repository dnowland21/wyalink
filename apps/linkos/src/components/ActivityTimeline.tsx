import { useState, useEffect } from 'react'
import { getLeadActivities, type LeadActivity, type ActivityType } from '@wyalink/supabase-client'

interface ActivityTimelineProps {
  leadId: string
  refreshKey?: number
}

const activityIcons: Record<ActivityType, JSX.Element> = {
  call: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
    />
  ),
  email: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  ),
  note: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
    />
  ),
  status_change: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  ),
  assignment: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
    />
  ),
}

const activityColors: Record<ActivityType, string> = {
  call: 'bg-blue-100 text-blue-600',
  email: 'bg-purple-100 text-purple-600',
  note: 'bg-yellow-100 text-yellow-600',
  status_change: 'bg-green-100 text-green-600',
  assignment: 'bg-gray-100 text-gray-600',
}

export default function ActivityTimeline({ leadId, refreshKey = 0 }: ActivityTimelineProps) {
  const [activities, setActivities] = useState<LeadActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true)
      setError(null)

      const { data, error: apiError } = await getLeadActivities(leadId)

      if (apiError) {
        setError('Failed to load activities')
        console.error(apiError)
      } else {
        setActivities(data || [])
      }

      setLoading(false)
    }

    fetchActivities()
  }, [leadId, refreshKey])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    } else if (diffInHours < 48) {
      return 'Yesterday at ' + date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      })
    }
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    if (minutes === 0) return `${remainingSeconds}s`
    if (remainingSeconds === 0) return `${minutes}m`
    return `${minutes}m ${remainingSeconds}s`
  }

  const getUserName = (activity: LeadActivity) => {
    if (activity.user_first_name || activity.user_last_name) {
      return `${activity.user_first_name || ''} ${activity.user_last_name || ''}`.trim()
    }
    return activity.user_email || 'Unknown User'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading activities...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-sm text-red-800">{error}</p>
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <svg
          className="w-16 h-16 text-gray-300 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-gray-600 text-sm">No activity yet</p>
        <p className="text-gray-500 text-xs mt-1">Log a call, send an email, or add a note to get started</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div key={activity.id} className="relative">
          {/* Timeline line */}
          {index !== activities.length - 1 && (
            <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-gray-200"></div>
          )}

          {/* Activity card */}
          <div className="flex gap-3">
            {/* Icon */}
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                activityColors[activity.type]
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {activityIcons[activity.type]}
              </svg>
            </div>

            {/* Content */}
            <div className="flex-1 bg-gray-50 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">
                    {activity.subject || activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    by {getUserName(activity)} • {formatDate(activity.created_at)}
                  </p>
                </div>

                {/* Call metadata */}
                {activity.type === 'call' && (
                  <div className="flex flex-col items-end gap-1">
                    {activity.call_duration && (
                      <span className="text-xs text-gray-600">{formatDuration(activity.call_duration)}</span>
                    )}
                    {activity.call_outcome && (
                      <span className="text-xs px-2 py-1 bg-white rounded border border-gray-200 text-gray-700">
                        {activity.call_outcome.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                )}

                {/* Email metadata */}
                {activity.type === 'email' && activity.email_to && (
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs text-gray-600">To: {activity.email_to}</span>
                    {activity.email_sent && (
                      <span className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded">Sent</span>
                    )}
                  </div>
                )}
              </div>

              {activity.content && (
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{activity.content}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
