export function EmptyState({ title, description }) {
  return (
    <div className="rounded-xl border border-dashed border-black/15 py-16 text-center">
      <p className="text-sm font-semibold text-black/70">{title}</p>
      {description && <p className="mt-1 text-sm text-black/45">{description}</p>}
    </div>
  )
}

export function ErrorBanner({ error, onRetry }) {
  if (!error) return null
  return (
    <div className="mb-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      <span>{error.message || 'Something went wrong.'}</span>
      {onRetry && (
        <button onClick={onRetry} className="font-semibold underline underline-offset-2">
          Retry
        </button>
      )}
    </div>
  )
}
