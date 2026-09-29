import { useEffect, useMemo, useState } from 'react'
import { productsApi } from '../../api/products'
import ProductCard from '../../components/ProductCard'
import Loader from '../../components/Loader'
import { EmptyState, ErrorBanner } from '../../components/Feedback'
import { useCart } from '../../context/CartContext'
import { useToast } from '../../components/Toast'

export default function Shop() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const { addItem } = useCart()
  const { showToast } = useToast()

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const list = await productsApi.list()
      setProducts(list)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    if (!query.trim()) return products
    const q = query.toLowerCase()
    return products.filter(
      (p) => p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q),
    )
  }, [products, query])

  const handleAddToCart = (product) => {
    addItem(product, 1)
    showToast(`${product.name} added to cart`)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Shop</h1>
          <p className="mt-1 text-sm text-black/50">Browse everything in the product catalog.</p>
        </div>
        <input
          placeholder="Search products…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="input sm:w-64"
        />
      </div>

      <ErrorBanner error={error} onRetry={load} />

      {loading ? (
        <Loader label="Loading products…" />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No products found"
          description={
            products.length === 0
              ? 'Add some products from the Admin tab to get started.'
              : 'Try a different search term.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
          ))}
        </div>
      )}
    </div>
  )
}
