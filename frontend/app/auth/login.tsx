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
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const goalStatus = await login(email, password);
      if (!goalStatus) {
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
    <SafeAreaView className="flex-1 bg-[#eaf4fb]">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-center px-6"
      >
        <View className="bg-[#ffffff] rounded-3xl p-8 shadow-md">
          {/* Header */}
          <View className="items-center mb-8">
            <View className="bg-[#00cc88] rounded-full p-4 mb-3">
              <LogIn size={32} color="white" />
            </View>
            <Text className="text-3xl font-bold text-gray-900 mb-1">Welcome Back</Text>
            <Text className="text-[#7a7a7a] text-center">
              Sign in to continue your fitness journey
            </Text>
          </View>

          {/* Form */}
          <View>
            {/* Email Field */}
            <View className="mb-5">
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

            {/* Password Field */}
            <View className="mb-2">
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

            {/* Forgot Password */}
            <View className="w-full items-end mb-6">
              <Link href="/auth/forgot-password" className="text-[#3aae68] font-medium">
                Forgot Password?
              </Link>
            </View>

            {/* Sign In Button */}
            <TouchableOpacity
              className={`bg-[#00cc88] rounded-xl py-4 items-center mb-4 ${
                loading ? 'opacity-50' : ''
              }`}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text className="text-white font-bold text-lg">
                {loading ? 'Signing In...' : 'Sign In'}
              </Text>
            </TouchableOpacity>

            {/* Sign Up Prompt */}
            <View className="flex-row justify-center mt-4">
              <Text className="text-[#7a7a7a]">Don't have an account? </Text>
              <Link href="/auth/register" className="text-[#3aae68] font-bold">
                Sign Up
              </Link>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
