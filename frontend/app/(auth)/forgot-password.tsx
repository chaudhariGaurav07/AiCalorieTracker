import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft } from 'lucide-react-native';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { forgotPassword } = useAuth();
  const router = useRouter();

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email); // 
      Alert.alert(
        'Success',
        'Reset instructions sent to your email.',
        [{ text: 'OK', onPress: () => router.push('/(auth)/login') }]
      );
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <LinearGradient colors={['#EF4444', '#DC2626']} className="flex-1">
        <View className="flex-1 justify-center px-6">
          <TouchableOpacity
            className="absolute top-12 left-6 bg-white/20 rounded-full p-2"
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>

          <View className="bg-white rounded-3xl p-8 shadow-2xl">
            <Text className="text-3xl font-bold text-center text-gray-800 mb-2">
              Reset Password
            </Text>
            <Text className="text-gray-600 text-center mb-8">
              Enter your email address and we'll send you instructions to reset your password
            </Text>

            <View className="space-y-4">
              <View>
                <Text className="text-gray-700 font-medium mb-2">Email</Text>
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity
                className="bg-red-600 rounded-xl py-3 mt-6"
                onPress={handleForgotPassword}
                disabled={loading}
              >
                <Text className="text-white font-semibold text-center text-lg">
                  {loading ? 'Sending...' : 'Send Reset Instructions'}
                </Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row justify-center mt-6">
              <Text className="text-gray-600">Remember your password? </Text>
              <TouchableOpacity onPress={() => router.push('./auth/login')}>
                <Text className="text-red-600 font-semibold">Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}
