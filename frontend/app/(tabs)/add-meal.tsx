import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { Camera, Upload, Zap } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

export default function AddMealScreen() {
  const [mealDescription, setMealDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const { token } = useAuth();

  const analyzeTextMeal = async () => {
    if (!mealDescription.trim()) {
      Alert.alert('Error', 'Please describe your meal');
      return;
    }

    setAnalyzing(true);
    try {
      const response = await fetch(
        'https://aicalorietracker.onrender.com/api/v1/meal/text',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            mealText: mealDescription,
          }),
        }
      );

      const resData = await response.json();

      if (response.ok && resData.success) {
        const { calories, protein, carbs, fats } = resData.data.totals;
        Alert.alert(
          'Meal Added Successfully!',
          `Calories: ${calories}\nProtein: ${protein}g\nCarbs: ${carbs}g\nFats: ${fats}g`,
          [
            {
              text: 'OK',
              onPress: () => {
                setMealDescription('');
                setSelectedImage(null);
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', resData.message || 'Failed to analyze meal');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const pickImageFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const takePicture = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const analyzeMealWithPhoto = async () => {
    if (!selectedImage) {
      Alert.alert('Error', 'Please select an image first');
      return;
    }

    setAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: selectedImage,
        type: 'image/jpeg',
        name: 'meal.jpg',
      } as any);

      if (mealDescription.trim()) {
        formData.append('mealText', mealDescription); //  Correct key
      }

      const response = await fetch(
        'https://aicalorietracker.onrender.com/api/v1/meal/photo',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        }
      );

      const resData = await response.json();

      if (response.ok && resData.success) {
        const { calories, protein, carbs, fats } = resData.data.totals;
        Alert.alert(
          'Meal Added Successfully!',
          `Calories: ${calories}\nProtein: ${protein}g\nCarbs: ${carbs}g\nFats: ${fats}g`,
          [
            {
              text: 'OK',
              onPress: () => {
                setMealDescription('');
                setSelectedImage(null);
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', resData.message || 'Failed to analyze meal photo');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="px-4 pt-12 pb-6">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-800">Add New Meal</Text>
          <Text className="text-gray-600 mt-1">
            Describe your meal or take a photo for AI analysis
          </Text>
        </View>

        {/* Meal Description */}
        <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-4">
            Describe Your Meal
          </Text>
          <TextInput
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 min-h-24"
            placeholder="e.g., 2 scrambled eggs, 1 slice of toast, 1 banana..."
            value={mealDescription}
            onChangeText={setMealDescription}
            multiline
            textAlignVertical="top"
          />
          <TouchableOpacity
            className="bg-primary-500 rounded-xl py-3 mt-4 flex-row items-center justify-center"
            onPress={analyzeTextMeal}
            disabled={analyzing}
          >
            <Zap size={20} color="white" />
            <Text className="text-white font-semibold text-lg ml-2">
              {analyzing ? 'Analyzing...' : 'Analyze with AI'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Photo Upload Section */}
        <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-4">
            Or Upload a Photo
          </Text>

          {selectedImage ? (
            <View className="mb-4">
              <Image
                source={{ uri: selectedImage }}
                className="w-full h-48 rounded-xl"
                resizeMode="cover"
              />
              <TouchableOpacity
                className="absolute top-2 right-2 bg-danger-500 rounded-full p-2"
                onPress={() => setSelectedImage(null)}
              >
                <Text className="text-white font-bold">×</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8 items-center justify-center mb-4">
              <Camera size={48} color="#9CA3AF" />
              <Text className="text-gray-500 mt-2">No photo selected</Text>
            </View>
          )}

          <View className="flex-row space-x-3">
            <TouchableOpacity
              className="flex-1 bg-gray-100 rounded-xl py-3 flex-row items-center justify-center"
              onPress={takePicture}
            >
              <Camera size={20} color="#6B7280" />
              <Text className="text-gray-700 font-medium ml-2">Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-gray-100 rounded-xl py-3 flex-row items-center justify-center"
              onPress={pickImageFromGallery}
            >
              <Upload size={20} color="#6B7280" />
              <Text className="text-gray-700 font-medium ml-2">Gallery</Text>
            </TouchableOpacity>
          </View>

          {selectedImage && (
            <TouchableOpacity
              className="bg-success-500 rounded-xl py-3 mt-4 flex-row items-center justify-center"
              onPress={analyzeMealWithPhoto}
              disabled={analyzing}
            >
              <Zap size={20} color="white" />
              <Text className="text-white font-semibold text-lg ml-2">
                {analyzing ? 'Analyzing Photo...' : 'Analyze Photo with AI'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Tips */}
        <View className="bg-blue-50 rounded-2xl p-6">
          <Text className="text-lg font-semibold text-blue-800 mb-2">
            💡 Tips for Better Results
          </Text>
          <Text className="text-blue-700 text-sm leading-5">
            • Be specific with quantities (e.g., "2 eggs" instead of "eggs"){'\n'}
            • Include cooking methods (e.g., "grilled chicken" vs "fried chicken"){'\n'}
            • For photos, ensure good lighting and clear view of the food{'\n'}
            • Include all items in your meal description
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
