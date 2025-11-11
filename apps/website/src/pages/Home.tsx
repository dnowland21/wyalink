import { Link } from 'react-router-dom'
import { Container, Button, Card } from '@wyalink/ui'

export default function Home() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDEzNGMwLTYuNjI3LTUuMzczLTEyLTEyLTEyczEyIDUuMzczIDEyIDEydjYwYzAtNi42MjctNS4zNzMtMTItMTItMTJzMTIgNS4zNzMgMTIgMTJ2NjBjMC02LjYyNy01LjM3My0xMi0xMi0xMnMxMiA1LjM3MyAxMiAxMnY2MGMwLTYuNjI3LTUuMzczLTEyLTEyLTEyczEyIDUuMzczIDEyIDEydjYwYzAtNi42MjctNS4zNzMtMTItMTItMTJzMTIgNS4zNzMgMTIgMTJ2NjBjMC02LjYyNy01LjM3My0xMi0xMi0xMnMxMiA1LjM3MyAxMiAxMnptLTEyLTEyYzAtNi42MjcgNS4zNzMtMTIgMTItMTJzLTEyIDUuMzczLTEyIDEydjYwYzAtNi42MjcgNS4zNzMtMTIgMTItMTJzLTEyIDUuMzczLTEyIDEydjYwYzAtNi42MjcgNS4zNzMtMTIgMTItMTJzLTEyIDUuMzczLTEyIDEydjYwYzAtNi42MjcgNS4zNzMtMTIgMTItMTJzLTEyIDUuMzczLTEyIDEydjYwYzAtNi42MjcgNS4zNzMtMTIgMTItMTJzLTEyIDUuMzczLTEyIDEydi02MHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-10"></div>

        <Container className="relative py-24 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-secondary-400/20 text-secondary-100 font-medium mb-8 backdrop-blur-sm border border-secondary-400/30">
              <span className="w-2 h-2 bg-secondary-400 rounded-full mr-2 animate-pulse"></span>
              Now serving Pennsylvania residents
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Community First
              <span className="block mt-2 bg-gradient-to-r from-secondary-300 to-secondary-100 bg-clip-text text-transparent">
                Cellular Service
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-100 mb-10 leading-relaxed max-w-3xl mx-auto">
              Experience nationwide coverage with local care. WyaLink is Northeast Pennsylvania's
              community-focused carrier, dedicated to exceptional service.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/plans">
                <Button variant="accent" size="xl">
                  View Our Plans
                </Button>
              </Link>
              <Link to="/coverage">
                <Button variant="outline" size="xl" className="!border-white !text-white hover:!bg-white hover:!text-primary-800">
                  Check Coverage
                </Button>
              </Link>
            </div>
          </div>
        </Container>

        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-auto" viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0L60 8.33C120 16.7 240 33.3 360 41.7C480 50 600 50 720 45C840 40 960 30 1080 28.3C1200 26.7 1320 33.3 1380 36.7L1440 40V100H1380C1320 100 1200 100 1080 100C960 100 840 100 720 100C600 100 480 100 360 100C240 100 120 100 60 100H0V0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <Container>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-primary-800 to-primary-600 bg-clip-text text-transparent mb-2">
                99%
              </div>
              <p className="text-gray-600 font-medium">Nationwide Coverage</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-secondary-400 to-secondary-600 bg-clip-text text-transparent mb-2">
                2025
              </div>
              <p className="text-gray-600 font-medium">Founded in NEPA</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent mb-2">
                24/7
              </div>
              <p className="text-gray-600 font-medium">Local Support</p>
            </div>
          </div>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-primary-800 mb-4">
              Why Choose WyaLink?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're more than just a carrier. We're your neighbors, committed to serving
              our Northeast Pennsylvania community.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card hover gradient>
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-primary-800 mb-3">Nationwide Coverage</h3>
                <p className="text-gray-600 leading-relaxed">
                  Stay connected wherever you go with our reliable nationwide network coverage backed by major carriers.
                </p>
              </div>
            </Card>

            <Card hover gradient>
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-primary-800 mb-3">Community Focused</h3>
                <p className="text-gray-600 leading-relaxed">
                  Founded in 2025, we're dedicated to serving and actively supporting our local Pennsylvania communities.
                </p>
              </div>
            </Card>

            <Card hover gradient>
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-primary-800 mb-3">Customer First</h3>
                <p className="text-gray-600 leading-relaxed">
                  Exceptional customer experience is at the heart of everything we do. Real people, real support.
                </p>
              </div>
            </Card>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <Container>
          <div className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 rounded-3xl p-12 md:p-16 text-white shadow-2xl">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE1NGMwLTYuNjI3LTUuMzczLTEyLTEyLTEyczEyIDUuMzczIDEyIDEydjYwYzAtNi42MjctNS4zNzMtMTItMTItMTJzMTIgNS4zNzMgMTIgMTJ2NjBjMC02LjYyNy01LjM3My0xMi0xMi0xMnMxMiA1LjM3MyAxMiAxMnYiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-10"></div>

            <div className="relative text-center max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to Switch to WyaLink?
              </h2>
              <p className="text-xl mb-8 text-gray-100">
                Join Pennsylvania residents who trust WyaLink for their cellular service.
                No contracts, no hidden fees, just honest service.
              </p>
              <Link to="/plans">
                <Button variant="accent" size="xl">
                  Explore Plans
                </Button>
              </Link>
            </div>

            <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary-400/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary-600/20 rounded-full blur-3xl"></div>
          </div>
        </Container>
      </section>
    </div>
  )
}
