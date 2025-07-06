import React from 'react';
import { View, Text } from 'react-native';

interface Meal {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  image?: string;
  timestamp: string;
  
}

interface MealCardProps {
  meal: Meal;
}

export function MealCard({ meal }: MealCardProps) {
  const timeString = new Date(meal.timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <View className="bg-gray-50 rounded-xl p-4 shadow-sm">
      <View className="flex-row justify-between items-start mb-1">
        <Text className="font-medium text-gray-800 flex-1 mr-2 capitalize">
          {meal.name}
        </Text>
        <Text className="text-xs text-gray-500">{timeString}</Text>
      </View>

      <View className="flex-row justify-between items-center mt-1">
        <Text className="text-primary-500 font-semibold">{meal.calories} cal</Text>
        <Text className="text-gray-600 text-sm">
          {meal.protein}p • {meal.carbs}c • {meal.fats}f
        </Text>
      </View>
    </View>
  );
}
