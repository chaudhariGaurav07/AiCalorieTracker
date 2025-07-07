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

      // ✅ Redirect based on whether user has set goals
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
    <SafeAreaView className="flex-1 bg-gradient-to-br from-primary-50 to-secondary-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-center px-8"
      >
        <View className="bg-white rounded-3xl p-8 shadow-lg">
          {/* Header */}
          <View className="items-center mb-8">
            <View className="bg-secondary-500 rounded-full p-4 mb-4">
              <UserPlus size={32} color="white" />
            </View>
            <Text className="text-3xl font-inter-bold text-gray-900">Create Account</Text>
            <Text className="text-gray-600 font-inter mt-2 text-center">
              Join us and start your fitness journey
            </Text>
          </View>

          {/* Form */}
          <View className="space-y-4">
            <View>
              <Text className="text-gray-700 font-inter-medium mb-2">Email</Text>
              <TextInput
                className="bg-gray-50 rounded-xl px-4 py-4 text-gray-900 font-inter border border-gray-200 focus:border-primary-500"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <View>
              <Text className="text-gray-700 font-inter-medium mb-2">Username</Text>
              <TextInput
                className="bg-gray-50 rounded-xl px-4 py-4 text-gray-900 font-inter border border-gray-200 focus:border-primary-500"
                placeholder="Enter your username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoComplete="username"
              />
            </View>

            <View>
              <Text className="text-gray-700 font-inter-medium mb-2">Password</Text>
              <TextInput
                className="bg-gray-50 rounded-xl px-4 py-4 text-gray-900 font-inter border border-gray-200 focus:border-primary-500"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
              />
            </View>

            <View>
              <Text className="text-gray-700 font-inter-medium mb-2">Confirm Password</Text>
              <TextInput
                className="bg-gray-50 rounded-xl px-4 py-4 text-gray-900 font-inter border border-gray-200 focus:border-primary-500"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoComplete="password"
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              className={`bg-secondary-500 rounded-xl py-4 items-center ${
                loading ? 'opacity-50' : ''
              }`}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text className="text-white font-inter-bold text-lg">
                {loading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>

            {/* Redirect to Login */}
            <View className="flex-row justify-center mt-6">
              <Text className="text-gray-600 font-inter">Already have an account? </Text>
              <Link href="/auth/login" className="text-primary-600 font-inter-bold">
                Sign In
              </Link>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
