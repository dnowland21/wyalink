import { useState, useEffect } from 'react'
import { useIsAdmin, getEmailSettings, updateEmailSettings, testEmailConfiguration, type EmailSettings } from '@wyalink/supabase-client'
import { Card } from '@wyalink/ui'

export default function Settings() {
  const isAdmin = useIsAdmin()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [testEmail, setTestEmail] = useState('')

  // Email settings state
  const [emailEnabled, setEmailEnabled] = useState(false)
  const [smtpHost, setSmtpHost] = useState('smtp.office365.com')
  const [smtpPort, setSmtpPort] = useState('587')
  const [smtpSecure, setSmtpSecure] = useState(false)
  const [smtpUsername, setSmtpUsername] = useState('')
  const [smtpPassword, setSmtpPassword] = useState('')
  const [fromName, setFromName] = useState('WyaLink')
  const [fromAddress, setFromAddress] = useState('')

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    setError(null)

    const { data, error: apiError } = await getEmailSettings()

    if (apiError) {
      setError('Failed to load settings')
      console.error(apiError)
    } else if (data) {
      setEmailEnabled(data['email.enabled'] || false)
      setSmtpHost(data['email.smtp.host'] || 'smtp.office365.com')
      setSmtpPort(String(data['email.smtp.port'] || 587))
      setSmtpSecure(data['email.smtp.secure'] || false)
      setSmtpUsername(data['email.smtp.username'] || '')
      setSmtpPassword(data['email.smtp.password'] || '')
      setFromName(data['email.from.name'] || 'WyaLink')
      setFromAddress(data['email.from.address'] || '')
    }

    setLoading(false)
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setSaving(true)

    const settings: Partial<EmailSettings> = {
      'email.enabled': emailEnabled,
      'email.smtp.host': smtpHost,
      'email.smtp.port': parseInt(smtpPort),
      'email.smtp.secure': smtpSecure,
      'email.smtp.username': smtpUsername,
      'email.smtp.password': smtpPassword,
      'email.from.name': fromName,
      'email.from.address': fromAddress || smtpUsername,
    }

    const { error: apiError } = await updateEmailSettings(settings)

    setSaving(false)

    if (apiError) {
      setError(apiError.message)
    } else {
      setSuccess('Settings saved successfully!')
      setTimeout(() => setSuccess(null), 3000)
    }
  }

  const handleTestEmail = async () => {
    setError(null)
    setSuccess(null)

    if (!testEmail) {
      setError('Please enter a test email address')
      return
    }

    setTesting(true)

    const { error: apiError } = await testEmailConfiguration(testEmail)

    setTesting(false)

    if (apiError) {
      setError(apiError.message)
    } else {
      setSuccess(`Test email sent to ${testEmail}!`)
      setTimeout(() => setSuccess(null), 5000)
    }
  }

  // Check admin access
  if (!isAdmin) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>
        <Card>
          <div className="text-center py-8">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">You need administrator privileges to access settings.</p>
          </div>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading settings...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings Form */}
        <div className="lg:col-span-2">
          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Email Configuration</h2>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">{success}</p>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-6">
              {/* Enable Email */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <label htmlFor="email-enabled" className="text-sm font-medium text-gray-900">
                    Enable Email Sending
                  </label>
                  <p className="text-xs text-gray-600 mt-1">
                    Turn on to enable email functionality throughout the application
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEmailEnabled(!emailEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                    emailEnabled ? 'bg-primary-800' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      emailEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Office 365 SMTP Settings */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">
                  Office 365 SMTP Settings
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="smtp-host" className="block text-sm font-medium text-gray-700 mb-2">
                      SMTP Host *
                    </label>
                    <input
                      id="smtp-host"
                      type="text"
                      value={smtpHost}
                      onChange={(e) => setSmtpHost(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="smtp-port" className="block text-sm font-medium text-gray-700 mb-2">
                      SMTP Port *
                    </label>
                    <input
                      id="smtp-port"
                      type="number"
                      value={smtpPort}
                      onChange={(e) => setSmtpPort(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="smtp-username" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address (Username) *
                  </label>
                  <input
                    id="smtp-username"
                    type="email"
                    value={smtpUsername}
                    onChange={(e) => setSmtpUsername(e.target.value)}
                    required
                    placeholder="support@wyalink.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <p className="text-xs text-gray-600 mt-1">Your Office 365 email address</p>
                </div>

                <div>
                  <label htmlFor="smtp-password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <input
                    id="smtp-password"
                    type="password"
                    value={smtpPassword}
                    onChange={(e) => setSmtpPassword(e.target.value)}
                    required
                    placeholder="Enter your Office 365 password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Your Office 365 password or app-specific password
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id="smtp-secure"
                    type="checkbox"
                    checked={smtpSecure}
                    onChange={(e) => setSmtpSecure(e.target.checked)}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="smtp-secure" className="text-sm text-gray-700">
                    Use SSL/TLS (typically false for port 587, true for port 465)
                  </label>
                </div>
              </div>

              {/* From Settings */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Email From Settings</h3>

                <div>
                  <label htmlFor="from-name" className="block text-sm font-medium text-gray-700 mb-2">
                    From Name *
                  </label>
                  <input
                    id="from-name"
                    type="text"
                    value={fromName}
                    onChange={(e) => setFromName(e.target.value)}
                    required
                    placeholder="WyaLink"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label htmlFor="from-address" className="block text-sm font-medium text-gray-700 mb-2">
                    From Email Address
                  </label>
                  <input
                    id="from-address"
                    type="email"
                    value={fromAddress}
                    onChange={(e) => setFromAddress(e.target.value)}
                    placeholder="Leave blank to use SMTP username"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Optional. If not set, will use the SMTP username as the from address.
                  </p>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-4 border-t">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-primary-800 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </Card>
        </div>

        {/* Test Email Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Test Email Configuration</h2>

            <p className="text-sm text-gray-600 mb-4">
              Send a test email to verify your Office 365 configuration is working correctly.
            </p>

            <div className="space-y-4">
              <div>
                <label htmlFor="test-email" className="block text-sm font-medium text-gray-700 mb-2">
                  Test Email Address
                </label>
                <input
                  id="test-email"
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="your-email@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <button
                onClick={handleTestEmail}
                disabled={testing || !emailEnabled}
                className="w-full px-4 py-2 bg-secondary-400 hover:bg-secondary-600 text-white font-medium rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {testing ? 'Sending Test Email...' : 'Send Test Email'}
              </button>

              {!emailEnabled && (
                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-2">
                  Email sending is currently disabled. Enable it and save settings to send test emails.
                </p>
              )}
            </div>
          </Card>

          {/* Help Card */}
          <Card className="mt-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Office 365 Setup Help</h3>
            <div className="space-y-2 text-xs text-gray-600">
              <p>
                <strong>Host:</strong> smtp.office365.com
              </p>
              <p>
                <strong>Port:</strong> 587 (TLS) or 465 (SSL)
              </p>
              <p>
                <strong>Username:</strong> Your full Office 365 email address
              </p>
              <p>
                <strong>Password:</strong> Your Office 365 password or an app-specific password if you have 2FA enabled
              </p>
              <p className="pt-2 border-t">
                If you have multi-factor authentication enabled, you may need to create an app-specific password in your
                Office 365 account settings.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
