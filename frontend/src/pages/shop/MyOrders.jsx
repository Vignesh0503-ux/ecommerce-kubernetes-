import { useEffect, useState } from 'react'
import { ordersApi } from '../../api/orders'
import { productsApi } from '../../api/products'
import { useUser } from '../../context/UserContext'
import Loader from '../../components/Loader'
import { EmptyState, ErrorBanner } from '../../components/Feedback'

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

const STATUS_STYLES = {
  CREATED: 'bg-amber-50 text-amber-700',
  CONFIRMED: 'bg-blue-50 text-blue-700',
  COMPLETED: 'bg-brand-50 text-brand-700',
  CANCELLED: 'bg-red-50 text-red-600',
}

export default function MyOrders() {
  const { currentUser } = useUser()
  const [orders, setOrders] = useState([])
  const [productNames, setProductNames] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const [orderList, productList] = await Promise.all([ordersApi.list(), productsApi.list()])
      setOrders(orderList)
      setProductNames(Object.fromEntries(productList.map((p) => [p.id, p.name])))
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const mine = currentUser ? orders.filter((o) => o.userId === currentUser.id) : []

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-extrabold tracking-tight">My Orders</h1>
      <p className="mb-6 text-sm text-black/50">
        {currentUser ? `Showing orders for ${currentUser.name}` : 'Pick a customer from the top bar to see their orders.'}
      </p>

      <ErrorBanner error={error} onRetry={load} />

      {loading ? (
        <Loader label="Loading orders…" />
      ) : !currentUser ? (
        <EmptyState title="No customer selected" description='Use "Shopping as…" in the top bar.' />
      ) : mine.length === 0 ? (
        <EmptyState title="No orders yet" description="Anything you check out will show up here." />
      ) : (
        <div className="flex flex-col gap-3">
          {mine
            .slice()
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map((order) => (
              <div key={order.id} className="card flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-medium">
                    {productNames[order.productId] || `Product #${order.productId}`}
                  </p>
                  <p className="text-sm text-black/45">
                    Qty {order.quantity} · Order #{order.id}
                    {order.createdAt && ` · ${new Date(order.createdAt).toLocaleString()}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{currency.format(order.totalPrice || 0)}</span>
                  <span className={`badge ${STATUS_STYLES[order.status] || 'bg-black/5 text-black/60'}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
