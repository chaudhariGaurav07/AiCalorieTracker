
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native'
import { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { forgotPasswordRequest } from '../../lib/api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!email.trim()) return Alert.alert('Error', 'Email is required')
    try {
      setLoading(true)
      const res = await forgotPasswordRequest(email)
      if (res.success) {
        Alert.alert('Success', 'Reset link sent to your email')
        setEmail('')
      } else {
        Alert.alert('Error', res.message || 'Failed to send reset link')
      }
    } catch (err) {
      Alert.alert('Error', 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 justify-center items-center px-4 bg-white">
      <Text className="text-2xl font-bold mb-6 text-black">Forgot Password</Text>

      <TextInput
        placeholder="Enter your email"
        keyboardType="email-address"
        className="w-full px-4 py-3 rounded-lg bg-gray-100 mb-6"
        value={email}
        onChangeText={setEmail}
      />

      <TouchableOpacity
        onPress={handleSubmit}
        className="w-full bg-blue-600 py-3 rounded-lg"
        disabled={loading}
      >
        <Text className="text-center text-white font-semibold">
          {loading ? 'Sending...' : 'Send Reset Link'}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}
