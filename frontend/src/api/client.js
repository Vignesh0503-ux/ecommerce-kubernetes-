/**
 * API request helper
 */
export async function request(url, options = {}) {
  const headers = {
    ...(options.headers || {}),
  }

  // Only send Content-Type when the request actually has a body.
  // GET requests don't need it.
  if (options.body) {
    headers['Content-Type'] = 'application/json'
  }

  const res = await fetch(url, {
    ...options,
    headers,
  })

  if (res.status === 204) {
    return null
  }

  const isJson = res.headers
    .get('content-type')
    ?.includes('application/json')

  const body = isJson
    ? await res.json().catch(() => null)
    : null

  if (!res.ok) {
    const message =
      body?.message || `Request failed with status ${res.status}`

    const error = new Error(message)
    error.status = res.status
    error.body = body

    throw error
  }

  return body
}