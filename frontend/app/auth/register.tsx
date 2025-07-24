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
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { UserPlus } from 'lucide-react-native';

export default function Register() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, hasGoal } = useAuth();
  const router = useRouter();

  const handleRegister = async () => {
    if (!email || !username || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register(email, username, password);

      if (!hasGoal) {
        router.replace('/set-goal');
      } else {
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      Alert.alert('Registration Failed', error?.message || 'Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#eaf4fb]">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-center px-6"
      >
        <View className="bg-white rounded-3xl p-8 shadow-md">
          {/* Header */}
          <View className="items-center mb-8">
            <View className="bg-[#00cc88] rounded-full p-4 mb-3">
              <UserPlus size={32} color="white" />
            </View>
            <Text className="text-3xl font-bold text-gray-900 mb-1">Create Account</Text>
            <Text className="text-[#7a7a7a] text-center">
              Join us and start your fitness journey
            </Text>
          </View>

          {/* Form */}
          <View>
            {/* Email */}
            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">Email</Text>
              <TextInput
                className="bg-[#f4f4f5] rounded-xl px-4 py-4 text-gray-900 border border-gray-200"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            {/* Username */}
            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">Username</Text>
              <TextInput
                className="bg-[#f4f4f5] rounded-xl px-4 py-4 text-gray-900 border border-gray-200"
                placeholder="Enter your username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoComplete="username"
              />
            </View>

            {/* Password */}
            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">Password</Text>
              <TextInput
                className="bg-[#f4f4f5] rounded-xl px-4 py-4 text-gray-900 border border-gray-200"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
              />
            </View>

            {/* Confirm Password */}
            <View className="mb-6">
              <Text className="text-gray-700 font-medium mb-2">Confirm Password</Text>
              <TextInput
                className="bg-[#f4f4f5] rounded-xl px-4 py-4 text-gray-900 border border-gray-200"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoComplete="password"
              />
            </View>

            {/* Submit */}
            <TouchableOpacity
              className={`bg-[#00cc88] rounded-xl py-4 items-center mb-4 ${
                loading ? 'opacity-50' : ''
              }`}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text className="text-white font-bold text-lg">
                {loading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>

            {/* Link to Login */}
            <View className="flex-row justify-center mt-4">
              <Text className="text-[#7a7a7a]">Already have an account? </Text>
              <Link href="/auth/login" className="text-[#3aae68] font-bold">
                Sign In
              </Link>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
