import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { usersApi } from '../api/users'

const UserContext = createContext(null)

const STORAGE_KEY = 'ecommerce.currentUserId'

export function UserProvider({ children }) {
  const [users, setUsers] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refreshUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const list = await usersApi.list()
      setUsers(list)
      const storedId = localStorage.getItem(STORAGE_KEY)
      if (storedId) {
        const match = list.find((u) => String(u.id) === storedId)
        if (match) setCurrentUser(match)
      }
      return list
    } catch (err) {
      setError(err)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshUsers()
  }, [refreshUsers])

  const selectUser = (user) => {
    setCurrentUser(user)
    if (user) {
      localStorage.setItem(STORAGE_KEY, String(user.id))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  const createAndSelectUser = async (payload) => {
    const created = await usersApi.create(payload)
    setUsers((prev) => [...prev, created])
    selectUser(created)
    return created
  }

  return (
    <UserContext.Provider
      value={{ users, currentUser, loading, error, refreshUsers, selectUser, createAndSelectUser }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used within a UserProvider')
  return ctx
}
