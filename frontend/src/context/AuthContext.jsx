import { createContext, useState, useContext, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      // Token is automatically added by axios interceptor
      setUser({ token })
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    const { access_token } = response.data
    
    console.log('Login successful, token:', access_token.substring(0, 20) + '...')
    localStorage.setItem('token', access_token)
    setUser({ token: access_token })
    console.log('Token saved to localStorage')
    return access_token
  }

  const signup = async (email, password, name) => {
    await api.post('/auth/register', { email, password, name })
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
