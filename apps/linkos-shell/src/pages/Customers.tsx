import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Plus } from 'lucide-react'

export default function Customers() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600 mt-1">Manage your customer relationships</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Customer
        </Button>
      </div>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Phone</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Orders</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Total Spent</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4 text-sm text-gray-900">John Doe</td>
                  <td className="py-4 px-4 text-sm text-gray-600">john@example.com</td>
                  <td className="py-4 px-4 text-sm text-gray-600">(555) 123-4567</td>
                  <td className="py-4 px-4 text-sm text-gray-900">12</td>
                  <td className="py-4 px-4 text-sm text-gray-900">$1,234.56</td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4 text-sm text-gray-900">Jane Smith</td>
                  <td className="py-4 px-4 text-sm text-gray-600">jane@example.com</td>
                  <td className="py-4 px-4 text-sm text-gray-600">(555) 987-6543</td>
                  <td className="py-4 px-4 text-sm text-gray-900">8</td>
                  <td className="py-4 px-4 text-sm text-gray-900">$987.65</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="py-4 px-4 text-sm text-gray-900">Bob Johnson</td>
                  <td className="py-4 px-4 text-sm text-gray-600">bob@example.com</td>
                  <td className="py-4 px-4 text-sm text-gray-600">(555) 456-7890</td>
                  <td className="py-4 px-4 text-sm text-gray-900">5</td>
                  <td className="py-4 px-4 text-sm text-gray-900">$543.21</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
