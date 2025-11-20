import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'

export default function Tickets() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Support Tickets</h1>
        <p className="text-gray-600 mt-1">Manage customer support tickets</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center text-muted-foreground">
            <p>Ticketing system coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
