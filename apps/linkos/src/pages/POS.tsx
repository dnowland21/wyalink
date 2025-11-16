import { useState, useEffect } from 'react'
import { Card, Button } from '@wyalink/ui'
import {
  useAuth,
  getCurrentSession,
  type POSSession,
  type POSTransaction,
  type Customer,
  type POSTransactionItem,
  createTransaction,
  addTransactionItem,
  getTransaction,
  getTransactionItems,
  getInventoryItem,
} from '@wyalink/supabase-client'
import SessionManager from '../components/POS/SessionManager'
import CustomerSelector from '../components/POS/CustomerSelector'
import CustomerInfo from '../components/POS/CustomerInfo'
import ProductSearch from '../components/POS/ProductSearch'
import ShoppingCart from '../components/POS/ShoppingCart'
import PaymentModal from '../components/POS/PaymentModal'
import SerialNumberModal from '../components/POS/SerialNumberModal'
import { FiShoppingCart, FiDollarSign, FiRepeat, FiPhone, FiUser } from 'react-icons/fi'

export default function POS() {
  const { user } = useAuth()
  const [currentSession, setCurrentSession] = useState<POSSession | null>(null)
  const [sessionLoading, setSessionLoading] = useState(true)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [currentTransaction, setCurrentTransaction] = useState<POSTransaction | null>(null)
  const [cartItems, setCartItems] = useState<POSTransactionItem[]>([])
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showSerialModal, setShowSerialModal] = useState(false)
  const [itemNeedingSerial, setItemNeedingSerial] = useState<POSTransactionItem | null>(null)
  const [transactionType, setTransactionType] = useState<'sale' | 'activation' | 'bill_payment' | 'return'>('sale')

  // Load current session on mount
  useEffect(() => {
    loadCurrentSession()
  }, [user])

  // Load cart items when transaction changes
  useEffect(() => {
    if (currentTransaction) {
      loadTransactionData()
    }
  }, [currentTransaction?.id])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs, textareas, or modals
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.closest('[role="dialog"]') ||
        showPaymentModal ||
        showSerialModal
      ) {
        return
      }

      switch (e.key) {
        case 'F9':
          e.preventDefault()
          if (currentTransaction && cartItems.length > 0) {
            handleCheckout()
          }
          break
        case 'Escape':
          e.preventDefault()
          if (currentTransaction) {
            if (confirm('Clear current transaction?')) {
              handleClearTransaction()
            }
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentTransaction, cartItems, showPaymentModal, showSerialModal])

  const loadCurrentSession = async () => {
    if (!user) return

    setSessionLoading(true)
    const { data, error } = await getCurrentSession(user.id)
    if (!error && data) {
      setCurrentSession(data)
    }
    setSessionLoading(false)
  }

  const loadTransactionData = async () => {
    if (!currentTransaction?.id) return

    console.log('Loading transaction data for:', currentTransaction.id)

    // Fetch transaction with all related data
    const { data: transactionData, error: transError } = await getTransaction(currentTransaction.id)
    if (transError) {
      console.error('Error loading transaction:', transError)
      return
    }

    // Also fetch items separately with inventory relation
    const { data: itemsData, error: itemsError } = await getTransactionItems(currentTransaction.id)
    if (itemsError) {
      console.error('Error loading items:', itemsError)
      return
    }

    console.log('Transaction data:', transactionData)
    console.log('Items data:', itemsData)

    if (transactionData) {
      setCurrentTransaction(transactionData)
    }

    if (itemsData) {
      setCartItems(itemsData)
    }
  }

  const handleSessionOpened = (session: POSSession) => {
    setCurrentSession(session)
  }

  const handleSessionClosed = () => {
    setCurrentSession(null)
    handleClearTransaction()
  }

  const handleCustomerSelected = (customer: Customer) => {
    setSelectedCustomer(customer)
  }

  const handleStartTransaction = async (type: typeof transactionType) => {
    if (!selectedCustomer || !currentSession || !user) {
      alert('Please select a customer and ensure a session is open')
      return
    }

    setTransactionType(type)

    const { data, error } = await createTransaction(
      {
        transaction_type: type,
        customer_id: selectedCustomer.id,
        session_id: currentSession.id,
      },
      user.id
    )

    if (error) {
      alert('Error creating transaction: ' + error.message)
      return
    }

    setCurrentTransaction(data)
  }

  const handleAddItem = async (item: POSTransactionItem) => {
    if (!currentTransaction) {
      alert('Please start a transaction first')
      return
    }

    console.log('Adding item:', item)

    const { data: addedItem, error } = await addTransactionItem(currentTransaction.id, {
      item_type: item.item_type,
      inventory_id: item.inventory_id || undefined,
      plan_id: item.plan_id || undefined,
      item_name: item.item_name,
      item_description: item.item_description || undefined,
      item_sku: item.item_sku || undefined,
      quantity: item.quantity,
      unit_price: item.unit_price,
      discount_amount: item.discount_amount || undefined,
      tax_amount: item.tax_amount || undefined,
    })

    if (error) {
      console.error('Error adding item:', error)
      alert('Error adding item: ' + error.message)
      return
    }

    console.log('Item added successfully:', addedItem)

    // Reload transaction data
    await loadTransactionData()

    // Check if item needs serial number capture
    if (addedItem && item.inventory_id) {
      console.log('Checking if inventory item needs serial tracking...')
      // Fetch the inventory item to check if it tracks serial numbers
      const { data: inventoryData, error: inventoryError } = await getInventoryItem(item.inventory_id)

      if (inventoryError) {
        console.error('Error fetching inventory item:', inventoryError)
      } else if (inventoryData) {
        console.log('Inventory item:', inventoryData)
        console.log('Track serial numbers:', inventoryData.track_serial_numbers)

        if (inventoryData.track_serial_numbers) {
          console.log('Opening serial number modal...')
          setItemNeedingSerial(addedItem)
          setShowSerialModal(true)
        }
      }
    }
  }

  const handleCheckout = () => {
    if (!currentTransaction || cartItems.length === 0) {
      alert('Cart is empty')
      return
    }

    setShowPaymentModal(true)
  }

  const handlePaymentComplete = () => {
    setShowPaymentModal(false)
    handleClearTransaction()
  }

  const handleSerialsCaptured = async () => {
    setShowSerialModal(false)
    setItemNeedingSerial(null)
    // Reload to show updated serials
    await loadTransactionData()
  }

  const handleClearTransaction = () => {
    setCurrentTransaction(null)
    setCartItems([])
    setSelectedCustomer(null)
  }

  const calculateCartTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.subtotal, 0)
  }

  // No session open - show session manager
  if (sessionLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading session...</div>
      </div>
    )
  }

  if (!currentSession) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Point of Sale</h1>
          <p className="text-gray-600 mt-1">Open a session to begin processing transactions</p>
        </div>
        <SessionManager onSessionOpened={handleSessionOpened} />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header with session info */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Point of Sale</h1>
          <p className="text-sm text-gray-600 mt-1">
            Session: {currentSession.session_number} | Register: {currentSession.register_name}
          </p>
        </div>
        <SessionManager
          currentSession={currentSession}
          onSessionClosed={handleSessionClosed}
        />
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Left Panel - Customer & Products */}
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
          {/* Customer Section */}
          {!currentTransaction ? (
            <div className="space-y-4">
              {/* Customer Selection */}
              <Card>
                <div className="p-5">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FiUser className="text-blue-600" />
                    Customer
                  </h2>
                  <CustomerSelector
                    selectedCustomer={selectedCustomer}
                    onCustomerSelected={handleCustomerSelected}
                    disabled={!!currentTransaction}
                  />
                </div>
              </Card>

              {/* Customer Info Card */}
              <CustomerInfo
                customer={selectedCustomer}
                onClear={() => setSelectedCustomer(null)}
                showActions={true}
              />

              {/* Transaction Type Selection - Large Touch-Friendly Buttons */}
              {selectedCustomer && (
                <Card className="bg-gradient-to-br from-blue-50 to-teal-50 border-blue-200">
                  <div className="p-5">
                    <h2 className="text-lg font-semibold mb-4 text-gray-900">Start Transaction</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        onClick={() => handleStartTransaction('sale')}
                        variant="outline"
                        className="flex flex-col items-center justify-center gap-3 h-28 bg-white hover:bg-blue-50 hover:border-blue-400 transition-all text-base font-semibold"
                      >
                        <FiShoppingCart className="text-3xl text-blue-600" />
                        <span>New Sale</span>
                      </Button>
                      <Button
                        onClick={() => handleStartTransaction('activation')}
                        variant="outline"
                        className="flex flex-col items-center justify-center gap-3 h-28 bg-white hover:bg-teal-50 hover:border-teal-400 transition-all text-base font-semibold"
                      >
                        <FiPhone className="text-3xl text-teal-600" />
                        <span>Activation</span>
                      </Button>
                      <Button
                        onClick={() => handleStartTransaction('bill_payment')}
                        variant="outline"
                        className="flex flex-col items-center justify-center gap-3 h-28 bg-white hover:bg-orange-50 hover:border-orange-400 transition-all text-base font-semibold"
                      >
                        <FiDollarSign className="text-3xl text-orange-600" />
                        <span>Bill Payment</span>
                      </Button>
                      <Button
                        onClick={() => handleStartTransaction('return')}
                        variant="outline"
                        className="flex flex-col items-center justify-center gap-3 h-28 bg-white hover:bg-red-50 hover:border-red-400 transition-all text-base font-semibold"
                      >
                        <FiRepeat className="text-3xl text-red-600" />
                        <span>Return/Refund</span>
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          ) : (
            <div className="space-y-4 flex-1 flex flex-col">
              {/* Customer Info - Compact View During Transaction */}
              <CustomerInfo
                customer={selectedCustomer}
                showActions={false}
              />

              {/* Product Search */}
              <Card className="flex-1 flex flex-col">
                <div className="p-5 flex-1 flex flex-col">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FiShoppingCart className="text-blue-600" />
                    Add Items
                  </h2>
                  <ProductSearch
                    onAddItem={handleAddItem}
                    transactionType={transactionType}
                  />
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Right Panel - Shopping Cart */}
        <div className="w-96 flex flex-col">
          <Card className="flex-1 flex flex-col">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Cart</h2>
              {currentTransaction && (
                <p className="text-sm text-gray-600">
                  {currentTransaction.transaction_number}
                </p>
              )}
            </div>

            <div className="flex-1 overflow-hidden">
              <ShoppingCart
                items={cartItems}
                transaction={currentTransaction}
                onReload={loadTransactionData}
              />
            </div>

            {/* Cart Total & Checkout */}
            <div className="p-5 border-t bg-gradient-to-br from-gray-50 to-blue-50">
              <div className="flex justify-between items-center mb-5 pb-4 border-b border-gray-200">
                <span className="text-lg font-semibold text-gray-700">Total:</span>
                <span className="text-3xl font-bold text-blue-600">
                  ${calculateCartTotal().toFixed(2)}
                </span>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleClearTransaction}
                  variant="outline"
                  className="flex-1 h-14 text-base font-semibold hover:bg-red-50 hover:border-red-300 hover:text-red-700"
                  disabled={!currentTransaction}
                  title="Press ESC to clear"
                >
                  <div className="flex flex-col items-center">
                    <span>Clear</span>
                    <span className="text-xs font-normal text-gray-500">ESC</span>
                  </div>
                </Button>
                <Button
                  onClick={handleCheckout}
                  variant="primary"
                  className="flex-1 h-14 text-base font-semibold bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                  disabled={!currentTransaction || cartItems.length === 0}
                  title="Press F9 to checkout"
                >
                  <div className="flex flex-col items-center">
                    <span>Checkout</span>
                    <span className="text-xs font-normal opacity-80">F9</span>
                  </div>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && currentTransaction && (
        <PaymentModal
          transaction={currentTransaction}
          items={cartItems}
          onClose={() => setShowPaymentModal(false)}
          onComplete={handlePaymentComplete}
        />
      )}

      {/* Serial Number Modal */}
      {showSerialModal && itemNeedingSerial && currentTransaction && (
        <SerialNumberModal
          item={itemNeedingSerial}
          transactionId={currentTransaction.id}
          onClose={() => {
            setShowSerialModal(false)
            setItemNeedingSerial(null)
          }}
          onComplete={handleSerialsCaptured}
        />
      )}
    </div>
  )
}
