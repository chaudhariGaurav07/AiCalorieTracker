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
import { LogIn } from 'lucide-react-native';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, hasGoal } = useAuth(); // ✅ include hasGoal
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);

      // ✅ Navigate based on goal
      if (!hasGoal) {
        router.replace('/set-goal');
      } else {
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', error?.message || 'Invalid credentials');
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
            <View className="bg-primary-500 rounded-full p-4 mb-4">
              <LogIn size={32} color="white" />
            </View>
            <Text className="text-3xl font-inter-bold text-gray-900">Welcome Back</Text>
            <Text className="text-gray-600 font-inter mt-2 text-center">
              Sign in to continue your fitness journey
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

            <Link
              href="/auth/forgot-password"
              className="text-primary-600 font-inter-medium text-right"
            >
              Forgot Password?
            </Link>

            <TouchableOpacity
              className={`bg-primary-500 rounded-xl py-4 items-center ${
                loading ? 'opacity-50' : ''
              }`}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text className="text-white font-inter-bold text-lg">
                {loading ? 'Signing In...' : 'Sign In'}
              </Text>
            </TouchableOpacity>

            <View className="flex-row justify-center mt-6">
              <Text className="text-gray-600 font-inter">Don't have an account? </Text>
              <Link href="/auth/register" className="text-primary-600 font-inter-bold">
                Sign Up
              </Link>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
