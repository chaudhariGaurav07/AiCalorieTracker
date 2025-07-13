import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Clock } from "lucide-react-native";

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
      className="bg-[#ffffff] rounded-xl p-4 mb-3 border border-[#eaf4fb] shadow-sm active:opacity-80"
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
          <View className="w-16 h-16 rounded-lg mr-3 bg-[#d8e6f4]" />
        )}

        <View className="flex-1">
          <Text
            className="text-[#2e2e2e] font-inter-medium mb-1"
            numberOfLines={2}
          >
            {mealText}
          </Text>

          <View className="flex-row items-center mb-2">
            <Clock size={12} color="#7a7a7a" />
            <Text className="text-[#7a7a7a] font-inter text-sm ml-1">
              {timestamp}
            </Text>
          </View>

          <View className="flex-row flex-wrap gap-x-4 gap-y-1">
            <Text className="text-[#00cc88] font-inter-medium text-sm">
              {calories} cal
            </Text>
            <Text className="text-[#7a7a7a] font-inter text-sm">P: {protein}g</Text>
            <Text className="text-[#7a7a7a] font-inter text-sm">C: {carbs}g</Text>
            <Text className="text-[#7a7a7a] font-inter text-sm">F: {fats}g</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
