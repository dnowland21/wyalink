import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'

export default function Orders() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-600 mt-1">Track and manage customer orders</p>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Order #</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Customer</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Total</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4 text-sm font-mono text-gray-900">#ORD-001</td>
                  <td className="py-4 px-4 text-sm text-gray-900">John Doe</td>
                  <td className="py-4 px-4 text-sm text-gray-600">Jan 15, 2025</td>
                  <td className="py-4 px-4 text-sm text-gray-900">$249.99</td>
                  <td className="py-4 px-4">
                    <Badge variant="success">Delivered</Badge>
                  </td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4 text-sm font-mono text-gray-900">#ORD-002</td>
                  <td className="py-4 px-4 text-sm text-gray-900">Jane Smith</td>
                  <td className="py-4 px-4 text-sm text-gray-600">Jan 14, 2025</td>
                  <td className="py-4 px-4 text-sm text-gray-900">$149.99</td>
                  <td className="py-4 px-4">
                    <Badge variant="info">Shipped</Badge>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="py-4 px-4 text-sm font-mono text-gray-900">#ORD-003</td>
                  <td className="py-4 px-4 text-sm text-gray-900">Bob Johnson</td>
                  <td className="py-4 px-4 text-sm text-gray-600">Jan 13, 2025</td>
                  <td className="py-4 px-4 text-sm text-gray-900">$99.99</td>
                  <td className="py-4 px-4">
                    <Badge variant="warning">Processing</Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
