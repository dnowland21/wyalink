import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'

export default function Payments() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
        <p className="text-gray-600 mt-1">Process and track payments</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center text-muted-foreground">
            <p>Payment processing coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
