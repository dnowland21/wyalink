import { useState, useEffect } from 'react'
import { createVendor, updateVendor, type Vendor, type CreateVendorForm } from '@wyalink/supabase-client'

interface VendorModalProps {
  isOpen: boolean
  onClose: (shouldRefresh?: boolean) => void
  vendor?: Vendor | null
}

export default function VendorModal({ isOpen, onClose, vendor }: VendorModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [companyName, setCompanyName] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [billingAddressLine1, setBillingAddressLine1] = useState('')
  const [billingAddressLine2, setBillingAddressLine2] = useState('')
  const [billingCity, setBillingCity] = useState('')
  const [billingState, setBillingState] = useState('')
  const [billingZip, setBillingZip] = useState('')
  const [billingCountry, setBillingCountry] = useState('USA')
  const [shippingAddressLine1, setShippingAddressLine1] = useState('')
  const [shippingAddressLine2, setShippingAddressLine2] = useState('')
  const [shippingCity, setShippingCity] = useState('')
  const [shippingState, setShippingState] = useState('')
  const [shippingZip, setShippingZip] = useState('')
  const [shippingCountry, setShippingCountry] = useState('USA')
  const [terms, setTerms] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (vendor) {
      setCompanyName(vendor.company_name)
      setFirstName(vendor.first_name || '')
      setLastName(vendor.last_name || '')
      setEmail(vendor.email || '')
      setPhone(vendor.phone || '')
      setBillingAddressLine1(vendor.billing_address_line1 || '')
      setBillingAddressLine2(vendor.billing_address_line2 || '')
      setBillingCity(vendor.billing_city || '')
      setBillingState(vendor.billing_state || '')
      setBillingZip(vendor.billing_zip || '')
      setBillingCountry(vendor.billing_country || 'USA')
      setShippingAddressLine1(vendor.shipping_address_line1 || '')
      setShippingAddressLine2(vendor.shipping_address_line2 || '')
      setShippingCity(vendor.shipping_city || '')
      setShippingState(vendor.shipping_state || '')
      setShippingZip(vendor.shipping_zip || '')
      setShippingCountry(vendor.shipping_country || 'USA')
      setTerms(vendor.terms || '')
      setNotes(vendor.notes || '')
    } else {
      resetForm()
    }
  }, [vendor, isOpen])

  const resetForm = () => {
    setCompanyName('')
    setFirstName('')
    setLastName('')
    setEmail('')
    setPhone('')
    setBillingAddressLine1('')
    setBillingAddressLine2('')
    setBillingCity('')
    setBillingState('')
    setBillingZip('')
    setBillingCountry('USA')
    setShippingAddressLine1('')
    setShippingAddressLine2('')
    setShippingCity('')
    setShippingState('')
    setShippingZip('')
    setShippingCountry('USA')
    setTerms('')
    setNotes('')
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const vendorData: CreateVendorForm = {
        company_name: companyName,
        first_name: firstName || undefined,
        last_name: lastName || undefined,
        email: email || undefined,
        phone: phone || undefined,
        billing_address_line1: billingAddressLine1 || undefined,
        billing_address_line2: billingAddressLine2 || undefined,
        billing_city: billingCity || undefined,
        billing_state: billingState || undefined,
        billing_zip: billingZip || undefined,
        billing_country: billingCountry || undefined,
        shipping_address_line1: shippingAddressLine1 || undefined,
        shipping_address_line2: shippingAddressLine2 || undefined,
        shipping_city: shippingCity || undefined,
        shipping_state: shippingState || undefined,
        shipping_zip: shippingZip || undefined,
        shipping_country: shippingCountry || undefined,
        terms: terms || undefined,
        notes: notes || undefined,
      }

      let result
      if (vendor) {
        result = await updateVendor(vendor.id, vendorData)
      } else {
        result = await createVendor(vendorData)
      }

      if (result.error) throw result.error

      onClose(true)
      resetForm()
    } catch (err: any) {
      setError(err.message || 'Failed to save vendor')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              {vendor ? 'Edit Vendor' : 'Add New Vendor'}
            </h2>
            <button
              onClick={() => onClose()}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Company Information */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Company Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Billing Address */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Billing Address</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 1</label>
                    <input
                      type="text"
                      value={billingAddressLine1}
                      onChange={(e) => setBillingAddressLine1(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2</label>
                    <input
                      type="text"
                      value={billingAddressLine2}
                      onChange={(e) => setBillingAddressLine2(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      value={billingCity}
                      onChange={(e) => setBillingCity(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                    <input
                      type="text"
                      value={billingState}
                      onChange={(e) => setBillingState(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                    <input
                      type="text"
                      value={billingZip}
                      onChange={(e) => setBillingZip(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                  <input
                    type="text"
                    value={billingCountry}
                    onChange={(e) => setBillingCountry(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Shipping Address</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 1</label>
                    <input
                      type="text"
                      value={shippingAddressLine1}
                      onChange={(e) => setShippingAddressLine1(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2</label>
                    <input
                      type="text"
                      value={shippingAddressLine2}
                      onChange={(e) => setShippingAddressLine2(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      value={shippingCity}
                      onChange={(e) => setShippingCity(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                    <input
                      type="text"
                      value={shippingState}
                      onChange={(e) => setShippingState(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                    <input
                      type="text"
                      value={shippingZip}
                      onChange={(e) => setShippingZip(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                  <input
                    type="text"
                    value={shippingCountry}
                    onChange={(e) => setShippingCountry(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Payment Terms and Notes */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Additional Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Terms</label>
                  <textarea
                    value={terms}
                    onChange={(e) => setTerms(e.target.value)}
                    rows={2}
                    placeholder="e.g., Net 30, COD, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Additional notes about this vendor..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t">
            <button
              type="button"
              onClick={() => onClose()}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : vendor ? 'Update Vendor' : 'Create Vendor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
