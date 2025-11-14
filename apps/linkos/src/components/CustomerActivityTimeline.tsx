import { useState, useEffect } from 'react'
import { getCustomerActivities, type CustomerActivity } from '@wyalink/supabase-client'

interface CustomerActivityTimelineProps {
  customerId: string
}

const activityIcons: Record<string, JSX.Element> = {
  store_visit: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
      />
    </svg>
  ),
  note: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
      />
    </svg>
  ),
  quote: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  ),
  subscription: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  ),
  line_activation: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
      />
    </svg>
  ),
}

const activityColors: Record<string, string> = {
  store_visit: 'bg-blue-100 text-blue-600',
  note: 'bg-gray-100 text-gray-600',
  quote: 'bg-purple-100 text-purple-600',
  subscription: 'bg-green-100 text-green-600',
  line_activation: 'bg-teal-100 text-teal-600',
}

const statusColors: Record<string, string> = {
  waiting: 'bg-yellow-100 text-yellow-800',
  being_assisted: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  removed: 'bg-red-100 text-red-800',
}

export default function CustomerActivityTimeline({ customerId }: CustomerActivityTimelineProps) {
  const [activities, setActivities] = useState<CustomerActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchActivities()
  }, [customerId])

  const fetchActivities = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await getCustomerActivities(customerId)

      if (result.error) throw result.error

      setActivities(result.data || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load activities')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return (
        'Today at ' +
        date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        })
      )
    } else if (diffDays === 1) {
      return (
        'Yesterday at ' +
        date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        })
      )
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading activities...</p>
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

  if (activities.length === 0) {
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
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <p className="text-gray-600 font-medium">No activities yet</p>
        <p className="text-gray-500 text-sm mt-1">Activity history will appear here</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

        {/* Activities */}
        <div className="space-y-6">
          {activities.map((activity, index) => {
            const isLast = index === activities.length - 1

            return (
              <div key={activity.id} className="relative flex gap-4">
                {/* Icon */}
                <div
                  className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                    activityColors[activity.type] || 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {activityIcons[activity.type] || activityIcons.note}
                </div>

                {/* Content */}
                <div className={`flex-1 ${!isLast ? 'pb-6' : ''}`}>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{activity.title}</h4>
                        {activity.user_name && (
                          <p className="text-sm text-gray-600 mt-0.5">by {activity.user_name}</p>
                        )}
                      </div>
                      <time className="text-sm text-gray-500">{formatDate(activity.timestamp)}</time>
                    </div>

                    {activity.description && (
                      <p className="text-gray-700 text-sm mb-2">{activity.description}</p>
                    )}

                    {/* Store Visit specific details */}
                    {activity.type === 'store_visit' && activity.metadata && (
                      <div className="mt-3 flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            statusColors[activity.metadata.status as string] || 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {activity.metadata.status === 'being_assisted'
                            ? 'Assisted'
                            : activity.metadata.status === 'completed'
                            ? 'Completed'
                            : activity.metadata.status === 'waiting'
                            ? 'Waiting'
                            : activity.metadata.status === 'removed'
                            ? 'Removed'
                            : activity.metadata.status}
                        </span>
                        {activity.metadata.completed_at && activity.metadata.assistance_started_at && (
                          <span className="text-xs text-gray-500">
                            Duration:{' '}
                            {Math.round(
                              (new Date(activity.metadata.completed_at).getTime() -
                                new Date(activity.metadata.assistance_started_at).getTime()) /
                                (1000 * 60)
                            )}{' '}
                            min
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
