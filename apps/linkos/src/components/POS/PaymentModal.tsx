import { useState } from 'react'
import { Card, Button } from '@wyalink/ui'
import {
  type POSTransaction,
  type POSTransactionItem,
  type POSPaymentMethod,
  addTransactionPayment,
  completeTransaction,
  useAuth,
} from '@wyalink/supabase-client'
import { FiX, FiDollarSign, FiCreditCard, FiCheck, FiDelete } from 'react-icons/fi'

interface PaymentModalProps {
  transaction: POSTransaction
  items: POSTransactionItem[]
  onClose: () => void
  onComplete: () => void
}

interface Payment {
  method: POSPaymentMethod
  amount: number
  reference?: string
}

export default function PaymentModal({
  transaction,
  items,
  onClose,
  onComplete,
}: PaymentModalProps) {
  const { user } = useAuth()
  const [payments, setPayments] = useState<Payment[]>([])
  const [selectedMethod, setSelectedMethod] = useState<POSPaymentMethod>('cash')
  const [cashInput, setCashInput] = useState('')
  const [reference, setReference] = useState('')
  const [processing, setProcessing] = useState(false)

  // Calculate amounts
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0)
  const taxRate = 0.08 // Should come from settings
  const tax = subtotal * taxRate
  const grandTotal = subtotal + tax
  const amountPaid = payments.reduce((sum, p) => sum + p.amount, 0)
  const amountRemaining = grandTotal - amountPaid
  const cashAmount = parseFloat(cashInput || '0')
  const changeAmount = selectedMethod === 'cash' ? Math.max(0, cashAmount - amountRemaining) : 0

  const handleNumPadClick = (value: string) => {
    if (value === 'delete') {
      setCashInput(cashInput.slice(0, -1))
    } else if (value === '.') {
      if (!cashInput.includes('.')) {
        setCashInput(cashInput + '.')
      }
    } else {
      // Limit to 2 decimal places
      if (cashInput.includes('.')) {
        const [, decimal] = cashInput.split('.')
        if (decimal.length < 2) {
          setCashInput(cashInput + value)
        }
      } else {
        setCashInput(cashInput + value)
      }
    }
  }

  const handleQuickCash = (amount: number) => {
    setCashInput(amount.toString())
  }

  const handleAddPayment = () => {
    const amount = selectedMethod === 'cash' ? cashAmount : parseFloat(cashInput || '0')

    if (!amount || amount <= 0) {
      alert('Please enter a valid payment amount')
      return
    }

    if (amount > amountRemaining && selectedMethod !== 'cash') {
      alert('Payment amount cannot exceed remaining balance for this payment method')
      return
    }

    const paymentToAdd = Math.min(amount, amountRemaining)

    setPayments([
      ...payments,
      {
        method: selectedMethod,
        amount: selectedMethod === 'cash' ? cashAmount : paymentToAdd,
        reference: reference || undefined,
      },
    ])

    setCashInput('')
    setReference('')
  }

  const handleCompleteTransaction = async () => {
    if (amountRemaining > 0 && selectedMethod !== 'cash') {
      alert('Please collect full payment before completing the transaction')
      return
    }

    // Auto-add cash payment if entering cash amount
    if (selectedMethod === 'cash' && cashAmount >= amountRemaining && amountRemaining > 0) {
      handleAddPayment()
      // Wait a moment for state to update, then proceed
      setTimeout(() => processCompletion(), 100)
      return
    }

    processCompletion()
  }

  const processCompletion = async () => {
    if (!user) {
      alert('User not authenticated')
      return
    }

    setProcessing(true)

    try {
      // Add all payments to the transaction
      for (const payment of payments) {
        const paymentData: any = {
          payment_method: payment.method,
          amount: payment.amount,
        }

        // Add method-specific fields
        if (payment.method === 'cash') {
          paymentData.cash_tendered = payment.amount
          paymentData.change_given = Math.max(0, payment.amount - grandTotal)
        } else if (payment.method === 'credit_card' || payment.method === 'debit_card') {
          if (payment.reference) {
            paymentData.authorization_code = payment.reference
            if (payment.reference.length === 4 && /^\d+$/.test(payment.reference)) {
              paymentData.card_last_four = payment.reference
            }
          }
        } else if (payment.method === 'check' && payment.reference) {
          paymentData.check_number = payment.reference
        }

        const { error } = await addTransactionPayment(transaction.id, paymentData)

        if (error) {
          throw new Error(`Failed to add ${payment.method} payment: ${error.message}`)
        }
      }

      // Complete the transaction
      const { error: completeError } = await completeTransaction(transaction.id, user.id)

      if (completeError) {
        throw new Error(`Failed to complete transaction: ${completeError.message}`)
      }

      // TODO: Print receipt
      console.log('TODO: Print receipt for transaction:', transaction.id)

      // TODO: Open cash drawer if cash payment
      if (payments.some((p) => p.method === 'cash')) {
        console.log('TODO: Open cash drawer')
      }

      alert('Transaction completed successfully!')
      onComplete()
    } catch (error) {
      alert((error as Error).message)
      setProcessing(false)
    }
  }

  const paymentMethods: { value: POSPaymentMethod; label: string }[] = [
    { value: 'cash', label: 'Cash' },
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'debit_card', label: 'Debit Card' },
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between bg-gradient-to-r from-blue-600 to-teal-600">
          <h2 className="text-2xl font-bold text-white">Process Payment</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded transition-colors"
            disabled={processing}
          >
            <FiX className="text-2xl" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
            {/* Left Column - Cart Summary */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FiDollarSign className="text-blue-600" />
                Item Cart
              </h3>

              {/* Items List */}
              <div className="space-y-2 mb-6">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.item_name}</p>
                      <p className="text-sm text-gray-600">
                        Qty: {item.quantity} × ${item.unit_price.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${item.subtotal.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Applied Discounts */}
              {transaction.discount_total > 0 && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                  <FiCheck className="text-green-600" />
                  <span className="text-sm text-green-800">
                    Discount Applied: ${transaction.discount_total.toFixed(2)}
                  </span>
                </div>
              )}

              {/* Totals */}
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Tax ({(taxRate * 100).toFixed(0)}%)</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold pt-3 border-t border-gray-300">
                  <span>Grand Total</span>
                  <span className="text-blue-600">${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Applied Payments */}
              {payments.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold mb-3 text-gray-700">Applied Payments</h4>
                  <div className="space-y-2">
                    {payments.map((payment, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {payment.method === 'cash' ? (
                            <FiDollarSign className="text-green-600 text-xl" />
                          ) : (
                            <FiCreditCard className="text-green-600 text-xl" />
                          )}
                          <div>
                            <p className="font-medium capitalize text-green-900">
                              {payment.method.replace('_', ' ')}
                            </p>
                            {payment.reference && (
                              <p className="text-xs text-green-700">Ref: {payment.reference}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-green-700">${payment.amount.toFixed(2)}</span>
                          <button
                            onClick={() => setPayments(payments.filter((_, i) => i !== index))}
                            className="text-red-600 hover:bg-red-50 p-1 rounded transition-colors"
                            disabled={processing}
                          >
                            <FiX />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Payment Input */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Payment Method</h3>

              {/* Payment Method Tabs */}
              <div className="flex gap-2 mb-6">
                {paymentMethods.map((method) => (
                  <button
                    key={method.value}
                    onClick={() => setSelectedMethod(method.value)}
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                      selectedMethod === method.value
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {method.label}
                  </button>
                ))}
              </div>

              {/* Cash Payment Interface */}
              {selectedMethod === 'cash' && (
                <>
                  {/* Cash Amount Display */}
                  <div className="mb-4">
                    <div className="bg-gray-900 text-white p-6 rounded-lg text-right">
                      <div className="text-sm text-gray-400 mb-1">Cash Tendered</div>
                      <div className="text-4xl font-bold mb-4">
                        ${cashInput || '0.00'}
                      </div>
                    </div>
                  </div>

                  {/* Quick Cash Buttons */}
                  <div className="mb-4">
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        Math.ceil(amountRemaining),
                        Math.ceil(amountRemaining / 20) * 20,
                        Math.ceil(amountRemaining / 50) * 50,
                      ].filter((v, i, arr) => arr.indexOf(v) === i).map((amount) => (
                        <button
                          key={amount}
                          onClick={() => handleQuickCash(amount)}
                          className="p-3 bg-gradient-to-br from-teal-50 to-blue-50 border-2 border-teal-200 rounded-lg hover:border-teal-400 transition-all font-semibold text-gray-800"
                        >
                          ${amount}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Numeric Keypad */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0, 'delete'].map((key) => (
                      <button
                        key={key}
                        onClick={() => handleNumPadClick(key.toString())}
                        className={`p-4 rounded-lg font-semibold text-lg transition-all ${
                          key === 'delete'
                            ? 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                            : 'bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        {key === 'delete' ? <FiDelete className="mx-auto text-xl" /> : key}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Card Payment Interface */}
              {(selectedMethod === 'credit_card' || selectedMethod === 'debit_card') && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Amount
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FiDollarSign className="text-gray-400 text-xl" />
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        value={cashInput}
                        onChange={(e) => setCashInput(e.target.value)}
                        className="pl-12 w-full p-4 border-2 border-gray-300 rounded-lg text-2xl font-bold focus:border-blue-500 focus:outline-none"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Authorization Code (Optional)
                    </label>
                    <input
                      type="text"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      placeholder="Last 4 digits or confirmation code"
                    />
                  </div>

                  <button
                    onClick={() => setCashInput(amountRemaining.toFixed(2))}
                    className="w-full p-3 bg-blue-50 border-2 border-blue-200 rounded-lg hover:bg-blue-100 transition-all font-semibold text-blue-700 mb-4"
                  >
                    Use Exact Amount (${amountRemaining.toFixed(2)})
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer - Totals and Complete Button */}
        <div className="border-t bg-gradient-to-br from-gray-50 to-blue-50 p-6">
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Grand Total</div>
              <div className="text-3xl font-bold text-gray-900">${grandTotal.toFixed(2)}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">
                {selectedMethod === 'cash' ? 'Cash Tendered' : 'Amount Paid'}
              </div>
              <div className="text-3xl font-bold text-blue-600">
                ${(selectedMethod === 'cash' ? cashAmount : amountPaid).toFixed(2)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">
                {selectedMethod === 'cash' ? 'Change' : 'Remaining'}
              </div>
              <div className={`text-3xl font-bold ${
                selectedMethod === 'cash' ? 'text-green-600' : 'text-orange-600'
              }`}>
                ${(selectedMethod === 'cash' ? changeAmount : amountRemaining).toFixed(2)}
              </div>
            </div>
          </div>

          <Button
            onClick={handleCompleteTransaction}
            className="w-full h-16 text-xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            disabled={
              processing ||
              (selectedMethod === 'cash' ? cashAmount < amountRemaining : amountRemaining > 0)
            }
          >
            {processing ? (
              'Processing...'
            ) : (
              <>
                <FiCheck className="mr-2 text-2xl" />
                Complete Order
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  )
}
