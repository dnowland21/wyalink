import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'

export default function Orders() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <p className="text-muted-foreground mt-1">Manage customer orders</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center text-muted-foreground">
            <p>Order management coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
