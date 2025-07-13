import React from "react";
import { View, Text } from "react-native";

interface MacroBarProps {
  label: string;
  current: number;
  goal: number;
  color: string; // still passed in as prop, e.g., "#3aae68"
  unit?: string;
}

export default function MacroBar({
  label,
  current,
  goal,
  color,
  unit = "g",
}: MacroBarProps) {
  const safeGoal = goal > 0 ? goal : 1;
  const percentage = Math.min((current / safeGoal) * 100, 100);

  return (
    <View className="mb-4">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-[#2e2e2e] font-inter-medium">{label}</Text>
        <Text className="text-[#7a7a7a] font-inter">
          {current.toFixed(1)}
          {unit} / {goal.toFixed(0)}
          {unit}
        </Text>
      </View>
      <View className="bg-[#d8e6f4] rounded-full h-2 overflow-hidden">
        <View
          style={{ width: `${percentage}%`, backgroundColor: color }}
          className="h-2 rounded-full"
        />
      </View>
    </View>
  );
}
