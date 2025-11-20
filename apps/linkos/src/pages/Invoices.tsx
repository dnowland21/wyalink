import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'

export default function Invoices() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
        <p className="text-gray-600 mt-1">Generate and manage invoices</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center text-muted-foreground">
            <p>Invoice management coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
