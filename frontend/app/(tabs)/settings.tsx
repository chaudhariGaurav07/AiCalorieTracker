import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { User, Lock, Mail, LogOut, Scan, CreditCard as Edit2, Save, X } from 'lucide-react-native';

export default function SettingsScreen() {
  const { user, logout, updateProfile, changePassword } = useAuth();
  const router = useRouter();
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [profileData, setProfileData] = useState({
    email: user?.email || '',
    username: user?.username || '',
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleProfileUpdate = async () => {
    if (!profileData.email || !profileData.username) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await updateProfile(profileData.email, profileData.username);
      Alert.alert('Success', 'Profile updated successfully');
      setShowProfileEdit(false);
    } catch (err) {
      const error = err as Error;
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      await changePassword(passwordData.oldPassword, passwordData.newPassword);
      Alert.alert('Success', 'Password changed successfully');
      setShowPasswordChange(false);
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      const error = err as Error;
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          }
        }
      ]
    );
  };

  const openBarcodeScanner = () => {
    router.push('/barcode-scanner');
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="px-4 pt-12 pb-6">
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-800">Settings</Text>
          <Text className="text-gray-600 mt-1">
            Manage your account and preferences
          </Text>
        </View>

        {/* Profile Section */}
        <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-gray-800">Profile</Text>
            <User size={24} color="#3B82F6" />
          </View>
          
          <View className="space-y-4">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-sm text-gray-600">Username</Text>
                <Text className="text-lg font-medium text-gray-800">{user?.username}</Text>
              </View>
              <TouchableOpacity
                className="bg-gray-100 rounded-lg p-2"
                onPress={() => setShowProfileEdit(true)}
              >
                <Edit2 size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-sm text-gray-600">Email</Text>
                <Text className="text-lg font-medium text-gray-800">{user?.email}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Security Section */}
        <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-gray-800">Security</Text>
            <Lock size={24} color="#3B82F6" />
          </View>
          
          <TouchableOpacity
            className="flex-row items-center justify-between py-3 border-b border-gray-100"
            onPress={() => setShowPasswordChange(true)}
          >
            <View>
              <Text className="font-medium text-gray-800">Change Password</Text>
              <Text className="text-sm text-gray-600">Update your account password</Text>
            </View>
            <Lock size={20} color="#6B7280" />
          </TouchableOpacity>
          
          <TouchableOpacity
            className="flex-row items-center justify-between py-3"
            onPress={() => router.push('/(auth)/forgot-password')}
          >
            <View>
              <Text className="font-medium text-gray-800">Forgot Password</Text>
              <Text className="text-sm text-gray-600">Reset your password via email</Text>
            </View>
            <Mail size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Tools Section */}
        <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-gray-800">Tools</Text>
            <Scan size={24} color="#3B82F6" />
          </View>
          
          <TouchableOpacity
            className="flex-row items-center justify-between py-3"
            onPress={openBarcodeScanner}
          >
            <View>
              <Text className="font-medium text-gray-800">Barcode Scanner</Text>
              <Text className="text-sm text-gray-600">Scan product barcodes for quick entry</Text>
            </View>
            <Scan size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity
          className="bg-danger-500 rounded-2xl p-4 flex-row items-center justify-center"
          onPress={handleLogout}
        >
          <LogOut size={24} color="white" />
          <Text className="text-white font-semibold text-lg ml-2">Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Edit Modal */}
      <Modal
        visible={showProfileEdit}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowProfileEdit(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-2xl p-6 mx-6 w-full max-w-sm">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-semibold text-gray-800">Edit Profile</Text>
              <TouchableOpacity onPress={() => setShowProfileEdit(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <View className="space-y-4">
              <View>
                <Text className="text-gray-700 font-medium mb-2">Username</Text>
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                  value={profileData.username}
                  onChangeText={(text) => setProfileData({...profileData, username: text})}
                />
              </View>
              
              <View>
                <Text className="text-gray-700 font-medium mb-2">Email</Text>
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                  value={profileData.email}
                  onChangeText={(text) => setProfileData({...profileData, email: text})}
                  keyboardType="email-address"
                />
              </View>
              
              <TouchableOpacity
                className="bg-primary-500 rounded-xl py-3 flex-row items-center justify-center"
                onPress={handleProfileUpdate}
                disabled={loading}
              >
                <Save size={20} color="white" />
                <Text className="text-white font-semibold ml-2">
                  {loading ? 'Saving...' : 'Save Changes'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Password Change Modal */}
      <Modal
        visible={showPasswordChange}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPasswordChange(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-2xl p-6 mx-6 w-full max-w-sm">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-semibold text-gray-800">Change Password</Text>
              <TouchableOpacity onPress={() => setShowPasswordChange(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <View className="space-y-4">
              <View>
                <Text className="text-gray-700 font-medium mb-2">Current Password</Text>
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                  value={passwordData.oldPassword}
                  onChangeText={(text) => setPasswordData({...passwordData, oldPassword: text})}
                  secureTextEntry
                />
              </View>
              
              <View>
                <Text className="text-gray-700 font-medium mb-2">New Password</Text>
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                  value={passwordData.newPassword}
                  onChangeText={(text) => setPasswordData({...passwordData, newPassword: text})}
                  secureTextEntry
                />
              </View>
              
              <View>
                <Text className="text-gray-700 font-medium mb-2">Confirm New Password</Text>
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                  value={passwordData.confirmPassword}
                  onChangeText={(text) => setPasswordData({...passwordData, confirmPassword: text})}
                  secureTextEntry
                />
              </View>
              
              <TouchableOpacity
                className="bg-primary-500 rounded-xl py-3 flex-row items-center justify-center"
                onPress={handlePasswordChange}
                disabled={loading}
              >
                <Save size={20} color="white" />
                <Text className="text-white font-semibold ml-2">
                  {loading ? 'Changing...' : 'Change Password'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}