import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Plus } from 'lucide-react'

export default function Products() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">Manage your product catalog</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Product</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">SKU</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Price</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Stock</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4 text-sm text-gray-900">Product Name 1</td>
                  <td className="py-4 px-4 text-sm text-gray-600">SKU-001</td>
                  <td className="py-4 px-4 text-sm text-gray-900">$99.99</td>
                  <td className="py-4 px-4 text-sm text-gray-900">45</td>
                  <td className="py-4 px-4">
                    <Badge variant="success">Active</Badge>
                  </td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4 text-sm text-gray-900">Product Name 2</td>
                  <td className="py-4 px-4 text-sm text-gray-600">SKU-002</td>
                  <td className="py-4 px-4 text-sm text-gray-900">$149.99</td>
                  <td className="py-4 px-4 text-sm text-gray-900">12</td>
                  <td className="py-4 px-4">
                    <Badge variant="warning">Low Stock</Badge>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="py-4 px-4 text-sm text-gray-900">Product Name 3</td>
                  <td className="py-4 px-4 text-sm text-gray-600">SKU-003</td>
                  <td className="py-4 px-4 text-sm text-gray-900">$79.99</td>
                  <td className="py-4 px-4 text-sm text-gray-900">0</td>
                  <td className="py-4 px-4">
                    <Badge variant="error">Out of Stock</Badge>
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
