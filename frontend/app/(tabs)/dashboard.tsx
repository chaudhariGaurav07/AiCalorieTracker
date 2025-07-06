import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, RefreshControl } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { CircularProgress } from "@/components/CircularProgress";
import { MacroBar } from "@/components/MacroBar";
import { MealCard } from "@/components/MealCard";
import { Target, Activity, Calendar } from "lucide-react-native";

interface MealEntry {
  timestamp: string;
  mealText: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  image?: string;
}

interface DayLog {
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    
  };
  entries: MealEntry[];
  goal: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  steps: number;
  caloriesBurned: number;
}

export default function DashboardScreen() {
  const { user, token } = useAuth();
  const [dayLog, setDayLog] = useState<DayLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDayLog = async () => {
    try {
      const res = await fetch(
        "https://aicalorietracker.onrender.com/api/v1/logs/today",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const json = await res.json();
      if (res.ok && json.success) {
        setDayLog(json.data);
      }
    } catch (error) {
      console.error("Error fetching log:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) fetchDayLog();
  }, [token]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDayLog();
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-600">Loading...</Text>
      </View>
    );
  }

  const caloriesConsumed = dayLog?.totals.calories || 0;
  const calorieGoal = dayLog?.goal?.calories || 2000;
  const caloriesBurned = dayLog?.caloriesBurned || 0;
  const netCalories = caloriesConsumed - caloriesBurned;
  const remainingCalories = calorieGoal - netCalories;

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="px-4 pt-12 pb-6">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-800">
            Welcome back, {user?.username}!
          </Text>
          <Text className="text-gray-600 mt-1">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>
        </View>

        {/* Calories */}
        <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-gray-800">
              Today's Calories
            </Text>
            <Target size={24} color="#3B82F6" />
          </View>

          <View className="items-center mb-6">
            <CircularProgress
              percentage={(netCalories / calorieGoal) * 100}
              size={120}
              strokeWidth={8}
              color="#3B82F6"
            />
            <View className="absolute inset-0 justify-center items-center">
              <Text className="text-2xl font-bold text-gray-800">
                {Math.max(0, remainingCalories)}
              </Text>
              <Text className="text-gray-600 text-sm">remaining</Text>
            </View>
          </View>

          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-2xl font-bold text-success-500">
                {caloriesConsumed}
              </Text>
              <Text className="text-gray-600 text-sm">consumed</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-danger-500">
                {caloriesBurned}
              </Text>
              <Text className="text-gray-600 text-sm">burned</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-gray-800">
                {calorieGoal}
              </Text>
              <Text className="text-gray-600 text-sm">goal</Text>
            </View>
          </View>
        </View>

        {/* Macronutrients */}
        <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-4">
            Macronutrients
          </Text>

          <View className="space-y-4">
            <MacroBar
              label="Protein"
              current={dayLog?.totals.protein || 0}
              goal={dayLog?.goal?.protein || 150}
              color="#10B981"
              unit="g"
            />
            <MacroBar
              label="Carbs"
              current={dayLog?.totals.carbs || 0}
              goal={dayLog?.goal?.carbs || 250}
              color="#F59E0B"
              unit="g"
            />
            <MacroBar
              label="Fats"
              current={dayLog?.totals.fats || 0}
              goal={dayLog?.goal?.fats || 70}
              color="#EF4444"
              unit="g"
            />
          </View>
        </View>

        {/* Activity */}
        <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-gray-800">
              Activity
            </Text>
            <Activity size={24} color="#3B82F6" />
          </View>

          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-2xl font-bold text-primary-500">
                {dayLog?.steps || 0}
              </Text>
              <Text className="text-gray-600 text-sm">steps</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-success-500">
                {caloriesBurned}
              </Text>
              <Text className="text-gray-600 text-sm">calories burned</Text>
            </View>
          </View>
        </View>

        {/* Meals */}
        <View className="bg-white rounded-2xl p-6 shadow-sm">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-gray-800">
              Recent Meals
            </Text>
            <Calendar size={24} color="#3B82F6" />
          </View>

          {Array.isArray(dayLog?.entries) && dayLog.entries.length > 0 ? (
            <View className="space-y-3">
              {dayLog.entries.slice(0, 3).map((meal, index) => (
                <MealCard
                  key={index}
                  meal={{
                    name: meal.mealText,
                    calories: meal.calories,
                    protein: meal.protein,
                    carbs: meal.carbs,
                    fats: meal.fats,
                    image: meal.image,
                    timestamp: meal.timestamp,
                  }}
                />
              ))}
            </View>
          ) : (
            <Text className="text-gray-500 text-center py-4">
              No meals logged today. Add your first meal!
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
