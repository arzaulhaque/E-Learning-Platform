import React, { createContext, useContext, useState } from 'react'
import api from '../api/axios'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })
  const [token, setToken] = useState(() => localStorage.getItem('token') || null)
  const [loading, setLoading] = useState(false)

  async function login(email, password) {
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      const { token, ...user } = data.data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      setToken(token)
      setUser(user)
    } finally {
      setLoading(false)
    }
  }

  async function register(name, email, password, role) {
    setLoading(true)
    try {
      const { data } = await api.post('/auth/register', { name, email, password, role })
      const { token, ...user } = data.data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      setToken(token)
      setUser(user)
    } finally {
      setLoading(false)
    }
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
