import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface AuthContextType {
  token: string | null
  isLoggedIn: boolean
  loading: boolean
  login: (token: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface Props {
  children: ReactNode
}

export const AuthProvider = ({ children }: Props) => {
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadToken = async () => {
      const stored = await AsyncStorage.getItem('token')
      if (stored) setToken(stored)
      setLoading(false)
    }
    loadToken()
  }, [])

  const login = async (newToken: string) => {
    await AsyncStorage.setItem('token', newToken)
    setToken(newToken)
  }

  const logout = async () => {
    await AsyncStorage.removeItem('token')
    setToken(null)
  }

  return (
    <AuthContext.Provider
      value={{ token, isLoggedIn: !!token, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}
