import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { Target } from 'lucide-react-native';

export default function SetGoal() {
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState<
    'sedentary' | 'light' | 'moderate' | 'active' | 'very active'
  >('moderate');
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
    <SafeAreaView className="flex-1 bg-[#eaf4fb]">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} className="px-6">
          <View className="bg-white rounded-3xl p-8 shadow-md">
            {/* Header */}
            <View className="items-center mb-8">
              <View className="bg-[#00cc88] rounded-e-full p-4 mb-3">
                <Target size={32} color="white" />
              </View>
              <Text className="text-2xl font-bold text-gray-900 mb-1">Set Your Goal</Text>
              <Text className="text-[#7a7a7a] text-center">
                We'll calculate the best calorie goal for you
              </Text>
            </View>

            {/* Gender */}
            <View className="mb-4">
              <Text className="text-gray-700 mb-2 font-medium">Gender</Text>
              <View className="flex-row justify-between gap-2">
                {['male', 'female'].map((g) => (
                  <TouchableOpacity
                    key={g}
                    onPress={() => setGender(g as 'male' | 'female')}
                    className={`flex-1 py-3 rounded-xl border items-center ${
                      gender === g ? 'bg-[#00cc88] border-[#00cc88]' : 'border-gray-300'
                    }`}
                  >
                    <Text className={`font-semibold ${gender === g ? 'text-white' : 'text-gray-700'}`}>
                      {g}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Age */}
            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">Age</Text>
              <TextInput
                keyboardType="numeric"
                value={age}
                onChangeText={setAge}
                placeholder="e.g. 21"
                className="bg-[#f4f4f5] border border-gray-300 rounded-xl px-4 py-4 text-gray-900"
              />
            </View>

            {/* Height */}
            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">Height (cm)</Text>
              <TextInput
                keyboardType="numeric"
                value={height}
                onChangeText={setHeight}
                placeholder="e.g. 170"
                className="bg-[#f4f4f5] border border-gray-300 rounded-xl px-4 py-4 text-gray-900"
              />
            </View>

            {/* Weight */}
            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">Weight (kg)</Text>
              <TextInput
                keyboardType="numeric"
                value={weight}
                onChangeText={setWeight}
                placeholder="e.g. 65"
                className="bg-[#f4f4f5] border border-gray-300 rounded-xl px-4 py-4 text-gray-900"
              />
            </View>

            {/* Activity Level */}
            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">Activity Level</Text>
              <View className="flex-row flex-wrap gap-2">
                {['sedentary', 'light', 'moderate', 'active', 'very active'].map((level) => (
                  <TouchableOpacity
                    key={level}
                    onPress={() => setActivityLevel(level as any)}
                    className={`px-3 py-2 rounded-xl border ${
                      activityLevel === level ? 'bg-[#3aae68] border-[#3aae68]' : 'border-gray-300'
                    }`}
                  >
                    <Text className={`${activityLevel === level ? 'text-white' : 'text-gray-700'} font-medium`}>
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Goal Type */}
            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">Goal</Text>
              <View className="flex-row justify-between gap-2">
                {['maintain', 'gain', 'loss'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setGoalType(type as any)}
                    className={`flex-1 py-3 rounded-xl border items-center ${
                      goalType === type ? 'bg-purple-600 border-purple-600' : 'border-gray-300'
                    }`}
                  >
                    <Text className={`font-semibold ${goalType === type ? 'text-white' : 'text-gray-700'}`}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              className={`bg-[#00cc88] mt-4 py-4 rounded-xl items-center ${
                loading ? 'opacity-60' : ''
              }`}
              onPress={handleSetGoal}
              disabled={loading}
            >
              <Text className="text-white font-bold text-lg">
                {loading ? 'Setting...' : 'Calculate & Save'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
