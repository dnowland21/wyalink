import { useState, useRef, useEffect } from 'react'
import { Card, Button } from '@wyalink/ui'
import {
  type POSTransactionItem,
  addTransactionSerial,
  getInventorySerials,
} from '@wyalink/supabase-client'
import { FiX, FiCamera, FiCheck, FiPackage } from 'react-icons/fi'
import { Html5Qrcode } from 'html5-qrcode'

interface SerialNumberModalProps {
  item: POSTransactionItem
  transactionId: string
  onClose: () => void
  onComplete: () => void
}

interface CapturedSerial {
  serial_number: string
  imei?: string
  inventory_serial_id?: string
}

export default function SerialNumberModal({
  item,
  transactionId,
  onClose,
  onComplete,
}: SerialNumberModalProps) {
  const [capturedSerials, setCapturedSerials] = useState<CapturedSerial[]>([])
  const [currentSerial, setCurrentSerial] = useState('')
  const [currentImei, setCurrentImei] = useState('')
  const [showScanner, setShowScanner] = useState(false)
  const [saving, setSaving] = useState(false)
  const [availableSerials, setAvailableSerials] = useState<any[]>([])
  const [loadingSerials, setLoadingSerials] = useState(false)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const serialInputRef = useRef<HTMLInputElement>(null)

  const requiredCount = item.quantity
  const capturedCount = capturedSerials.length
  const isComplete = capturedCount >= requiredCount

  // Load available serials from inventory
  useEffect(() => {
    if (item.inventory_id) {
      loadAvailableSerials()
    }
  }, [item.inventory_id])

  const loadAvailableSerials = async () => {
    if (!item.inventory_id) return

    setLoadingSerials(true)
    const { data, error } = await getInventorySerials(item.inventory_id, 'available')

    if (!error && data) {
      setAvailableSerials(data)
    }
    setLoadingSerials(false)
  }

  // Handle barcode scan from hardware scanner (keyboard input)
  useEffect(() => {
    let barcode = ''
    let timeout: NodeJS.Timeout

    const handleKeyPress = (e: KeyboardEvent) => {
      // Only capture if serial input is focused
      if (document.activeElement !== serialInputRef.current) return

      // Enter key completes barcode
      if (e.key === 'Enter' && barcode.length > 0) {
        setCurrentSerial(barcode)
        barcode = ''
        return
      }

      // Accumulate barcode characters
      if (e.key.length === 1) {
        barcode += e.key
        clearTimeout(timeout)
        timeout = setTimeout(() => {
          barcode = ''
        }, 100)
      }
    }

    window.addEventListener('keypress', handleKeyPress)
    return () => {
      window.removeEventListener('keypress', handleKeyPress)
      clearTimeout(timeout)
    }
  }, [])

  // Start camera scanner
  const startCameraScanner = async () => {
    setShowScanner(true)

    try {
      const html5QrCode = new Html5Qrcode('serial-scanner')
      scannerRef.current = html5QrCode

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          setCurrentSerial(decodedText)
          stopCameraScanner()
        },
        () => {
          // Scan error - ignore
        }
      )
    } catch (err) {
      console.error('Error starting camera scanner:', err)
      alert('Failed to start camera. Please ensure camera permissions are granted.')
      setShowScanner(false)
    }
  }

  // Stop camera scanner
  const stopCameraScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().then(() => {
        scannerRef.current = null
        setShowScanner(false)
      })
    }
  }

  const handleAddSerial = () => {
    if (!currentSerial.trim()) {
      alert('Please enter a serial number')
      return
    }

    // Check for duplicates
    if (capturedSerials.some((s) => s.serial_number === currentSerial)) {
      alert('This serial number has already been added')
      return
    }

    // Check if this is from inventory serials
    const inventorySerial = availableSerials.find(
      (s) => s.serial_number === currentSerial || s.imei === currentSerial
    )

    setCapturedSerials([
      ...capturedSerials,
      {
        serial_number: inventorySerial?.serial_number || currentSerial,
        imei: inventorySerial?.imei || currentImei || undefined,
        inventory_serial_id: inventorySerial?.id,
      },
    ])

    setCurrentSerial('')
    setCurrentImei('')
    serialInputRef.current?.focus()
  }

  const handleRemoveSerial = (index: number) => {
    setCapturedSerials(capturedSerials.filter((_, i) => i !== index))
  }

  const handleSelectFromInventory = (inventorySerial: any) => {
    // Check for duplicates
    if (capturedSerials.some((s) => s.serial_number === inventorySerial.serial_number)) {
      alert('This serial number has already been added')
      return
    }

    setCapturedSerials([
      ...capturedSerials,
      {
        serial_number: inventorySerial.serial_number,
        imei: inventorySerial.imei,
        inventory_serial_id: inventorySerial.id,
      },
    ])
  }

  const handleSave = async () => {
    if (!isComplete) {
      alert(`Please capture all ${requiredCount} serial number(s)`)
      return
    }

    setSaving(true)

    try {
      // Add each serial to the transaction
      for (const serial of capturedSerials) {
        const { error } = await addTransactionSerial(transactionId, {
          transaction_item_id: item.id,
          inventory_id: item.inventory_id || '',
          serial_number: serial.serial_number,
          imei: serial.imei,
          inventory_serial_id: serial.inventory_serial_id,
        })

        if (error) {
          throw new Error(`Failed to add serial ${serial.serial_number}: ${error.message}`)
        }
      }

      onComplete()
    } catch (error) {
      alert((error as Error).message)
      setSaving(false)
    }
  }

  // Show camera scanner
  if (showScanner) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-full max-w-md">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Scan Serial Number</h3>
              <button
                onClick={stopCameraScanner}
                className="text-gray-600 hover:text-gray-800"
              >
                <FiX className="text-xl" />
              </button>
            </div>
            <div id="serial-scanner" className="w-full rounded border overflow-hidden"></div>
            <p className="text-sm text-gray-600 text-center mt-4">
              Position the barcode within the frame to scan
            </p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Capture Serial Numbers</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={saving}
            >
              <FiX className="text-2xl" />
            </button>
          </div>

          {/* Item Info */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded flex items-center justify-center">
                <FiPackage className="text-blue-600 text-xl" />
              </div>
              <div>
                <p className="font-medium text-blue-900">{item.item_name}</p>
                <p className="text-sm text-blue-700">
                  Quantity: {item.quantity} • Required serials: {requiredCount}
                </p>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className={`text-sm font-medium ${isComplete ? 'text-green-600' : 'text-amber-600'}`}>
                {capturedCount} / {requiredCount}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  isComplete ? 'bg-green-600' : 'bg-blue-600'
                }`}
                style={{ width: `${(capturedCount / requiredCount) * 100}%` }}
              />
            </div>
          </div>

          {/* Captured Serials */}
          {capturedSerials.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Captured Serial Numbers</h3>
              <div className="space-y-2">
                {capturedSerials.map((serial, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded"
                  >
                    <div>
                      <p className="font-medium text-green-900">
                        {serial.serial_number}
                      </p>
                      {serial.imei && (
                        <p className="text-xs text-green-700">IMEI: {serial.imei}</p>
                      )}
                      {serial.inventory_serial_id && (
                        <p className="text-xs text-green-600">✓ From inventory</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveSerial(index)}
                      className="text-red-600 hover:bg-red-50 p-2 rounded"
                      disabled={saving}
                    >
                      <FiX />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Serial Form */}
          {!isComplete && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Serial Number
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      ref={serialInputRef}
                      type="text"
                      value={currentSerial}
                      onChange={(e) => setCurrentSerial(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && currentSerial) {
                          e.preventDefault()
                          handleAddSerial()
                        }
                      }}
                      className="w-full p-3 pr-12 border rounded"
                      placeholder="Scan or enter serial number..."
                      autoFocus
                    />
                    <button
                      onClick={startCameraScanner}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="Scan with camera"
                    >
                      <FiCamera className="text-xl" />
                    </button>
                  </div>
                  <Button onClick={handleAddSerial} disabled={!currentSerial.trim()}>
                    Add
                  </Button>
                </div>
              </div>

              {/* Optional IMEI */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IMEI (Optional)
                </label>
                <input
                  type="text"
                  value={currentImei}
                  onChange={(e) => setCurrentImei(e.target.value)}
                  className="w-full p-3 border rounded"
                  placeholder="Enter IMEI if applicable..."
                />
              </div>

              {/* Available Serials from Inventory */}
              {item.inventory_id && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available from Inventory
                    {loadingSerials ? ' (Loading...)' : ` (${availableSerials.length})`}
                  </label>
                  {loadingSerials ? (
                    <div className="p-4 text-center text-gray-500">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    </div>
                  ) : availableSerials.length > 0 ? (
                    <div className="max-h-48 overflow-y-auto border rounded">
                      {availableSerials.map((serial) => (
                        <button
                          key={serial.id}
                          onClick={() => handleSelectFromInventory(serial)}
                          disabled={capturedSerials.some(
                            (s) => s.serial_number === serial.serial_number
                          )}
                          className="w-full text-left p-3 hover:bg-gray-50 border-b last:border-b-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <p className="font-medium text-sm">{serial.serial_number}</p>
                          {serial.imei && (
                            <p className="text-xs text-gray-600">IMEI: {serial.imei}</p>
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 p-3 border rounded">
                      No available serials in inventory
                    </p>
                  )}
                </div>
              )}
            </>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              variant="primary"
              className="flex-1"
              disabled={!isComplete || saving}
            >
              {saving ? (
                'Saving...'
              ) : (
                <>
                  <FiCheck className="mr-2" />
                  Save Serials
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
