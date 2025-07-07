import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Scan, Flame, Footprints } from 'lucide-react-native';
import CircularProgress from '@/components/CircularProgress';
import MacroBar from '@/components/MacroBar';
import MealCard from '@/components/MealCard';
import BarcodeScanner from '@/components/BarcodeScanner';
import { useSteps } from '@/hooks/useSteps';

const BASE_URL = 'https://aicalorietracker.onrender.com/api/v1';

interface Meal {
  id: string;
  mealText: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  imageUrl?: string;
  timestamp: string;
}

interface TodayData {
  consumed: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  goal: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  burned: number;
  steps: number;
  recentMeals: Meal[];
}

export default function Dashboard() {
  const { user, token } = useAuth();
  const [todayData, setTodayData] = useState<TodayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const { steps = 0, isAvailable: pedometerAvailable } = useSteps();

  const fetchTodayData = async () => {
    try {
      const response = await fetch(`${BASE_URL}/logs/todays-log`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const res = await response.json();

      if (response.ok && res?.data) {
        const { totals, calorieGoal, entries, stepCount, burnedCalories } = res.data;

        setTodayData({
          consumed: {
            calories: totals?.calories || 0,
            protein: totals?.protein || 0,
            carbs: totals?.carbs || 0,
            fats: totals?.fats || 0,
          },
          goal: {
            calories: calorieGoal?.targetCalories || 2000,
            protein: calorieGoal?.proteinGoal || 100,
            carbs: calorieGoal?.carbGoal || 250,
            fats: calorieGoal?.fatGoal || 60,
          },
          steps: stepCount || 0,
          burned: burnedCalories || 0,
          recentMeals: entries?.map((entry: any, index: number) => ({
            id: String(index),
            mealText: entry.mealText || '',
            calories: entry.calories || 0,
            protein: entry.protein || 0,
            carbs: entry.carbs || 0,
            fats: entry.fats || 0,
            imageUrl: '',
            timestamp: new Date().toISOString(),
          })) || [],
        });
      } else {
        Alert.alert('Error', "Failed to fetch today's data from server.");
      }
    } catch (error) {
      console.error('Error fetching today data:', error);
      Alert.alert('Error', "Something went wrong while fetching today's data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const syncStepsToBackend = async (stepCount: number) => {
    try {
      await fetch(`${BASE_URL}/steps/log-steps`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ steps: stepCount }),
      });
    } catch (error) {
      console.warn('Failed to sync steps to backend:', error);
    }
  };

  useEffect(() => {
    fetchTodayData();
  }, []);

  useEffect(() => {
    if (steps > 0) {
      syncStepsToBackend(steps);
    }
  }, [steps]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTodayData();
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-600 font-inter">Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!todayData) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-600 font-inter">No data available</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { consumed, goal, recentMeals, burned, steps: serverSteps } = todayData;
  const caloriesProgress = goal.calories ? (consumed.calories / goal.calories) * 100 : 0;
  const netCalories = consumed.calories - burned;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row justify-between items-center px-6 py-4 bg-white">
        <View>
          <Text className="text-2xl font-inter-bold text-gray-900">
            Hello, {user?.username}!
          </Text>
          <Text className="text-gray-600 font-inter">Let's track your nutrition today</Text>
        </View>
        <TouchableOpacity
          className="bg-primary-500 rounded-full p-3"
          onPress={() => setShowScanner(true)}
        >
          <Scan size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Summary */}
        <View className="bg-white mx-6 mt-4 rounded-2xl p-6 shadow-sm">
          <View className="items-center mb-6">
            <CircularProgress
              size={120}
              strokeWidth={8}
              progress={caloriesProgress}
              color="#0ea5e9"
            >
              <Text className="text-2xl font-inter-bold text-gray-900">
                {consumed.calories}
              </Text>
              <Text className="text-gray-600 font-inter">calories</Text>
            </CircularProgress>
          </View>

          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-lg font-inter-bold text-primary-600">
                {goal.calories}
              </Text>
              <Text className="text-gray-600 font-inter text-sm">Goal</Text>
            </View>
            <View className="items-center">
              <Text className="text-lg font-inter-bold text-secondary-600">
                {burned}
              </Text>
              <Text className="text-gray-600 font-inter text-sm">Burned</Text>
            </View>
            <View className="items-center">
              <Text className="text-lg font-inter-bold text-gray-900">
                {netCalories}
              </Text>
              <Text className="text-gray-600 font-inter text-sm">Net</Text>
            </View>
          </View>
        </View>

        {/* Macronutrients */}
        <View className="bg-white mx-6 mt-4 rounded-2xl p-6 shadow-sm">
          <Text className="text-lg font-inter-bold text-gray-900 mb-4">
            Macronutrients
          </Text>
          <MacroBar label="Protein" current={consumed.protein} goal={goal.protein} color="#10b981" />
          <MacroBar label="Carbs" current={consumed.carbs} goal={goal.carbs} color="#f59e0b" />
          <MacroBar label="Fats" current={consumed.fats} goal={goal.fats} color="#ef4444" />
        </View>

        {/* Activity */}
        <View className="bg-white mx-6 mt-4 rounded-2xl p-6 shadow-sm">
          <Text className="text-lg font-inter-bold text-gray-900 mb-4">
            Today's Activity
          </Text>
          <View className="flex-row justify-between">
            <View className="items-center">
              <View className="bg-secondary-100 rounded-full p-3 mb-2">
                <Footprints size={24} color="#10b981" />
              </View>
              <Text className="text-xl font-inter-bold text-gray-900">
                {serverSteps.toLocaleString()}
              </Text>
              <Text className="text-gray-600 font-inter text-sm">Steps</Text>
            </View>
            <View className="items-center">
              <View className="bg-accent-100 rounded-full p-3 mb-2">
                <Flame size={24} color="#f59e0b" />
              </View>
              <Text className="text-xl font-inter-bold text-gray-900">
                {burned}
              </Text>
              <Text className="text-gray-600 font-inter text-sm">Calories</Text>
            </View>
          </View>
        </View>

        {/* Meals */}
        <View className="bg-white mx-6 mt-4 rounded-2xl p-6 shadow-sm">
          <Text className="text-lg font-inter-bold text-gray-900 mb-4">
            Recent Meals
          </Text>
          {recentMeals.length > 0 ? (
            recentMeals.map((meal) => <MealCard key={meal.id} {...meal} />)
          ) : (
            <Text className="text-center text-gray-500 font-inter">No meals logged today</Text>
          )}
        </View>

        <View className="h-6" />
      </ScrollView>

      <BarcodeScanner visible={showScanner} onClose={() => setShowScanner(false)} />
    </SafeAreaView>
  );
}
