import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { User, Lock, Mail, LogOut } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://aicalorietracker.onrender.com/api/v1';

export default function Settings() {
  const { user, logout, token } = useAuth();
  const router = useRouter();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [editForm, setEditForm] = useState({
    email: user?.email || '',
    username: user?.username || '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleEditProfile = async () => {
    if (!editForm.email || !editForm.username) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/users/update-account`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem('user', JSON.stringify(data.data));
        Alert.alert('Success', 'Profile updated successfully');
        setShowEditProfile(false);
      } else {
        Alert.alert('Error', data.message || 'Failed to update profile');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/users/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          oldPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Password changed successfully');
        setShowChangePassword(false);
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        Alert.alert('Error', data.message || 'Failed to change password');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!user?.email) return;

    try {
      const response = await fetch(`${BASE_URL}/users/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Password reset link sent to your email');
      } else {
        Alert.alert('Error', data.message || 'Failed to send reset link');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/auth/login'); // redirect to login
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-6 py-4 bg-white">
        <Text className="text-2xl font-inter-bold text-gray-900">Settings</Text>
        <Text className="text-gray-600 font-inter mt-1">
          Manage your account and preferences
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="bg-white mx-6 mt-4 rounded-2xl p-6 shadow-sm">
          <View className="items-center mb-6">
            <View className="bg-primary-100 rounded-full w-20 h-20 items-center justify-center mb-3">
              <User size={32} color="#0ea5e9" />
            </View>
            <Text className="text-xl font-inter-bold text-gray-900">{user?.username}</Text>
            <Text className="text-gray-600 font-inter">{user?.email}</Text>
          </View>
        </View>

        <View className="bg-white mx-6 mt-4 rounded-2xl p-4 shadow-sm">
          <Text className="text-lg font-inter-bold text-gray-900 mb-4">
            Account Settings
          </Text>

          <TouchableOpacity
            className="flex-row items-center py-3 px-2 border-b border-gray-100"
            onPress={() => setShowEditProfile(true)}
          >
            <View className="bg-secondary-100 rounded-lg p-2 mr-3">
              <User size={20} color="#10b981" />
            </View>
            <Text className="flex-1 text-gray-900 font-inter">Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center py-3 px-2 border-b border-gray-100"
            onPress={() => setShowChangePassword(true)}
          >
            <View className="bg-accent-100 rounded-lg p-2 mr-3">
              <Lock size={20} color="#f59e0b" />
            </View>
            <Text className="flex-1 text-gray-900 font-inter">Change Password</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center py-3 px-2 border-b border-gray-100"
            onPress={handleForgotPassword}
          >
            <View className="bg-blue-100 rounded-lg p-2 mr-3">
              <Mail size={20} color="#3b82f6" />
            </View>
            <Text className="flex-1 text-gray-900 font-inter">Forgot Password</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center py-3 px-2"
            onPress={handleLogout}
          >
            <View className="bg-red-100 rounded-lg p-2 mr-3">
              <LogOut size={20} color="#ef4444" />
            </View>
            <Text className="flex-1 text-red-600 font-inter">Logout</Text>
          </TouchableOpacity>
        </View>

        <View className="h-6" />
      </ScrollView>

      {/* Profile Modal */}
      <Modal visible={showEditProfile} animationType="slide" transparent>
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-2xl p-6 mx-6 w-full max-w-sm">
            <Text className="text-xl font-inter-bold mb-4 text-gray-900">Edit Profile</Text>
            <TextInput
              className="bg-gray-100 rounded-xl px-4 py-3 mb-3 text-gray-800"
              placeholder="Email"
              value={editForm.email}
              onChangeText={(text) => setEditForm({ ...editForm, email: text })}
            />
            <TextInput
              className="bg-gray-100 rounded-xl px-4 py-3 mb-6 text-gray-800"
              placeholder="Username"
              value={editForm.username}
              onChangeText={(text) => setEditForm({ ...editForm, username: text })}
            />
            <View className="flex-row space-x-3">
              <TouchableOpacity
                className="flex-1 bg-gray-500 rounded-xl py-3 items-center"
                onPress={() => setShowEditProfile(false)}
              >
                <Text className="text-white font-inter-bold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 bg-primary-500 rounded-xl py-3 items-center ${
                  loading ? 'opacity-50' : ''
                }`}
                onPress={handleEditProfile}
                disabled={loading}
              >
                <Text className="text-white font-inter-bold">
                  {loading ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Password Modal */}
      <Modal visible={showChangePassword} animationType="slide" transparent>
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-2xl p-6 mx-6 w-full max-w-sm">
            <Text className="text-xl font-inter-bold mb-4 text-gray-900">Change Password</Text>
            <TextInput
              className="bg-gray-100 rounded-xl px-4 py-3 mb-3 text-gray-800"
              placeholder="Current Password"
              secureTextEntry
              value={passwordForm.currentPassword}
              onChangeText={(text) => setPasswordForm({ ...passwordForm, currentPassword: text })}
            />
            <TextInput
              className="bg-gray-100 rounded-xl px-4 py-3 mb-3 text-gray-800"
              placeholder="New Password"
              secureTextEntry
              value={passwordForm.newPassword}
              onChangeText={(text) => setPasswordForm({ ...passwordForm, newPassword: text })}
            />
            <TextInput
              className="bg-gray-100 rounded-xl px-4 py-3 mb-6 text-gray-800"
              placeholder="Confirm New Password"
              secureTextEntry
              value={passwordForm.confirmPassword}
              onChangeText={(text) => setPasswordForm({ ...passwordForm, confirmPassword: text })}
            />
            <View className="flex-row space-x-3">
              <TouchableOpacity
                className="flex-1 bg-gray-500 rounded-xl py-3 items-center"
                onPress={() => setShowChangePassword(false)}
              >
                <Text className="text-white font-inter-bold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 bg-primary-500 rounded-xl py-3 items-center ${
                  loading ? 'opacity-50' : ''
                }`}
                onPress={handleChangePassword}
                disabled={loading}
              >
                <Text className="text-white font-inter-bold">
                  {loading ? 'Changing...' : 'Change'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
