import { Button } from '@wyalink/ui'

export default function ComingSoon() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-700 flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Logo */}
        <div className="mb-8">
          <img src="/logos/wyalink-logo-alt.svg" alt="WyaLink" className="h-16 w-auto mx-auto mb-6" />
        </div>

        {/* Main Content */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 shadow-2xl border border-white/20">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Something Amazing is Coming
          </h1>
          <p className="text-xl md:text-2xl text-gray-100 mb-8 leading-relaxed">
            We're building Northeast Pennsylvania's community-first cellular carrier.
            <br />
            Stay tuned for nationwide coverage with local care.
          </p>

          {/* Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="w-12 h-12 bg-secondary-400 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Nationwide Coverage</h3>
              <p className="text-gray-200 text-sm">
                Reliable service powered by America's largest 5G network
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="w-12 h-12 bg-secondary-400 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Affordable Plans</h3>
              <p className="text-gray-200 text-sm">Starting at just $45/month with no hidden fees</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="w-12 h-12 bg-secondary-400 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Local Support</h3>
              <p className="text-gray-200 text-sm">Real people, local expertise, always here to help</p>
            </div>
          </div>

          {/* Notify Me Form */}
          <div className="max-w-md mx-auto">
            <p className="text-gray-100 font-medium mb-4">Get notified when we launch</p>
            <div className="flex gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent backdrop-blur-sm"
              />
              <Button variant="accent" size="lg">
                Notify Me
              </Button>
            </div>
            <p className="text-sm text-gray-300 mt-3">We'll never share your email. Unsubscribe anytime.</p>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-gray-200">
          <p className="text-sm">
            Questions? Email us at{' '}
            <a href="mailto:info@wyalink.com" className="text-secondary-300 hover:text-secondary-200 underline">
              info@wyalink.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
