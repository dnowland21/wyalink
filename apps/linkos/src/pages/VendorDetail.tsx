import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  getVendor,
  deleteVendor,
  type Vendor,
} from '@wyalink/supabase-client'
import { Card } from '@wyalink/ui'
import VendorModal from '../components/VendorModal'

export default function VendorDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  useEffect(() => {
    if (!id) {
      navigate('/vendors')
      return
    }

    fetchVendor()
  }, [id])

  const fetchVendor = async () => {
    if (!id) return

    setLoading(true)
    setError(null)

    try {
      const result = await getVendor(id)

      if (result.error) throw result.error

      setVendor(result.data)
    } catch (err: any) {
      setError('Failed to load vendor')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleEditModalClose = (shouldRefresh?: boolean) => {
    setIsEditModalOpen(false)
    if (shouldRefresh) {
      fetchVendor()
    }
  }

  const handleDelete = async () => {
    if (!id || !window.confirm('Permanently delete this vendor? This action cannot be undone.')) return

    try {
      const result = await deleteVendor(id)
      if (result.error) throw result.error

      navigate('/vendors')
    } catch (err: any) {
      alert('Failed to delete vendor')
      console.error(err)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading vendor...</p>
        </div>
      </div>
    )
  }

  if (error || !vendor) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Vendor not found'}</p>
          <Link to="/vendors" className="text-primary-600 hover:text-primary-700">
            Back to Vendors
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <Link to="/vendors" className="hover:text-primary-600">
            Vendors
          </Link>
          <span>/</span>
          <span>{vendor.company_name}</span>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{vendor.company_name}</h1>
            {vendor.first_name && vendor.last_name && (
              <p className="text-gray-600 mt-1">
                Contact: {vendor.first_name} {vendor.last_name}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Edit Vendor
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Vendor Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Information */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Company Name</label>
                <p className="text-sm text-gray-900">{vendor.company_name}</p>
              </div>
              {(vendor.first_name || vendor.last_name) && (
                <div className="grid grid-cols-2 gap-4">
                  {vendor.first_name && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">First Name</label>
                      <p className="text-sm text-gray-900">{vendor.first_name}</p>
                    </div>
                  )}
                  {vendor.last_name && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Last Name</label>
                      <p className="text-sm text-gray-900">{vendor.last_name}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Contact Information */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
            <div className="space-y-3">
              {vendor.email && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                  <a href={`mailto:${vendor.email}`} className="text-sm text-primary-600 hover:text-primary-700">
                    {vendor.email}
                  </a>
                </div>
              )}
              {vendor.phone && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
                  <a href={`tel:${vendor.phone}`} className="text-sm text-primary-600 hover:text-primary-700">
                    {vendor.phone}
                  </a>
                </div>
              )}
            </div>
          </Card>

          {/* Billing Address */}
          {vendor.billing_address_line1 && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Address</h3>
              <div className="space-y-1">
                <p className="text-sm text-gray-900">{vendor.billing_address_line1}</p>
                {vendor.billing_address_line2 && (
                  <p className="text-sm text-gray-900">{vendor.billing_address_line2}</p>
                )}
                {(vendor.billing_city || vendor.billing_state || vendor.billing_zip) && (
                  <p className="text-sm text-gray-900">
                    {[vendor.billing_city, vendor.billing_state, vendor.billing_zip].filter(Boolean).join(', ')}
                  </p>
                )}
                {vendor.billing_country && (
                  <p className="text-sm text-gray-900">{vendor.billing_country}</p>
                )}
              </div>
            </Card>
          )}

          {/* Shipping Address */}
          {vendor.shipping_address_line1 && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h3>
              <div className="space-y-1">
                <p className="text-sm text-gray-900">{vendor.shipping_address_line1}</p>
                {vendor.shipping_address_line2 && (
                  <p className="text-sm text-gray-900">{vendor.shipping_address_line2}</p>
                )}
                {(vendor.shipping_city || vendor.shipping_state || vendor.shipping_zip) && (
                  <p className="text-sm text-gray-900">
                    {[vendor.shipping_city, vendor.shipping_state, vendor.shipping_zip].filter(Boolean).join(', ')}
                  </p>
                )}
                {vendor.shipping_country && (
                  <p className="text-sm text-gray-900">{vendor.shipping_country}</p>
                )}
              </div>
            </Card>
          )}

          {/* Terms & Notes */}
          {(vendor.terms || vendor.notes) && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
              <div className="space-y-3">
                {vendor.terms && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Payment Terms</label>
                    <p className="text-sm text-gray-900">{vendor.terms}</p>
                  </div>
                )}
                {vendor.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Notes</label>
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{vendor.notes}</p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Right Column - Metadata */}
        <div className="space-y-6">
          {/* Quick Contact */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Contact</h3>
            <div className="space-y-3">
              {vendor.email && (
                <a
                  href={`mailto:${vendor.email}`}
                  className="block w-full px-4 py-2 bg-primary-800 text-white text-center rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Send Email
                </a>
              )}
              {vendor.phone && (
                <a
                  href={`tel:${vendor.phone}`}
                  className="block w-full px-4 py-2 border border-gray-300 text-gray-700 text-center rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Call Vendor
                </a>
              )}
            </div>
          </Card>

          {/* Metadata */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Created</label>
                <p className="text-sm text-gray-900">{formatDate(vendor.created_at)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Last Updated</label>
                <p className="text-sm text-gray-900">{formatDate(vendor.updated_at)}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Modal */}
      <VendorModal isOpen={isEditModalOpen} onClose={handleEditModalClose} vendor={vendor} />
    </div>
  )
}
