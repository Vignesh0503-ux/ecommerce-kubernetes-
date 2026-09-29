import { useEffect, useState } from 'react'
import { ordersApi } from '../../api/orders'
import { usersApi } from '../../api/users'
import { productsApi } from '../../api/products'
import Loader from '../../components/Loader'
import { EmptyState, ErrorBanner } from '../../components/Feedback'
import { useToast } from '../../components/Toast'

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const STATUSES = ['CREATED', 'CONFIRMED', 'CANCELLED', 'COMPLETED']

const STATUS_STYLES = {
  CREATED: 'bg-amber-50 text-amber-700',
  CONFIRMED: 'bg-blue-50 text-blue-700',
  COMPLETED: 'bg-brand-50 text-brand-700',
  CANCELLED: 'bg-red-50 text-red-600',
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [userNames, setUserNames] = useState({})
  const [productNames, setProductNames] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { showToast } = useToast()

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const [orderList, users, products] = await Promise.all([
        ordersApi.list(),
        usersApi.list(),
        productsApi.list(),
      ])
      setOrders(orderList)
      setUserNames(Object.fromEntries(users.map((u) => [u.id, u.name])))
      setProductNames(Object.fromEntries(products.map((p) => [p.id, p.name])))
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleStatusChange = async (id, status) => {
    try {
      const updated = await ordersApi.updateStatus(id, status)
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)))
      showToast(`Order #${id} marked ${status}`)
    } catch (err) {
      setError(err)
    }
  }

  return (
    <div>
      <ErrorBanner error={error} onRetry={load} />
      {loading ? (
        <Loader />
      ) : orders.length === 0 ? (
        <EmptyState title="No orders yet" description="Orders placed from the shop will appear here." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-black/5 text-black/45">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Qty</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {orders
                .slice()
                .sort((a, b) => b.id - a.id)
                .map((o) => (
                  <tr key={o.id}>
                    <td className="px-4 py-3 font-medium">#{o.id}</td>
                    <td className="px-4 py-3">{userNames[o.userId] || `User #${o.userId}`}</td>
                    <td className="px-4 py-3">{productNames[o.productId] || `Product #${o.productId}`}</td>
                    <td className="px-4 py-3">{o.quantity}</td>
                    <td className="px-4 py-3">{currency.format(o.totalPrice || 0)}</td>
                    <td className="px-4 py-3">
                      <select
                        value={o.status}
                        onChange={(e) => handleStatusChange(o.id, e.target.value)}
                        className={`badge border-0 ${STATUS_STYLES[o.status] || 'bg-black/5'}`}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
