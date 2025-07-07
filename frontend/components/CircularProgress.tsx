import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface CircularProgressProps {
  size: number;
  strokeWidth: number;
  progress: number; // value between 0–100
  color: string;
  backgroundColor?: string;
  children?: React.ReactNode;
}

export default function CircularProgress({
  size,
  strokeWidth,
  progress,
  color,
  backgroundColor = '#e5e7eb',
  children,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={{ width: size, height: size }} className="justify-center items-center">
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Foreground (progress) circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference}, ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          transform={`rotate(-90 ${size / 2} ${size / 2})`} // rotate to start from top
        />
      </Svg>

      {/* Optional center content (e.g. text) */}
      <View className="absolute items-center justify-center">
        {children}
      </View>
    </View>
  );
}
