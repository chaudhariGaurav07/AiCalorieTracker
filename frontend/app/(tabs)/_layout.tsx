import { useEffect } from 'react'
import { Tabs, useRouter } from 'expo-router'
import { useAuth } from '../../src/context/AuthContext'
import { View, ActivityIndicator } from 'react-native'

export default function TabsLayout() {
  const { isLoggedIn, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.replace('/(auth)/login')
    }
  }, [loading, isLoggedIn])

  if (loading || !isLoggedIn) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="blue" />
      </View>
    )
  }

  return (
    <Tabs screenOptions={{ headerShown: true }}>
      <Tabs.Screen name="dashboard" options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="add-meal" options={{ title: 'Add Meal' }} />
    </Tabs>
  )
}