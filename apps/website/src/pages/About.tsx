import { Container, Card } from '@wyalink/ui'

const values = [
  {
    title: 'Community First',
    description: 'We believe in supporting and giving back to the communities we serve across Northeast Pennsylvania.',
  },
  {
    title: 'Customer Experience',
    description: 'Exceptional service is at our core. We treat every customer like a neighbor because you are.',
  },
  {
    title: 'Transparency',
    description: 'No hidden fees, no tricks. What you see is what you get with clear, honest pricing.',
  },
  {
    title: 'Local Support',
    description: 'Real people, real help. Our local support team is always ready to assist you.',
  },
]

export default function About() {
  return (
    <div>
      <section className="bg-gradient-to-br from-primary-800 to-primary-900 text-white py-20">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              About WyaLink
            </h1>
            <p className="text-xl text-gray-100">
              Northeast Pennsylvania's community-first cellular carrier, founded in 2025
              with a mission to provide exceptional service with local care.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-primary-800 mb-6">Our Story</h2>
            <div className="prose prose-lg">
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                WyaLink was founded in 2025 with a simple vision: to bring reliable, affordable
                cellular service to Pennsylvania residents while maintaining the personal touch
                and community involvement that larger carriers often overlook.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                We're proud to be based in Northeast Pennsylvania, serving our neighbors with
                nationwide coverage backed by major network infrastructure. But what sets us
                apart isn't just our network—it's our commitment to you and our community.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed">
                As a Pennsylvania-focused carrier, we understand the unique needs of our
                region and are dedicated to providing the kind of service we'd want for
                our own families.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 bg-gray-50">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-primary-800 mb-4">Our Values</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              These principles guide everything we do at WyaLink
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {values.map((value) => (
              <Card key={value.title}>
                <h3 className="text-2xl font-bold text-primary-800 mb-3">{value.title}</h3>
                <p className="text-gray-600 text-lg">{value.description}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-primary-800 mb-6">Serving Pennsylvania</h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              While we offer nationwide coverage through our network partnerships, WyaLink
              is exclusively available to Pennsylvania residents. This focused approach allows
              us to provide better, more personalized service to our community.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed">
              Whether you're in bustling cities or rural communities across the state, we're
              here to keep you connected with reliable service and genuine local support.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-16 bg-primary-800 text-white">
        <Container>
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-6">
              Join the WyaLink Family
            </h2>
            <p className="text-xl text-gray-100 max-w-2xl mx-auto mb-8">
              Experience the difference of a carrier that truly cares about you and your community.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href="/plans"
                className="bg-accent-400 text-white px-8 py-4 rounded-lg font-semibold hover:bg-accent-500 transition-colors text-lg"
              >
                View Our Plans
              </a>
              <a
                href="/support"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-colors text-lg"
              >
                Contact Us
              </a>
            </div>
          </div>
        </Container>
      </section>
    </div>
  )
}
