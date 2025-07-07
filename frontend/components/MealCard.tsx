import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Clock } from 'lucide-react-native';

interface MealCardProps {
  mealText: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  imageUrl?: string;
  timestamp: string;
  onPress?: () => void;
}

export default function MealCard({
  mealText,
  calories,
  protein,
  carbs,
  fats,
  imageUrl,
  timestamp,
  onPress,
}: MealCardProps) {
  return (
    <TouchableOpacity
      className="bg-white rounded-xl p-4 shadow-sm mb-3 border border-gray-100 active:opacity-80"
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View className="flex-row items-start">
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            className="w-16 h-16 rounded-lg mr-3"
            resizeMode="cover"
          />
        ) : (
          <View className="w-16 h-16 rounded-lg mr-3 bg-gray-100" />
        )}

        <View className="flex-1">
          <Text
            className="text-gray-900 font-inter-medium mb-1"
            numberOfLines={2}
          >
            {mealText}
          </Text>

          <View className="flex-row items-center mb-2">
            <Clock size={12} color="#6b7280" />
            <Text className="text-gray-500 font-inter text-sm ml-1">
              {timestamp}
            </Text>
          </View>

          <View className="flex-row flex-wrap gap-x-4 gap-y-1">
            <Text className="text-primary-600 font-inter-medium text-sm">
              {calories} cal
            </Text>
            <Text className="text-gray-600 font-inter text-sm">P: {protein}g</Text>
            <Text className="text-gray-600 font-inter text-sm">C: {carbs}g</Text>
            <Text className="text-gray-600 font-inter text-sm">F: {fats}g</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
