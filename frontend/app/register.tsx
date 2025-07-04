import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native'
import { useState } from 'react'
import { useRouter } from 'expo-router'
import { registerUser } from '../lib/api'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function Register() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleRegister = async () => {
    if (!username || !email || !password) {
      return Alert.alert('Error', 'All fields are required')
    }

    try {
      setLoading(true)
      const res = await registerUser({ username, email, password })
      if (res.success) {
        Alert.alert('Success', 'Account created. Please login.')
        router.replace('/login')
      } else {
        Alert.alert('Error', res.message || 'Something went wrong')
      }
    } catch (err) {
      Alert.alert('Error', 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 justify-center items-center px-4 bg-white">
      <Text className="text-2xl font-bold mb-6 text-black">Register</Text>

      <TextInput
        placeholder="Username"
        className="w-full px-4 py-3 rounded-lg bg-gray-100 mb-3"
        onChangeText={setUsername}
        value={username}
      />

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
        onPress={handleRegister}
        className="w-full bg-green-600 py-3 rounded-lg"
      >
        <Text className="text-center text-white font-semibold">
          {loading ? 'Registering...' : 'Register'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.replace('/login')}>
        <Text className="mt-4 text-blue-600 font-medium">
          Already have an account? Login
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}
