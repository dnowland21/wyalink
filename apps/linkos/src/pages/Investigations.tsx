import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'

export default function Investigations() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Investigations</h1>
        <p className="text-muted-foreground mt-1">Track ongoing investigations</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Investigations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center text-muted-foreground">
            <p>Investigations module coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
