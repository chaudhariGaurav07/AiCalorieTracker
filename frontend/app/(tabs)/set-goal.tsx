import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';

export default function SetGoalScreen() {
  const { token } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [goals, setGoals] = useState({
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
  });

  const fetchExistingGoal = async () => {
    try {
      const res = await fetch(`https://aicalorietracker.onrender.com/api/v1/goals/get`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setGoals({
          calories: String(data.calories || ''),
          protein: String(data.protein || ''),
          carbs: String(data.carbs || ''),
          fats: String(data.fats || ''),
        });
      }
    } catch (err) {
      console.error('Error fetching goal:', err);
    }
  };

  useEffect(() => {
    if (token) fetchExistingGoal();
  }, [token]);

  const handleSubmit = async () => {
    if (!goals.calories || !goals.protein || !goals.carbs || !goals.fats) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const payload = {
      calories: Number(goals.calories),
      protein: Number(goals.protein),
      carbs: Number(goals.carbs),
      fats: Number(goals.fats),
    };

    setLoading(true);
    try {
      const res = await fetch(`https://aicalorietracker.onrender.com/api/v1/goals/set`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to set goal');

      Alert.alert('Success', 'Goals saved successfully!', [
        { text: 'OK', onPress: () => router.replace('/(tabs)/dashboard') },
      ]);
    } catch (err) {
        if (err instanceof Error) {
          Alert.alert('Error', err.message);
        } else {
          Alert.alert('Error', 'Something went wrong');
        }
      } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView className="flex-1 bg-white px-6 pt-20 pb-10">
        <Text className="text-3xl font-bold text-center text-gray-800 mb-2">Set Your Goals</Text>
        <Text className="text-gray-600 text-center mb-8">
          Enter your daily calorie and macro goals
        </Text>

        {['calories', 'protein', 'carbs', 'fats'].map((field) => (
          <View key={field} className="mb-4">
            <Text className="text-gray-700 font-medium capitalize mb-2">
              {field} ({field === 'calories' ? 'kcal' : 'g'})
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
              keyboardType="numeric"
              placeholder={`Enter ${field}`}
              value={goals[field as keyof typeof goals]}
              onChangeText={(text) =>
                setGoals((prev) => ({ ...prev, [field]: text }))
              }
            />
          </View>
        ))}

        <TouchableOpacity
          className="bg-primary-500 mt-6 rounded-xl py-4"
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text className="text-white font-bold text-center text-lg">
            {loading ? 'Saving...' : 'Save Goals'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
