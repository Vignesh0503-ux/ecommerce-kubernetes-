import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useUser } from '../../context/UserContext'
import { ordersApi } from '../../api/orders'
import { notificationsApi } from '../../api/notifications'
import { EmptyState, ErrorBanner } from '../../components/Feedback'
import { useToast } from '../../components/Toast'

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

export default function Cart() {
  const { items, updateQuantity, removeItem, clearCart, totalPrice } = useCart()
  const { currentUser } = useUser()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState(null)

  const handleCheckout = async () => {
    if (!currentUser) {
      setError(new Error('Pick a customer from the top bar first ("Shopping as…").'))
      return
    }
    if (items.length === 0) return

    setPlacing(true)
    setError(null)
    try {
      // Order Service only supports one product per order, so place one order per cart line.
      const createdOrders = []
      for (const item of items) {
        const order = await ordersApi.create({
          userId: currentUser.id,
          productId: item.productId,
          quantity: item.quantity,
        })
        createdOrders.push(order)
      }

      await notificationsApi.create({
        userId: currentUser.id,
        message: `Order placed for ${createdOrders.length} item(s), total ${currency.format(totalPrice)}.`,
        type: 'ORDER_CREATED',
      })

      clearCart()
      showToast('Order placed! Check My Orders for status.')
      navigate('/orders')
    } catch (err) {
      setError(err)
    } finally {
      setPlacing(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <EmptyState
          title="Your cart is empty"
          description="Browse the shop and add a few products to see them here."
        />
        <div className="mt-4 text-center">
          <Link to="/" className="btn-primary">
            Go to shop
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-extrabold tracking-tight">Your Cart</h1>

      <ErrorBanner error={error} />

      <div className="card divide-y divide-black/5">
        {items.map((item) => (
          <div key={item.productId} className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-brand-50 font-bold text-brand-500">
              {item.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-black/45">{currency.format(item.price)} each</p>
            </div>
            <input
              type="number"
              min={1}
              max={item.availableQuantity || 99}
              value={item.quantity}
              onChange={(e) => updateQuantity(item.productId, Number(e.target.value))}
              className="input w-20 text-center"
            />
            <span className="w-20 text-right font-semibold">
              {currency.format(item.price * item.quantity)}
            </span>
            <button
              onClick={() => removeItem(item.productId)}
              className="text-sm text-black/40 hover:text-red-600"
              aria-label="Remove"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="card mt-6 flex items-center justify-between p-4">
        <span className="text-sm text-black/50">Total</span>
        <span className="text-xl font-extrabold">{currency.format(totalPrice)}</span>
      </div>

      {!currentUser && (
        <p className="mt-3 text-sm text-amber-700">
          Pick a customer from "Shopping as…" in the top bar before checking out.
        </p>
      )}

      <div className="mt-4 flex gap-3">
        <button onClick={clearCart} className="btn-secondary">
          Clear cart
        </button>
        <button onClick={handleCheckout} disabled={placing} className="btn-primary flex-1">
          {placing ? 'Placing order…' : 'Checkout'}
        </button>
      </div>
    </div>
  )
}
