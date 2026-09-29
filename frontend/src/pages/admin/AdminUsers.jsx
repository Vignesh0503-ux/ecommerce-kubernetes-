import { useEffect, useState } from 'react'
import { usersApi } from '../../api/users'
import Loader from '../../components/Loader'
import { EmptyState, ErrorBanner } from '../../components/Feedback'
import { useToast } from '../../components/Toast'

const empty = { name: '', email: '', phone: '' }

export default function AdminUsers() {
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
      setUsers(await usersApi.list())
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const created = await usersApi.create(form)
      setUsers((prev) => [...prev, created])
      setForm(empty)
      showToast('User created')
    } catch (err) {
      setError(err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await usersApi.remove(id)
      setUsers((prev) => prev.filter((u) => u.id !== id))
      showToast('User deleted', 'info')
    } catch (err) {
      setError(err)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <form onSubmit={handleSubmit} className="card h-fit space-y-3 p-4 lg:col-span-1">
        <h2 className="font-semibold">Add user</h2>
        <div>
          <label className="label">Name</label>
          <input
            required
            className="input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Email</label>
          <input
            required
            type="email"
            className="input"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Phone</label>
          <input
            className="input"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>
        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? 'Saving…' : 'Create user'}
        </button>
      </form>

      <div className="lg:col-span-2">
        <ErrorBanner error={error} onRetry={load} />
        {loading ? (
          <Loader />
        ) : users.length === 0 ? (
          <EmptyState title="No users yet" description="Create one using the form." />
        ) : (
          <div className="card divide-y divide-black/5">
            {users.map((u) => (
              <div key={u.id} className="flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-medium">{u.name}</p>
                  <p className="text-sm text-black/45">
                    {u.email} {u.phone && `· ${u.phone}`}
                  </p>
                </div>
                <button onClick={() => handleDelete(u.id)} className="btn-danger">
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
