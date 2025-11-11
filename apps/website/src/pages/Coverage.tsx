import { Container, Card, Button } from '@wyalink/ui'

export default function Coverage() {
  return (
    <div className="py-16">
      <Container>
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-primary-800 mb-4">
            Nationwide Coverage
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Stay connected wherever you go with reliable coverage across the United States.
            Our network reaches more than 99% of Americans.
          </p>
        </div>

        <div className="bg-gray-100 rounded-xl p-12 mb-12 text-center">
          <div className="text-gray-500 mb-4">
            <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <p className="text-gray-600 text-lg">
            Interactive coverage map coming soon. Check back later!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card>
            <h3 className="text-2xl font-bold text-primary-800 mb-4">5G Coverage</h3>
            <p className="text-gray-600 mb-4">
              Experience blazing-fast speeds with our expanding 5G network in major cities
              and metropolitan areas across Pennsylvania and nationwide.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center text-gray-700">
                <svg className="w-5 h-5 text-secondary-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Download speeds up to 1 Gbps
              </li>
              <li className="flex items-center text-gray-700">
                <svg className="w-5 h-5 text-secondary-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Ultra-low latency
              </li>
              <li className="flex items-center text-gray-700">
                <svg className="w-5 h-5 text-secondary-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Continuously expanding
              </li>
            </ul>
          </Card>

          <Card>
            <h3 className="text-2xl font-bold text-primary-800 mb-4">4G LTE Coverage</h3>
            <p className="text-gray-600 mb-4">
              Reliable 4G LTE coverage across 99% of the United States, ensuring you stay
              connected even in rural areas and while traveling.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center text-gray-700">
                <svg className="w-5 h-5 text-secondary-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Nationwide coverage
              </li>
              <li className="flex items-center text-gray-700">
                <svg className="w-5 h-5 text-secondary-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Fast, reliable speeds
              </li>
              <li className="flex items-center text-gray-700">
                <svg className="w-5 h-5 text-secondary-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Seamless connectivity
              </li>
            </ul>
          </Card>
        </div>

        <div className="bg-primary-800 rounded-2xl p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">
            Check Your Address
          </h2>
          <p className="text-lg mb-8 text-gray-100">
            Want to confirm coverage at your specific location? Enter your address below.
          </p>
          <div className="max-w-xl mx-auto">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Enter your address"
                className="flex-1 px-6 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent-400"
              />
              <Button variant="accent">
                Check Coverage
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}
