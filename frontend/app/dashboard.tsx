import { useAuth } from '../src/context/AuthContext'
import { useRouter } from 'expo-router'
import { useEffect } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function Dashboard() {
  const { isLoggedIn, logout, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.replace('/login')
    }
  }, [isLoggedIn, loading])

  if (loading || !isLoggedIn) return null

  return (
    <SafeAreaView className="flex-1 justify-center items-center bg-white">
      <Text className="text-2xl font-bold text-black">Welcome to Dashboard 🎉</Text>

      <TouchableOpacity
        onPress={logout}
        className="mt-6 bg-red-600 px-4 py-2 rounded-md"
      >
        <Text className="text-white font-semibold">Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}
