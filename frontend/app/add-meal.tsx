
import { useState } from 'react'
import { Text, TextInput, TouchableOpacity, View, Alert, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuth } from '../src/context/AuthContext'
import { addMealEntry } from '../lib/api'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function AddMeal() {
  const [mealText, setMealText] = useState('')
  const [loading, setLoading] = useState(false)
  const { token } = useAuth()
  const router = useRouter()

  const handleAddMeal = async () => {
    if (!mealText.trim()) {
      return Alert.alert('Error', 'Please describe the meal')
    }

    try {
      setLoading(true)
      const res = await addMealEntry(mealText, token as string)

      if (res.success) {
        Alert.alert('Success', 'Meal added!')
        setMealText('')
        router.push('/dashboard')
      } else {
        Alert.alert('Error', res.message || 'Something went wrong')
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to add meal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white px-4">
      <ScrollView className="pt-10">
        <Text className="text-2xl font-bold text-center mb-6 text-black">Add Meal (Text)</Text>

        <TextInput
          placeholder="e.g. 2 eggs, 1 toast and milk"
          multiline
          numberOfLines={5}
          className="bg-gray-100 text-black rounded-lg p-4 mb-6 text-base"
          value={mealText}
          onChangeText={setMealText}
        />

        <TouchableOpacity
          onPress={handleAddMeal}
          className="bg-green-600 py-4 rounded-lg"
          disabled={loading}
        >
          <Text className="text-white text-center font-semibold">
            {loading ? 'Submitting...' : 'Analyze & Add Meal'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}
