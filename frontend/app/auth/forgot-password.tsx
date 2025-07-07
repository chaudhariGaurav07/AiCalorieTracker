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
import { Mail } from 'lucide-react-native';

const BASE_URL = 'https://aicalorietracker.onrender.com/api/v1';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/users/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        Alert.alert(
          'Success',
          'Password reset link sent to your email',
          [{ text: 'OK', onPress: () => router.replace('/auth/login') }]
        );
      } else {
        Alert.alert('Error', 'Failed to send reset link');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
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
          <View className="items-center mb-8">
            <View className="bg-accent-500 rounded-full p-4 mb-4">
              <Mail size={32} color="white" />
            </View>
            <Text className="text-3xl font-inter-bold text-gray-900">Reset Password</Text>
            <Text className="text-gray-600 font-inter mt-2 text-center">
              Enter your email to receive a password reset link
            </Text>
          </View>

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

            <TouchableOpacity
              className={`bg-accent-500 rounded-xl py-4 items-center ${loading ? 'opacity-50' : ''}`}
              onPress={handleForgotPassword}
              disabled={loading}
            >
              <Text className="text-white font-inter-bold text-lg">
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Text>
            </TouchableOpacity>

            <View className="flex-row justify-center mt-6">
              <Text className="text-gray-600 font-inter">Remember your password? </Text>
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
