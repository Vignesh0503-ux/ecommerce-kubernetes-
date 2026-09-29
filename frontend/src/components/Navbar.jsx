import { NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useUser } from '../context/UserContext'
import { useCart } from '../context/CartContext'

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
          isActive ? 'bg-ink text-white' : 'text-black/60 hover:text-ink hover:bg-black/5'
        }`
      }
    >
      {children}
    </NavLink>
  )
}

export default function Navbar() {
  const { users, currentUser, selectUser, createAndSelectUser } = useUser()
  const { totalItems } = useCart()
  const navigate = useNavigate()
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const handleSelect = (e) => {
    const value = e.target.value
    if (value === '__new__') {
      setCreating(true)
      return
    }
    const user = users.find((u) => String(u.id) === value)
    selectUser(user || null)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return
    await createAndSelectUser({ name, email })
    setName('')
    setEmail('')
    setCreating(false)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-lg font-extrabold tracking-tight"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">S</span>
          Shopli
        </button>

        <nav className="hidden items-center gap-1 sm:flex">
          <NavItem to="/">Shop</NavItem>
          <NavItem to="/orders">My Orders</NavItem>
          <NavItem to="/admin">Admin</NavItem>
        </nav>

        <div className="flex items-center gap-3">
          {creating ? (
            <form onSubmit={handleCreate} className="flex items-center gap-1.5">
              <input
                autoFocus
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input w-28 py-1.5"
              />
              <input
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input w-40 py-1.5"
              />
              <button type="submit" className="btn-primary py-1.5">
                Save
              </button>
              <button type="button" onClick={() => setCreating(false)} className="btn-secondary py-1.5">
                Cancel
              </button>
            </form>
          ) : (
            <select
              value={currentUser ? String(currentUser.id) : ''}
              onChange={handleSelect}
              className="input w-44 py-1.5 text-sm"
            >
              <option value="" disabled>
                Shopping as…
              </option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
              <option value="__new__">+ New customer…</option>
            </select>
          )}

          <NavLink to="/cart" className="relative">
            <span className="btn-secondary">
              Cart
              {totalItems > 0 && (
                <span className="ml-1 rounded-full bg-brand-600 px-1.5 py-0.5 text-xs text-white">
                  {totalItems}
                </span>
              )}
            </span>
          </NavLink>
        </div>
      </div>

      <nav className="flex items-center gap-1 border-t border-black/5 px-4 py-1.5 sm:hidden">
        <NavItem to="/">Shop</NavItem>
        <NavItem to="/orders">Orders</NavItem>
        <NavItem to="/admin">Admin</NavItem>
      </nav>
    </header>
  )
}
