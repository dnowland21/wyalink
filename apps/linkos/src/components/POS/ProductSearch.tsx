import { useState, useEffect, useRef } from 'react'
import { getInventory, getActivePlans, type Inventory, type Plan, type POSTransactionItem } from '@wyalink/supabase-client'
import { FiSearch, FiCamera, FiX, FiPackage, FiCreditCard } from 'react-icons/fi'
import { Html5Qrcode } from 'html5-qrcode'

interface ProductSearchProps {
  onAddItem: (item: POSTransactionItem) => void
  transactionType: string
}

type SearchResult = {
  id: string
  type: 'inventory' | 'plan'
  name: string
  description?: string
  price: number
  quantity_on_hand?: number
  data: Inventory | Plan
}

export default function ProductSearch({ onAddItem, transactionType }: ProductSearchProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [selectedItem, setSelectedItem] = useState<SearchResult | null>(null)
  const [quantity, setQuantity] = useState(1)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Search products
  useEffect(() => {
    const searchProducts = async () => {
      if (searchTerm.length < 2) {
        setSearchResults([])
        setShowResults(false)
        return
      }

      setLoading(true)
      const results: SearchResult[] = []

      // Search inventory
      const { data: inventoryData } = await getInventory({ search: searchTerm, status: 'available' })
      if (inventoryData) {
        inventoryData.forEach((item) => {
          results.push({
            id: item.id,
            type: 'inventory',
            name: item.item_name,
            description: item.item_description || undefined,
            price: item.retail_price || 0,
            quantity_on_hand: item.quantity_on_hand,
            data: item,
          })
        })
      }

      // Search plans (for activations and bill payments)
      if (transactionType === 'activation' || transactionType === 'bill_payment') {
        const { data: plansData } = await getActivePlans()
        if (plansData) {
          plansData
            .filter((plan) =>
              plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (plan.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
            )
            .forEach((plan) => {
              results.push({
                id: plan.id,
                type: 'plan',
                name: plan.name,
                description: plan.description || undefined,
                price: plan.price_monthly,
                data: plan,
              })
            })
        }
      }

      setSearchResults(results)
      setShowResults(true)
      setLoading(false)
    }

    const debounce = setTimeout(() => {
      searchProducts()
    }, 300)

    return () => clearTimeout(debounce)
  }, [searchTerm, transactionType])

  // Handle barcode scan from hardware scanner (keyboard input)
  useEffect(() => {
    let barcode = ''
    let timeout: NodeJS.Timeout

    const handleKeyPress = (e: KeyboardEvent) => {
      // Only capture if search input is focused
      if (document.activeElement !== searchInputRef.current) return

      // Enter key completes barcode
      if (e.key === 'Enter' && barcode.length > 0) {
        setSearchTerm(barcode)
        barcode = ''
        return
      }

      // Accumulate barcode characters
      if (e.key.length === 1) {
        barcode += e.key
        clearTimeout(timeout)
        timeout = setTimeout(() => {
          barcode = ''
        }, 100) // Reset after 100ms of no input
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
      const html5QrCode = new Html5Qrcode('barcode-scanner')
      scannerRef.current = html5QrCode

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // Successfully scanned
          setSearchTerm(decodedText)
          stopCameraScanner()
        },
        () => {
          // Scan error - ignore, just keep scanning
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

  const handleSelectItem = (item: SearchResult) => {
    setSelectedItem(item)
    setQuantity(1)
    setShowResults(false)
  }

  const handleAddToCart = () => {
    if (!selectedItem) return

    const item = selectedItem.data

    if (selectedItem.type === 'inventory') {
      const inventoryItem = item as Inventory
      onAddItem({
        item_type: 'inventory',
        inventory_id: inventoryItem.id,
        item_name: inventoryItem.item_name,
        quantity,
        unit_price: inventoryItem.retail_price || 0,
        subtotal: (inventoryItem.retail_price || 0) * quantity,
      } as POSTransactionItem)
    } else {
      const plan = item as Plan
      onAddItem({
        item_type: 'plan',
        plan_id: plan.id,
        item_name: plan.name,
        quantity,
        unit_price: plan.price_monthly,
        subtotal: plan.price_monthly * quantity,
      } as POSTransactionItem)
    }

    // Reset
    setSelectedItem(null)
    setSearchTerm('')
    setQuantity(1)
    searchInputRef.current?.focus()
  }

  // Show selected item for quantity selection
  if (selectedItem) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
              {selectedItem.type === 'inventory' ? (
                <FiPackage className="text-blue-600 text-xl" />
              ) : (
                <FiCreditCard className="text-blue-600 text-xl" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium text-blue-900">{selectedItem.name}</p>
              {selectedItem.description && (
                <p className="text-sm text-blue-700 mt-1">{selectedItem.description}</p>
              )}
              <p className="text-lg font-bold text-blue-900 mt-2">${selectedItem.price.toFixed(2)}</p>
              {selectedItem.quantity_on_hand !== undefined && (
                <p className="text-xs text-blue-600 mt-1">
                  In Stock: {selectedItem.quantity_on_hand}
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <label className="text-sm font-medium text-blue-900">Quantity:</label>
            <input
              type="number"
              min="1"
              max={selectedItem.quantity_on_hand || 999}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="w-20 p-2 border rounded text-center"
              autoFocus
            />
            <span className="text-sm text-blue-700">
              Total: ${(selectedItem.price * quantity).toFixed(2)}
            </span>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              onClick={() => {
                setSelectedItem(null)
                setSearchTerm('')
              }}
              className="flex-1 px-4 py-2 border border-blue-300 text-blue-700 rounded hover:bg-blue-100"
            >
              Cancel
            </button>
            <button
              onClick={handleAddToCart}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Show camera scanner
  if (showScanner) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Scan Barcode</h3>
          <button
            onClick={stopCameraScanner}
            className="text-gray-600 hover:text-gray-800"
          >
            <FiX className="text-xl" />
          </button>
        </div>
        <div id="barcode-scanner" className="w-full rounded border overflow-hidden"></div>
        <p className="text-sm text-gray-600 text-center">
          Position the barcode within the frame to scan
        </p>
      </div>
    )
  }

  // Show search interface
  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiSearch className="text-gray-400" />
        </div>
        <input
          ref={searchInputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-20 w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Scan barcode or search products..."
          autoFocus
        />
        <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-2">
          {loading && (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          )}
          <button
            onClick={startCameraScanner}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
            title="Scan with camera"
          >
            <FiCamera className="text-xl" />
          </button>
        </div>
      </div>

      {/* Search Results Dropdown */}
      {showResults && searchResults.length > 0 && (
        <div className="absolute z-10 w-full mt-2 bg-white border rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {searchResults.map((result) => (
            <button
              key={`${result.type}-${result.id}`}
              onClick={() => handleSelectItem(result)}
              className="w-full text-left p-4 hover:bg-gray-50 border-b last:border-b-0 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                  {result.type === 'inventory' ? (
                    <FiPackage className="text-gray-600" />
                  ) : (
                    <FiCreditCard className="text-gray-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">{result.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      result.type === 'inventory' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {result.type === 'inventory' ? 'Device' : 'Plan'}
                    </span>
                  </div>
                  {result.description && (
                    <p className="text-sm text-gray-600 truncate">{result.description}</p>
                  )}
                  <div className="flex gap-4 items-center mt-1">
                    <span className="font-medium text-blue-600">${result.price.toFixed(2)}</span>
                    {result.quantity_on_hand !== undefined && (
                      <span className="text-xs text-gray-500">Stock: {result.quantity_on_hand}</span>
                    )}
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
          <p>No products found matching "{searchTerm}"</p>
          <p className="text-sm mt-2">Try searching by product name or scanning a barcode</p>
        </div>
      )}
    </div>
  )
}
