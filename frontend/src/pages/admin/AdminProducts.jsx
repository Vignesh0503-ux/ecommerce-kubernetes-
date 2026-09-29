import { useEffect, useState } from 'react'
import { productsApi } from '../../api/products'
import Loader from '../../components/Loader'
import { EmptyState, ErrorBanner } from '../../components/Feedback'
import { useToast } from '../../components/Toast'

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const empty = { name: '', description: '', price: '', quantity: '' }

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState(empty)
  const { showToast } = useToast()

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      setProducts(await productsApi.list())
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
      const created = await productsApi.create({
        ...form,
        price: Number(form.price),
        quantity: Number(form.quantity),
      })
      setProducts((prev) => [...prev, created])
      setForm(empty)
      showToast('Product created')
    } catch (err) {
      setError(err)
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (p) => {
    setEditingId(p.id)
    setEditForm({ name: p.name, description: p.description || '', price: p.price, quantity: p.quantity })
  }

  const saveEdit = async (id) => {
    try {
      const updated = await productsApi.update(id, {
        ...editForm,
        price: Number(editForm.price),
        quantity: Number(editForm.quantity),
      })
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)))
      setEditingId(null)
      showToast('Product updated')
    } catch (err) {
      setError(err)
    }
  }

  const handleDelete = async (id) => {
    try {
      await productsApi.remove(id)
      setProducts((prev) => prev.filter((p) => p.id !== id))
      showToast('Product deleted', 'info')
    } catch (err) {
      setError(err)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <form onSubmit={handleSubmit} className="card h-fit space-y-3 p-4 lg:col-span-1">
        <h2 className="font-semibold">Add product</h2>
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
          <label className="label">Description</label>
          <textarea
            className="input"
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Price</label>
            <input
              required
              type="number"
              step="0.01"
              min="0"
              className="input"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Quantity</label>
            <input
              required
              type="number"
              min="0"
              className="input"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            />
          </div>
        </div>
        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? 'Saving…' : 'Create product'}
        </button>
      </form>

      <div className="lg:col-span-2">
        <ErrorBanner error={error} onRetry={load} />
        {loading ? (
          <Loader />
        ) : products.length === 0 ? (
          <EmptyState title="No products yet" description="Create one using the form." />
        ) : (
          <div className="card divide-y divide-black/5">
            {products.map((p) =>
              editingId === p.id ? (
                <div key={p.id} className="space-y-2 p-4">
                  <input
                    className="input"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                  <textarea
                    className="input"
                    rows={2}
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      step="0.01"
                      className="input"
                      value={editForm.price}
                      onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                    />
                    <input
                      type="number"
                      className="input"
                      value={editForm.quantity}
                      onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => saveEdit(p.id)} className="btn-primary">
                      Save
                    </button>
                    <button onClick={() => setEditingId(null)} className="btn-secondary">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div key={p.id} className="flex items-center justify-between gap-4 p-4">
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-sm text-black/45">
                      {currency.format(p.price)} · {p.quantity} in stock
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(p)} className="btn-secondary">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="btn-danger">
                      Delete
                    </button>
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </div>
    </div>
  )
}
