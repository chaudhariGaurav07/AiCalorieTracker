import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Alert, SafeAreaView,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { Target } from 'lucide-react-native';

export default function SetGoal() {
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState<'sedentary' | 'light' | 'moderate' | 'active' | 'very active'>('moderate');
  const [goalType, setGoalType] = useState<'maintain' | 'gain' | 'loss'>('maintain');
  const [loading, setLoading] = useState(false);
  const { setGoal } = useAuth();
  const router = useRouter();

  const handleSetGoal = async () => {
    if (!age || !height || !weight) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const goalData = {
      gender,
      age: parseInt(age),
      height: parseInt(height),
      weight: parseInt(weight),
      activityLevel,
      goalType,
    };

    setLoading(true);
    try {
      await setGoal(goalData);
      router.replace('/(tabs)/add-meal');
    } catch (error) {
      Alert.alert('Error', 'Failed to set goal. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-br from-primary-50 to-secondary-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView 
        contentContainerStyle={{ justifyContent: 'center', flexGrow: 1 }}
         className="flex-1 px-8">
          <View className="bg-white rounded-3xl p-6 shadow-xl">
            <View className="items-center mb-6">
              <View className="bg-secondary-500 rounded-full p-4 mb-4">
                <Target size={32} color="white" />
              </View>
              <Text className="text-2xl font-bold text-gray-800">Set Your Calorie Goal</Text>
              <Text className="text-gray-600 text-center mt-1">
                We'll calculate the best calorie goal for you
              </Text>
            </View>

            {/* Gender */}
            <View className="mb-4">
              <Text className="text-gray-700 mb-1">Gender</Text>
              <View className="flex-row justify-between">
                {['male', 'female'].map((g) => (
                  <TouchableOpacity
                    key={g}
                    onPress={() => setGender(g as 'male' | 'female')}
                    className={`px-4 py-3 rounded-xl border ${
                      gender === g ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                    }`}
                  >
                    <Text className={`text-center ${gender === g ? 'text-white' : 'text-gray-700'}`}>
                      {g}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Age */}
            <View className="mb-4">
              <Text className="text-gray-700 mb-1">Age</Text>
              <TextInput
                keyboardType="numeric"
                value={age}
                onChangeText={setAge}
                placeholder="e.g. 21"
                className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3"
              />
            </View>

            {/* Height */}
            <View className="mb-4">
              <Text className="text-gray-700 mb-1">Height (cm)</Text>
              <TextInput
                keyboardType="numeric"
                value={height}
                onChangeText={setHeight}
                placeholder="e.g. 170"
                className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3"
              />
            </View>

            {/* Weight */}
            <View className="mb-4">
              <Text className="text-gray-700 mb-1">Weight (kg)</Text>
              <TextInput
                keyboardType="numeric"
                value={weight}
                onChangeText={setWeight}
                placeholder="e.g. 65"
                className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3"
              />
            </View>

            {/* Activity Level */}
            <View className="mb-4">
              <Text className="text-gray-700 mb-1">Activity Level</Text>
              <View className="flex-wrap flex-row gap-2">
                {['sedentary', 'light', 'moderate', 'active', 'very active'].map((level) => (
                  <TouchableOpacity
                    key={level}
                    onPress={() => setActivityLevel(level as any)}
                    className={`px-3 py-2 rounded-xl border ${
                      activityLevel === level ? 'bg-green-500 border-green-500' : 'border-gray-300'
                    }`}
                  >
                    <Text className={`${activityLevel === level ? 'text-white' : 'text-gray-700'}`}>
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Goal Type */}
            <View className="mb-4">
              <Text className="text-gray-700 mb-1">Goal</Text>
              <View className="flex-row justify-between">
                {['maintain', 'gain', 'loss'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setGoalType(type as any)}
                    className={`px-4 py-3 rounded-xl border ${
                      goalType === type ? 'bg-purple-500 border-purple-500' : 'border-gray-300'
                    }`}
                  >
                    <Text className={`${goalType === type ? 'text-white' : 'text-gray-700'}`}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Submit */}
            <TouchableOpacity
              className={`bg-blue-600 mt-4 py-4 rounded-xl ${loading ? 'opacity-60' : ''}`}
              onPress={handleSetGoal}
              disabled={loading}
            >
              <Text className="text-white font-semibold text-center text-lg">
                {loading ? 'Setting...' : 'Calculate & Save'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
