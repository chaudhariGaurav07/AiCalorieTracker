import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Zap, Camera, Upload } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

const BASE_URL = 'https://aicalorietracker.onrender.com/api/v1';

interface MealPreview {
  mealText: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  confidence: number;
}

export default function AddMeal() {
  const { token } = useAuth();
  const [mealText, setMealText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mealPreview, setMealPreview] = useState<MealPreview | null>(null);
  const [loading, setLoading] = useState(false);

  const analyzeMealText = async () => {
    if (!mealText.trim()) return Alert.alert('Error', 'Please describe your meal');
    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/ai/parse-food`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mealText }),
      });

      if (!response.ok) throw new Error('Failed to analyze meal text');

      const data = await response.json();
      setMealPreview(data.data); // ⬅️ Ensure backend returns `.data`
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Something went wrong while analyzing.');
    } finally {
      setLoading(false);
    }
  };

  const uploadMealImage = async (fromCamera = false) => {
    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) return Alert.alert('Permission Required', 'Camera or gallery access is needed.');

    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 1, allowsEditing: true })
      : await ImagePicker.launchImageLibraryAsync({ quality: 1, allowsEditing: true });

    if (!result.canceled && result.assets?.length) {
      const uri = result.assets[0].uri;
      setSelectedImage(uri);
      setLoading(true);

      try {
        const formData = new FormData();
        formData.append('photo', {
          uri,
          type: 'image/jpeg',
          name: 'meal.jpg',
        } as any);

        if (mealText.trim()) {
          formData.append('mealText', mealText);
        }

        const response = await fetch(`${BASE_URL}/meal/add-with-photo`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data?.message || 'Failed to upload image');

        setMealPreview(data.data);
        Alert.alert('Success', 'Meal logged successfully!');
      } catch (err) {
        console.error('Upload error:', err);
        Alert.alert('Error', 'Failed to upload image.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <View className="px-6 py-4 bg-white">
          <Text className="text-2xl font-inter-bold text-gray-900">Add Meal</Text>
          <Text className="text-gray-600 font-inter mt-1">
            Describe your meal or take a photo
          </Text>
        </View>

        <View className="flex-1 px-6 py-4">
          {/* Text Input */}
          <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
            <Text className="text-gray-700 font-inter-medium mb-3">Describe your meal</Text>
            <View className="bg-gray-50 rounded-xl p-4 mb-4 min-h-[80px]">
              <TextInput
                className="text-gray-900 font-inter text-base"
                placeholder="e.g., Paneer with rice and salad"
                value={mealText}
                onChangeText={setMealText}
                multiline
                textAlignVertical="top"
              />
            </View>
            <TouchableOpacity
              className={`bg-primary-500 rounded-xl py-3 px-4 flex-row items-center justify-center ${loading ? 'opacity-50' : ''}`}
              onPress={analyzeMealText}
              disabled={loading}
            >
              <Zap size={20} color="white" />
              <Text className="text-white font-inter-bold ml-2">
                {loading ? 'Analyzing...' : 'Analyze with AI'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Upload Buttons */}
          <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
            <Text className="text-gray-700 font-inter-medium mb-3">Or take/upload a photo</Text>
            <View className="flex-row space-x-3">
              <TouchableOpacity
                className="flex-1 bg-secondary-500 rounded-xl py-3 px-4 flex-row items-center justify-center"
                onPress={() => uploadMealImage(true)}
              >
                <Camera size={20} color="white" />
                <Text className="text-white font-inter-bold ml-2">Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-accent-500 rounded-xl py-3 px-4 flex-row items-center justify-center"
                onPress={() => uploadMealImage(false)}
              >
                <Upload size={20} color="white" />
                <Text className="text-white font-inter-bold ml-2">Upload</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Image Preview */}
          {selectedImage && (
            <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
              <Text className="text-gray-700 font-inter-medium mb-3">Selected Image</Text>
              <Image
                source={{ uri: selectedImage }}
                className="w-full h-48 rounded-xl"
                resizeMode="cover"
              />
            </View>
          )}

          {/* Meal Preview */}
          {mealPreview && (
            <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
              <Text className="text-gray-700 font-inter-medium mb-3">Meal Analysis</Text>
              <View className="bg-primary-50 rounded-xl p-4 mb-4">
                <Text className="text-gray-900 font-inter-medium mb-1">
                  {mealPreview.mealText}
                </Text>
                <Text className="text-gray-500 font-inter text-sm mb-3">
                  Confidence: {mealPreview.confidence?.toFixed(1) || 90}%
                </Text>
                <View className="flex-row justify-between">
                  <View className="items-center">
                    <Text className="text-lg font-bold text-primary-600">{mealPreview.calories}</Text>
                    <Text className="text-gray-600 text-sm">Calories</Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-lg font-bold text-secondary-600">{mealPreview.protein}g</Text>
                    <Text className="text-gray-600 text-sm">Protein</Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-lg font-bold text-accent-600">{mealPreview.carbs}g</Text>
                    <Text className="text-gray-600 text-sm">Carbs</Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-lg font-bold text-red-600">{mealPreview.fats}g</Text>
                    <Text className="text-gray-600 text-sm">Fats</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {loading && (
            <View className="items-center mt-4">
              <ActivityIndicator size="large" color="#0ea5e9" />
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
