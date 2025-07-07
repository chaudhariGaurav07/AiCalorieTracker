import React from 'react';
import { View, Text } from 'react-native';

interface MacroBarProps {
  label: string;
  current: number;
  goal: number;
  color: string;
  unit?: string;
}

export default function MacroBar({
  label,
  current,
  goal,
  color,
  unit = 'g',
}: MacroBarProps) {
  const safeGoal = goal > 0 ? goal : 1; // prevent division by zero
  const percentage = Math.min((current / safeGoal) * 100, 100);

  return (
    <View className="mb-4">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-gray-700 font-inter-medium">{label}</Text>
        <Text className="text-gray-600 font-inter">
          {current}
          {unit} / {goal}
          {unit}
        </Text>
      </View>
      <View className="bg-gray-200 rounded-full h-2 overflow-hidden">
        <View
          style={{ width: `${percentage}%`, backgroundColor: color }}
          className="h-2 rounded-full"
        />
      </View>
    </View>
  );
}
