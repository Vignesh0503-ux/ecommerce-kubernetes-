const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

export default function ProductCard({ product, onAddToCart }) {
  const outOfStock = !product.quantity || product.quantity <= 0

  return (
    <div className="card flex flex-col overflow-hidden">
      <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100 text-4xl font-black text-brand-300">
        {product.name?.charAt(0)?.toUpperCase() || '?'}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="font-semibold leading-snug">{product.name}</h3>
        {product.description && (
          <p className="line-clamp-2 text-sm text-black/50">{product.description}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-lg font-bold">{currency.format(product.price || 0)}</span>
          <span className={`badge ${outOfStock ? 'bg-red-50 text-red-600' : 'bg-brand-50 text-brand-700'}`}>
            {outOfStock ? 'Out of stock' : `${product.quantity} in stock`}
          </span>
        </div>
        <button
          className="btn-primary mt-3 w-full"
          disabled={outOfStock}
          onClick={() => onAddToCart(product)}
        >
          Add to cart
        </button>
      </div>
    </div>
  )
}
