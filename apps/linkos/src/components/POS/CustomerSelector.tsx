import { useState, useEffect } from 'react'
import { getCustomers, type Customer } from '@wyalink/supabase-client'
import { FiSearch, FiUser, FiX } from 'react-icons/fi'

interface CustomerSelectorProps {
  selectedCustomer: Customer | null
  onCustomerSelected: (customer: Customer) => void
  disabled?: boolean
}

export default function CustomerSelector({
  selectedCustomer,
  onCustomerSelected,
  disabled,
}: CustomerSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)

  // Search customers
  useEffect(() => {
    const searchCustomers = async () => {
      if (searchTerm.length < 2) {
        setSearchResults([])
        setShowResults(false)
        return
      }

      setLoading(true)
      const { data, error } = await getCustomers({ search: searchTerm })

      if (!error && data) {
        setSearchResults(data)
        setShowResults(true)
      }
      setLoading(false)
    }

    const debounce = setTimeout(() => {
      searchCustomers()
    }, 300)

    return () => clearTimeout(debounce)
  }, [searchTerm])

  const handleSelect = (customer: Customer) => {
    onCustomerSelected(customer)
    setSearchTerm('')
    setShowResults(false)
  }

  const handleClear = () => {
    onCustomerSelected(null as any)
    setSearchTerm('')
    setShowResults(false)
  }

  // Show selected customer
  if (selectedCustomer) {
    return (
      <div className="relative">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <FiUser className="text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-blue-900">
                {selectedCustomer.first_name} {selectedCustomer.last_name}
                {selectedCustomer.company_name && (
                  <span className="text-sm text-blue-600 ml-2">({selectedCustomer.company_name})</span>
                )}
              </p>
              <p className="text-sm text-blue-700">{selectedCustomer.email}</p>
              <p className="text-xs text-blue-600">Account: {selectedCustomer.account_number}</p>
            </div>
          </div>
          {!disabled && (
            <button
              onClick={handleClear}
              className="text-blue-600 hover:text-blue-800 p-2"
              title="Change customer"
            >
              <FiX className="text-xl" />
            </button>
          )}
        </div>
      </div>
    )
  }

  // Show search interface
  return (
    <div className="relative">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiSearch className="text-gray-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={disabled}
          className="pl-10 w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Search by name, email, phone, or account number..."
          autoFocus
        />
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && searchResults.length > 0 && (
        <div className="absolute z-10 w-full mt-2 bg-white border rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {searchResults.map((customer) => (
            <button
              key={customer.id}
              onClick={() => handleSelect(customer)}
              className="w-full text-left p-4 hover:bg-gray-50 border-b last:border-b-0 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FiUser className="text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">
                    {customer.first_name} {customer.last_name}
                    {customer.company_name && (
                      <span className="text-sm text-gray-600 ml-2">({customer.company_name})</span>
                    )}
                  </p>
                  <p className="text-sm text-gray-600 truncate">{customer.email}</p>
                  <div className="flex gap-4 text-xs text-gray-500 mt-1">
                    <span>Acct: {customer.account_number}</span>
                    {customer.phone && <span>{customer.phone}</span>}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No Results */}
      {showResults && searchResults.length === 0 && !loading && searchTerm.length >= 2 && (
        <div className="absolute z-10 w-full mt-2 bg-white border rounded-lg shadow-lg p-4 text-center text-gray-600">
          <p>No customers found matching "{searchTerm}"</p>
          <p className="text-sm mt-2">Try searching by name, email, phone, or account number</p>
        </div>
      )}
    </div>
  )
}
