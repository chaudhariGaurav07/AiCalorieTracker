import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen() {
  const [identifier, setIdentifier] = useState(''); // email or username
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login , hasGoal} = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!identifier || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
  
    setLoading(true);
    try {
      await login(identifier, password); // Auth + checkGoal internally

      if (!hasGoal) {
        router.replace('/set-goal');
      } else {
        router.replace('/dashboard');
      }
     
    } catch (error: any) {
      Alert.alert('Login Error', error?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <LinearGradient colors={['#3B82F6', '#1D4ED8']} className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View className="flex-1 justify-center px-6">
            <View className="bg-white rounded-3xl p-8 shadow-2xl">
              <Text className="text-3xl font-bold text-center text-gray-800 mb-2">
                Welcome Back!
              </Text>
              <Text className="text-gray-600 text-center mb-8">
                Sign in to continue your fitness journey
              </Text>

              <View className="space-y-4">
                <View>
                  <Text className="text-gray-700 font-medium mb-2">
                    Email or Username
                  </Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                    placeholder="Enter email or username"
                    value={identifier}
                    onChangeText={setIdentifier}
                    autoCapitalize="none"
                  />
                </View>

                <View>
                  <Text className="text-gray-700 font-medium mb-2">Password</Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                </View>

                <TouchableOpacity
                  className="bg-blue-600 rounded-xl py-3 mt-6"
                  onPress={handleLogin}
                  disabled={loading}
                >
                  <Text className="text-white font-semibold text-center text-lg">
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="py-2"
                  onPress={() => router.push('./auth/forgot-password')}
                >
                  <Text className="text-blue-600 text-center font-medium">
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="flex-row justify-center mt-6">
                <Text className="text-gray-600">Don't have an account? </Text>
                <TouchableOpacity onPress={() => router.push('./auth/register')}>
                  <Text className="text-blue-600 font-semibold">Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}
