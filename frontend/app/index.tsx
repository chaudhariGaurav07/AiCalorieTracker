import { useEffect } from 'react'
import { useRouter } from 'expo-router'
import { useAuth } from '../src/context/AuthContext'
import { ActivityIndicator, View } from 'react-native'
import '../global.css'
export default function Index() {
  const { isLoggedIn, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      router.replace(isLoggedIn ? '/(tabs)/dashboard' : '/(auth)/login')
    }
  }, [loading, isLoggedIn])

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color="blue" />
    </View>
  )
}