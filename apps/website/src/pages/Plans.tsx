import { Container, Card, Button } from '@wyalink/ui'

const plans = [
  {
    name: 'Essential',
    price: '30',
    data: '5GB',
    features: [
      '5GB High-Speed Data',
      'Unlimited Talk & Text',
      'Nationwide Coverage',
      'Mobile Hotspot',
      'No Contracts',
    ],
  },
  {
    name: 'Plus',
    price: '50',
    data: '20GB',
    features: [
      '20GB High-Speed Data',
      'Unlimited Talk & Text',
      'Nationwide Coverage',
      '10GB Mobile Hotspot',
      'No Contracts',
      'International Texting',
    ],
    popular: true,
  },
  {
    name: 'Unlimited',
    price: '70',
    data: 'Unlimited',
    features: [
      'Unlimited High-Speed Data',
      'Unlimited Talk & Text',
      'Nationwide Coverage',
      '30GB Mobile Hotspot',
      'No Contracts',
      'International Texting',
      'Premium Support',
    ],
  },
]

export default function Plans() {
  return (
    <div className="py-16">
      <Container>
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-primary-800 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your lifestyle. All plans include nationwide coverage
            with no hidden fees or long-term contracts.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Available to Pennsylvania residents only
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card key={plan.name} className={`relative ${plan.popular ? 'ring-2 ring-accent-400' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-accent-400 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-primary-800 mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center mb-2">
                  <span className="text-5xl font-bold text-primary-800">${plan.price}</span>
                  <span className="text-gray-600 ml-2">/month</span>
                </div>
                <p className="text-lg text-secondary-400 font-semibold">{plan.data} Data</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <svg
                      className="w-5 h-5 text-secondary-400 mr-3 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.popular ? 'accent' : 'primary'}
                className="w-full"
              >
                Get Started
              </Button>
            </Card>
          ))}
        </div>

        <div className="mt-16 bg-gray-50 rounded-xl p-8">
          <h2 className="text-3xl font-bold text-primary-800 mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div>
              <h3 className="font-semibold text-primary-800 mb-2">Are there any contracts?</h3>
              <p className="text-gray-600">
                No, all our plans are month-to-month with no long-term contracts or commitments.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-primary-800 mb-2">Can I keep my phone number?</h3>
              <p className="text-gray-600">
                Yes, you can transfer your existing phone number to WyaLink at no additional cost.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-primary-800 mb-2">What network do you use?</h3>
              <p className="text-gray-600">
                We partner with major national carriers to provide reliable nationwide coverage.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-primary-800 mb-2">Are there activation fees?</h3>
              <p className="text-gray-600">
                No activation fees or hidden charges. The price you see is the price you pay.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}
