import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';

interface MacroBarProps {
  label: string;
  current: number;
  goal: number;
  color: string;
  unit?: string;
}

export function MacroBar({ label, current, goal, color, unit = '' }: MacroBarProps) {
  const percentage = Math.min((current / goal) * 100, 100);
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: percentage,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [percentage]);

  const animatedStyle = {
    width: animatedWidth.interpolate({
      inputRange: [0, 100],
      outputRange: ['0%', '100%'],
    }),
  };

  return (
    <View className="space-y-2">
      <View className="flex-row justify-between items-center">
        <Text className="font-medium text-gray-700">{label}</Text>
        <Text className="text-sm text-gray-600">
          {current}/{goal}{unit}
        </Text>
      </View>
      <View className="bg-gray-200 rounded-full h-2 overflow-hidden">
        <Animated.View
          className="h-2 rounded-full"
          style={[{ backgroundColor: color }, animatedStyle]}
        />
      </View>
    </View>
  );
}
