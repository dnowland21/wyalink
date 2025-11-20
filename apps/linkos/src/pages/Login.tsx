import { useState } from 'react'
import { useAuth } from '@wyalink/supabase-client'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, AlertCircle, Mail, Lock } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await signIn({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - System Messages & Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-brand p-12 flex-col justify-between">
        <div>
          {/* Logo */}
          <img src="/logos/linkos-logo-alt.svg" alt="LinkOS" className="h-10 w-auto mb-16" />

          {/* System Status / Alerts Area */}
          <div className="max-w-md">
            <div className="space-y-4">
              {/* Welcome Message */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                    <Lock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Secure Access</h3>
                    <p className="text-gray-200 text-sm leading-relaxed">
                      Sign in with your WyaLink admin credentials to access the operations dashboard.
                    </p>
                  </div>
                </div>
              </div>

              {/* Features Preview */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4">What's Coming</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-gray-100">
                    <CheckCircle2 className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Lead management and tracking</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-100">
                    <CheckCircle2 className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Customer relationship management</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-100">
                    <CheckCircle2 className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Real-time analytics and reporting</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-100">
                    <CheckCircle2 className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Role-based access control</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-100">
                    <CheckCircle2 className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Mobile-optimized interface</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-gray-300 text-sm mt-8">
          <p>© 2025 WyaLink. All rights reserved.</p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <img src="/logos/linkos-logo.svg" alt="LinkOS" className="h-10 w-auto mx-auto" />
          </div>

          {/* Login Card */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-3xl">Sign In</CardTitle>
              <CardDescription>Access your LinkOS dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Error Message */}
              {error && (
                <div className="mb-6 bg-error-50 border border-error-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-error mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-error-foreground">Authentication Error</p>
                      <p className="text-xs text-error-800 mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@wyalink.com"
                  required
                  disabled={loading}
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    Password
                  </label>
                  <a href="#" className="text-sm text-primary hover:text-primary/80 font-medium">
                    Forgot password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            {/* Additional Links */}
            <div className="mt-6 pt-6 border-t">
              <p className="text-center text-sm text-muted-foreground">
                Need access?{' '}
                <a href="mailto:support@wyalink.com" className="text-primary hover:text-primary/80 font-medium">
                  Contact Support
                </a>
              </p>
            </div>
          </CardContent>
          </Card>

          {/* Help Text */}
          <p className="text-center text-sm text-gray-500 mt-6">
            For internal use only. Authorized personnel only.
          </p>
        </div>
      </div>
    </div>
  )
}
