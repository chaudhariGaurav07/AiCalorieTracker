import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import { useState } from 'react'
import { useRouter } from 'expo-router'
import { loginUser } from '../lib/api'
import { storeToken } from '../lib/token'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async () => {
    try {
      setLoading(true)
      const response = await loginUser({ email, password })
      if (response.success) {
        await storeToken(response.data.accessToken)
        router.replace('/dashboard') // Redirect after login
      } else {
        alert(response.message)
      }
    } catch (err) {
      alert('Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 justify-center items-center px-4 bg-white">
      <Text className="text-2xl font-bold mb-6 text-black">Login</Text>

      <TextInput
        placeholder="Email"
        className="w-full px-4 py-3 rounded-lg bg-gray-100 mb-3"
        onChangeText={setEmail}
        value={email}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        className="w-full px-4 py-3 rounded-lg bg-gray-100 mb-6"
        onChangeText={setPassword}
        value={password}
      />

      <TouchableOpacity
        onPress={handleLogin}
        className="w-full bg-blue-600 py-3 rounded-lg"
      >
        <Text className="text-center text-white font-semibold">
          {loading ? 'Logging in...' : 'Login'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/register')}>
        <Text className="mt-4 text-blue-600 font-medium">Create account</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}
