import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'

export default function Incidents() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Incidents</h1>
        <p className="text-gray-600 mt-1">Monitor and manage incidents</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Incidents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center text-muted-foreground">
            <p>Incident management coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
