import { useEffect, useState } from 'react'
import { notificationsApi } from '../../api/notifications'
import { usersApi } from '../../api/users'
import Loader from '../../components/Loader'
import { EmptyState, ErrorBanner } from '../../components/Feedback'
import { useToast } from '../../components/Toast'

const empty = { userId: '', message: '', type: 'GENERAL' }

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const { showToast } = useToast()

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const [list, userList] = await Promise.all([notificationsApi.list(), usersApi.list()])
      setNotifications(list)
      setUsers(userList)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const userNames = Object.fromEntries(users.map((u) => [u.id, u.name]))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const created = await notificationsApi.create({ ...form, userId: Number(form.userId) })
      setNotifications((prev) => [...prev, created])
      setForm(empty)
      showToast('Notification sent')
    } catch (err) {
      setError(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <form onSubmit={handleSubmit} className="card h-fit space-y-3 p-4 lg:col-span-1">
        <h2 className="font-semibold">Send notification</h2>
        <div>
          <label className="label">Customer</label>
          <select
            required
            className="input"
            value={form.userId}
            onChange={(e) => setForm({ ...form, userId: e.target.value })}
          >
            <option value="" disabled>
              Select a customer
            </option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Type</label>
          <input
            className="input"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Message</label>
          <textarea
            required
            rows={3}
            className="input"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
          />
        </div>
        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? 'Sending…' : 'Send'}
        </button>
      </form>

      <div className="lg:col-span-2">
        <ErrorBanner error={error} onRetry={load} />
        {loading ? (
          <Loader />
        ) : notifications.length === 0 ? (
          <EmptyState title="No notifications yet" />
        ) : (
          <div className="card divide-y divide-black/5">
            {notifications
              .slice()
              .sort((a, b) => b.id - a.id)
              .map((n) => (
                <div key={n.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">
                      {userNames[n.userId] || `User #${n.userId}`}
                    </span>
                    <span className="badge bg-black/5 text-black/60">{n.type}</span>
                  </div>
                  <p className="mt-1 text-sm text-black/60">{n.message}</p>
                  {n.createdAt && (
                    <p className="mt-1 text-xs text-black/35">{new Date(n.createdAt).toLocaleString()}</p>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
