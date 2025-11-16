import { useState, useEffect } from 'react'
import { Card, Button } from '@wyalink/ui'
import { type Customer, type POSTransaction, getCustomerTransactions } from '@wyalink/supabase-client'
import { FiUser, FiPhone, FiMail, FiClock, FiExternalLink } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'

interface CustomerInfoProps {
  customer: Customer | null
  onClear?: () => void
  showActions?: boolean
}

export default function CustomerInfo({ customer, onClear, showActions = true }: CustomerInfoProps) {
  const navigate = useNavigate()
  const [recentTransactions, setRecentTransactions] = useState<POSTransaction[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (customer) {
      loadRecentTransactions()
    } else {
      setRecentTransactions([])
    }
  }, [customer?.id])

  const loadRecentTransactions = async () => {
    if (!customer) return

    setLoading(true)
    const { data, error } = await getCustomerTransactions(customer.id, 5)
    if (!error && data) {
      setRecentTransactions(data)
    }
    setLoading(false)
  }

  if (!customer) {
    return (
      <Card className="bg-gray-50 border-dashed">
        <div className="p-6 text-center">
          <FiUser className="mx-auto text-4xl text-gray-400 mb-2" />
          <p className="text-gray-600 font-medium">No Customer Selected</p>
          <p className="text-sm text-gray-500 mt-1">Select a customer to begin a transaction</p>
        </div>
      </Card>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50'
      case 'pending':
        return 'text-yellow-600 bg-yellow-50'
      case 'voided':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'sale':
        return 'Sale'
      case 'activation':
        return 'Activation'
      case 'bill_payment':
        return 'Bill Payment'
      case 'return':
        return 'Return'
      case 'refund':
        return 'Refund'
      default:
        return type
    }
  }

  return (
    <Card>
      <div className="p-4">
        {/* Customer Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-blue-100 rounded-full p-2">
                <FiUser className="text-blue-600 text-lg" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {customer.first_name} {customer.last_name}
                </h3>
                <p className="text-sm text-gray-600">Account #{customer.account_number}</p>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-1 ml-10">
              {customer.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiPhone className="text-gray-400" />
                  <span>{customer.phone}</span>
                </div>
              )}
              {customer.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiMail className="text-gray-400" />
                  <span>{customer.email}</span>
                </div>
              )}
            </div>
          </div>

          {showActions && onClear && (
            <Button
              onClick={onClear}
              variant="outline"
              size="sm"
            >
              Change
            </Button>
          )}
        </div>

        {/* Account Balance - TODO: Add when customer billing is implemented */}

        {/* Recent Transactions */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FiClock className="text-gray-400" />
              <h4 className="text-sm font-semibold text-gray-700">Recent Transactions</h4>
            </div>
            {showActions && (
              <Button
                onClick={() => navigate(`/customers/${customer.id}`)}
                variant="ghost"
                size="sm"
                className="text-xs"
              >
                <FiExternalLink className="mr-1" />
                View Profile
              </Button>
            )}
          </div>

          {loading ? (
            <div className="text-sm text-gray-500 text-center py-4">Loading...</div>
          ) : recentTransactions.length === 0 ? (
            <div className="text-sm text-gray-500 text-center py-4">No recent transactions</div>
          ) : (
            <div className="space-y-2">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-900">
                        {transaction.transaction_number}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(transaction.status)}`}>
                        {getTransactionTypeLabel(transaction.transaction_type)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {formatDate(transaction.created_at)} • {formatTime(transaction.created_at)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      ${transaction.total.toFixed(2)}
                    </div>
                    <div className={`text-xs capitalize ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
