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

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const BASE_URL = 'https://aicalorietracker.onrender.com/api/v1';

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/users/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Password reset link sent to your email', [
          { text: 'OK', onPress: () => router.replace('/auth/login') },
        ]);
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
    <SafeAreaView className="flex-1 bg-[#f5f9ff]">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-center px-6"
      >
        <View className="bg-white p-6 rounded-3xl shadow-md border border-[#d0e3f0]">
          {/* Icon + Heading */}
          <View className="items-center mb-6">
            <View className="bg-[#ff7043] p-3 rounded-full">
              <Mail size={28} color="#fff" />
            </View>
            <Text className="text-2xl font-bold mt-3 text-[#222]">
              Forgot Password
            </Text>
            <Text className="text-center text-base text-[#777] mt-2">
              Enter your email address to receive a reset link.
            </Text>
          </View>

          {/* Input + Button */}
          <View className="gap-4">
            <View>
              <Text className="text-[#444] mb-1.5 font-semibold">Email</Text>
              <TextInput
                placeholder="you@example.com"
                placeholderTextColor="#aaa"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                className="bg-[#f0f4f8] p-3 rounded-xl border border-[#ccddee] text-black"
              />
            </View>

            <TouchableOpacity
              onPress={handleForgotPassword}
              disabled={loading}
              className={`p-3.5 rounded-xl items-center ${
                loading ? 'bg-[#ff7043bb]' : 'bg-[#ff7043]'
              }`}
            >
              <Text className="text-white text-base font-bold">
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Text>
            </TouchableOpacity>

            <View className="flex-row justify-center mt-2">
              <Text className="text-[#666]">Remember your password? </Text>
              <Link href="/auth/login">
                <Text className="text-[#ff7043] font-semibold">Sign In</Text>
              </Link>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
