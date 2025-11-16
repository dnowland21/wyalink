import { useState } from 'react'
import { Card, Button } from '@wyalink/ui'
import {
  useAuth,
  openSession,
  closeSession,
  type POSSession,
  type CreatePOSSessionForm,
  type ClosePOSSessionForm,
} from '@wyalink/supabase-client'
import { FiDollarSign, FiX } from 'react-icons/fi'

interface SessionManagerProps {
  currentSession?: POSSession
  onSessionOpened?: (session: POSSession) => void
  onSessionClosed?: () => void
}

export default function SessionManager({
  currentSession,
  onSessionOpened,
  onSessionClosed,
}: SessionManagerProps) {
  const { user } = useAuth()
  const [showOpenModal, setShowOpenModal] = useState(false)
  const [showCloseModal, setShowCloseModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CreatePOSSessionForm>({
    register_name: 'Main Register',
    starting_cash: 200.00,
    opening_notes: '',
  })
  const [closeData, setCloseData] = useState<ClosePOSSessionForm>({
    actual_cash: 0,
    closing_notes: '',
  })

  const handleOpenSession = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    const { data, error } = await openSession(formData, user.id)

    if (error) {
      alert('Error opening session: ' + error.message)
      setLoading(false)
      return
    }

    setLoading(false)
    setShowOpenModal(false)
    if (onSessionOpened && data) {
      onSessionOpened(data)
    }
  }

  const handleCloseSession = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !currentSession) return

    setLoading(true)
    const { data, error } = await closeSession(currentSession.id, closeData, user.id)

    if (error) {
      alert('Error closing session: ' + error.message)
      setLoading(false)
      return
    }

    setLoading(false)
    setShowCloseModal(false)
    if (onSessionClosed) {
      onSessionClosed()
    }

    // Show closing summary
    if (data) {
      const statusMessage = data.status === 'balanced'
        ? '✓ Session balanced perfectly!'
        : data.status === 'over'
        ? `⚠ Cash over by $${Math.abs(data.cash_difference || 0).toFixed(2)}`
        : `⚠ Cash short by $${Math.abs(data.cash_difference || 0).toFixed(2)}`

      alert(`Session Closed\n\n${statusMessage}\n\nTransactions: ${data.transaction_count}\nTotal Sales: $${data.total_sales.toFixed(2)}`)
    }
  }

  // If there's a current session, show close button
  if (currentSession) {
    return (
      <>
        <Button onClick={() => setShowCloseModal(true)} variant="outline">
          Close Session
        </Button>

        {/* Close Session Modal */}
        {showCloseModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-lg">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Close Session</h2>
                  <button onClick={() => setShowCloseModal(false)} className="text-gray-400 hover:text-gray-600">
                    <FiX className="text-2xl" />
                  </button>
                </div>

                {/* Session Summary */}
                <div className="mb-6 p-4 bg-gray-50 rounded space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Session:</span>
                    <span className="font-medium">{currentSession.session_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transactions:</span>
                    <span className="font-medium">{currentSession.transaction_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Sales:</span>
                    <span className="font-medium">${currentSession.total_sales.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Refunds:</span>
                    <span className="font-medium">${currentSession.total_refunds.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <span className="text-gray-600">Starting Cash:</span>
                    <span className="font-medium">${currentSession.starting_cash.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">+ Cash Payments:</span>
                    <span className="font-medium">${currentSession.total_cash_payments.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">- Cash Refunds:</span>
                    <span className="font-medium">-${currentSession.total_refunds.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 mt-2 text-lg font-bold">
                    <span>Expected Cash:</span>
                    <span>${(currentSession.starting_cash + currentSession.total_cash_payments - currentSession.total_refunds).toFixed(2)}</span>
                  </div>
                </div>

                <form onSubmit={handleCloseSession} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Actual Cash in Drawer
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiDollarSign className="text-gray-400" />
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={closeData.actual_cash}
                        onChange={(e) => setCloseData({ ...closeData, actual_cash: parseFloat(e.target.value) || 0 })}
                        className="pl-10 w-full p-3 border rounded text-lg font-medium"
                        placeholder="0.00"
                        autoFocus
                      />
                    </div>
                    {closeData.actual_cash > 0 && (
                      <p className={`mt-2 text-sm ${
                        Math.abs(closeData.actual_cash - (currentSession.starting_cash + currentSession.total_cash_payments - currentSession.total_refunds)) < 0.01
                          ? 'text-green-600'
                          : 'text-amber-600'
                      }`}>
                        Difference: ${(closeData.actual_cash - (currentSession.starting_cash + currentSession.total_cash_payments - currentSession.total_refunds)).toFixed(2)}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Closing Notes (Optional)
                    </label>
                    <textarea
                      value={closeData.closing_notes}
                      onChange={(e) => setCloseData({ ...closeData, closing_notes: e.target.value })}
                      className="w-full p-3 border rounded"
                      rows={3}
                      placeholder="Any notes about the session..."
                    />
                  </div>

                  <div className="flex gap-3 mt-6">
                    <Button
                      type="button"
                      onClick={() => setShowCloseModal(false)}
                      variant="outline"
                      className="flex-1"
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      className="flex-1"
                      disabled={loading || closeData.actual_cash === 0}
                    >
                      {loading ? 'Closing...' : 'Close Session'}
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          </div>
        )}
      </>
    )
  }

  // No session - show open session UI
  return (
    <>
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Open POS Session</h2>
          <p className="text-gray-600 mb-4">You must open a session before processing transactions.</p>
          <Button onClick={() => setShowOpenModal(true)} variant="primary" className="w-full">
            Open Session
          </Button>
        </div>
      </Card>

      {/* Open Session Modal */}
      {showOpenModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Open New Session</h2>
                <button onClick={() => setShowOpenModal(false)} className="text-gray-400 hover:text-gray-600">
                  <FiX className="text-2xl" />
                </button>
              </div>

              <form onSubmit={handleOpenSession} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Register Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.register_name}
                    onChange={(e) => setFormData({ ...formData, register_name: e.target.value })}
                    className="w-full p-3 border rounded"
                    placeholder="Main Register"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Starting Cash
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiDollarSign className="text-gray-400" />
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.starting_cash}
                      onChange={(e) => setFormData({ ...formData, starting_cash: parseFloat(e.target.value) || 0 })}
                      className="pl-10 w-full p-3 border rounded text-lg font-medium"
                      placeholder="200.00"
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">Amount of cash in the drawer to start</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Opening Notes (Optional)
                  </label>
                  <textarea
                    value={formData.opening_notes}
                    onChange={(e) => setFormData({ ...formData, opening_notes: e.target.value })}
                    className="w-full p-3 border rounded"
                    rows={3}
                    placeholder="Any notes about this session..."
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    type="button"
                    onClick={() => setShowOpenModal(false)}
                    variant="outline"
                    className="flex-1"
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1"
                    disabled={loading}
                  >
                    {loading ? 'Opening...' : 'Open Session'}
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}
    </>
  )
}
