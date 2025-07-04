
import { createContext, useContext, useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getToken, clearToken, storeToken } from '../../lib/token'

interface AuthContextType {
  isLoggedIn: boolean
  token: string | null
  login: (token: string) => Promise<void>
  logout: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadToken = async () => {
      const stored = await getToken()
      if (stored) setToken(stored)
      setLoading(false)
    }
    loadToken()
  }, [])

  const login = async (newToken: string) => {
    await storeToken(newToken)
    setToken(newToken)
  }

  const logout = async () => {
    await clearToken()
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn: !!token, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
