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
import { FiX, FiDollarSign, FiCreditCard, FiCheck } from 'react-icons/fi'

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
  const [paymentAmount, setPaymentAmount] = useState('')
  const [reference, setReference] = useState('')
  const [processing, setProcessing] = useState(false)

  // Calculate amounts
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0)
  const taxRate = 0.08 // Should come from settings
  const tax = subtotal * taxRate
  const total = subtotal + tax
  const amountPaid = payments.reduce((sum, p) => sum + p.amount, 0)
  const amountRemaining = total - amountPaid

  const handleAddPayment = () => {
    const amount = parseFloat(paymentAmount)
    if (!amount || amount <= 0) {
      alert('Please enter a valid payment amount')
      return
    }

    if (amount > amountRemaining) {
      if (selectedMethod !== 'cash') {
        alert('Payment amount cannot exceed remaining balance for this payment method')
        return
      }
    }

    setPayments([
      ...payments,
      {
        method: selectedMethod,
        amount,
        reference: reference || undefined,
      },
    ])

    setPaymentAmount('')
    setReference('')
  }

  const handleRemovePayment = (index: number) => {
    setPayments(payments.filter((_, i) => i !== index))
  }

  const handleCompleteTransaction = async () => {
    if (amountRemaining > 0) {
      alert('Please collect full payment before completing the transaction')
      return
    }

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
        } else if (payment.method === 'credit_card' || payment.method === 'debit_card') {
          if (payment.reference) {
            paymentData.authorization_code = payment.reference
            // If reference looks like last 4 digits
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

  const handleQuickCash = (amount: number) => {
    setSelectedMethod('cash')
    setPaymentAmount(amount.toString())
  }

  const change = selectedMethod === 'cash' ? parseFloat(paymentAmount || '0') - amountRemaining : 0

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Process Payment</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={processing}
            >
              <FiX className="text-2xl" />
            </button>
          </div>

          {/* Transaction Summary */}
          <div className="mb-6 p-4 bg-gray-50 rounded space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax ({(taxRate * 100).toFixed(0)}%)</span>
              <span className="font-medium">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold pt-2 border-t">
              <span>Total</span>
              <span className="text-blue-600">${total.toFixed(2)}</span>
            </div>
            {amountPaid > 0 && (
              <>
                <div className="flex justify-between text-sm text-green-600 pt-2 border-t">
                  <span>Amount Paid</span>
                  <span className="font-medium">${amountPaid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Remaining</span>
                  <span className="text-amber-600">${amountRemaining.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>

          {/* Applied Payments */}
          {payments.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Applied Payments</h3>
              <div className="space-y-2">
                {payments.map((payment, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded"
                  >
                    <div className="flex items-center gap-3">
                      {payment.method === 'cash' ? (
                        <FiDollarSign className="text-green-600 text-xl" />
                      ) : (
                        <FiCreditCard className="text-green-600 text-xl" />
                      )}
                      <div>
                        <p className="font-medium capitalize">{payment.method.replace('_', ' ')}</p>
                        {payment.reference && (
                          <p className="text-xs text-gray-600">Ref: {payment.reference}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-green-700">${payment.amount.toFixed(2)}</span>
                      <button
                        onClick={() => handleRemovePayment(index)}
                        className="text-red-600 hover:bg-red-50 p-1 rounded"
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

          {/* Payment Method Selection */}
          {amountRemaining > 0 && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['cash', 'credit_card', 'debit_card'] as POSPaymentMethod[]).map((method) => (
                    <button
                      key={method}
                      onClick={() => setSelectedMethod(method)}
                      className={`p-3 border rounded text-sm font-medium ${
                        selectedMethod === method
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {method === 'cash' ? 'Cash' : method === 'credit_card' ? 'Credit' : 'Debit'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Cash Buttons */}
              {selectedMethod === 'cash' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quick Cash</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[20, 50, 100, 200].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => handleQuickCash(amount)}
                        className="p-2 border border-gray-300 rounded hover:bg-gray-50 text-sm font-medium"
                      >
                        ${amount}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setPaymentAmount(amountRemaining.toFixed(2))}
                    className="mt-2 w-full p-2 border border-blue-300 rounded hover:bg-blue-50 text-sm font-medium text-blue-700"
                  >
                    Exact Amount (${amountRemaining.toFixed(2)})
                  </button>
                </div>
              )}

              {/* Payment Amount */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {selectedMethod === 'cash' ? 'Cash Received' : 'Payment Amount'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiDollarSign className="text-gray-400" />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="pl-10 w-full p-3 border rounded text-lg font-medium"
                    placeholder="0.00"
                    autoFocus
                  />
                </div>
                {selectedMethod === 'cash' && change > 0 && (
                  <p className="mt-2 text-sm text-green-600 font-medium">
                    Change: ${change.toFixed(2)}
                  </p>
                )}
              </div>

              {/* Reference Number (for card payments) */}
              {selectedMethod !== 'cash' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reference/Confirmation Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    className="w-full p-3 border rounded"
                    placeholder="Last 4 digits or confirmation code"
                  />
                </div>
              )}

              {/* Add Payment Button */}
              <Button
                onClick={handleAddPayment}
                variant="outline"
                className="w-full mb-6"
                disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
              >
                Add Payment
              </Button>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCompleteTransaction}
              variant="primary"
              className="flex-1"
              disabled={amountRemaining > 0 || processing}
            >
              {processing ? (
                'Processing...'
              ) : (
                <>
                  <FiCheck className="mr-2" />
                  Complete Transaction
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
