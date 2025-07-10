import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { LineChart, BarChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;
const BASE_URL = 'https://aicalorietracker.onrender.com/api/v1';

interface ProgressData {
  weekly: {
    calories: number[];
    weight: number[];
    labels: string[];
  };
  monthly: {
    calories: number[];
    weight: number[];
    labels: string[];
  };
  averages: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
}

export default function Progress() {
  const { token } = useAuth();
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly'>('weekly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      const response = await fetch(`${BASE_URL}/logs/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const json = await response.json();
  
      if (response.ok && json.data?.history) {
        const history = json.data.history;
  
        // Sort entries by date
        const sorted = [...history].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
  
        // Weekly
        const weeklyLabels = sorted.map((entry) =>
          new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short' })
        );
        const weeklyCalories = sorted.map((entry) => entry.totals.calories || 0);
        const weeklyProtein = sorted.map((entry) => entry.totals.protein || 0);
        const weeklyCarbs = sorted.map((entry) => entry.totals.carbs || 0);
        const weeklyFats = sorted.map((entry) => entry.totals.fats || 0);
  
        // Monthly: group every 7 entries = 1 week
        const chunkBy = 7;
        const chunkedCalories = [];
        const monthlyLabels = [];
  
        for (let i = 0; i < sorted.length; i += chunkBy) {
          const chunk = sorted.slice(i, i + chunkBy);
          const avg = (arr: number[]) =>
            arr.length ? arr.reduce((sum, v) => sum + v, 0) / arr.length : 0;
  
          chunkedCalories.push(
            avg(chunk.map((entry) => entry.totals.calories || 0))
          );
  
          monthlyLabels.push(`Week ${Math.floor(i / chunkBy) + 1}`);
        }
  
        const avg = (arr: number[]) =>
          arr.length ? arr.reduce((sum, v) => sum + v, 0) / arr.length : 0;
  
        const transformedData: ProgressData = {
          weekly: {
            calories: weeklyCalories,
            weight: [],
            labels: weeklyLabels,
          },
          monthly: {
            calories: chunkedCalories,
            weight: [],
            labels: monthlyLabels,
          },
          averages: {
            calories: Number(avg(weeklyCalories).toFixed(2)),
            protein: Number(avg(weeklyProtein).toFixed(1)),
            carbs: Number(avg(weeklyCarbs).toFixed(1)),
            fats: Number(avg(weeklyFats).toFixed(1)),
          },
        };
  
        setProgressData(transformedData);
      } else {
        throw new Error(json.message || 'Failed to fetch data');
      }
    } catch (error: any) {
      console.error('Progress fetch error:', error);
      Alert.alert('Error', error.message || 'Could not load progress data.');
      setProgressData(null);
    } finally {
      setLoading(false);
    }
  };
  

  const currentData = progressData?.[timeframe];

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(14, 165, 233, ${opacity})`,
    strokeWidth: 3,
    barPercentage: 0.7,
    decimalPlaces: 0,
    useShadowColorFromDataset: false,
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-600 font-inter">Loading progress...</Text>
      </SafeAreaView>
    );
  }

  if (!progressData || !currentData) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-600 font-inter">No progress data available yet.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-6 py-4 bg-white">
        <Text className="text-2xl font-inter-bold text-gray-900">Progress</Text>
        <Text className="text-gray-600 font-inter mt-1">
          Track your fitness journey
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Toggle */}
        <View className="bg-white mx-6 mt-4 rounded-2xl p-4 shadow-sm">
          <View className="flex-row bg-gray-100 rounded-xl p-1">
            {['weekly', 'monthly'].map((type) => (
              <TouchableOpacity
                key={type}
                className={`flex-1 py-2 px-4 rounded-lg ${
                  timeframe === type ? 'bg-white shadow-sm' : ''
                }`}
                onPress={() => setTimeframe(type as 'weekly' | 'monthly')}
              >
                <Text
                  className={`text-center font-inter-medium ${
                    timeframe === type ? 'text-primary-600' : 'text-gray-600'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Calorie Intake */}
        <View className="bg-white mx-6 mt-4 rounded-2xl p-4 shadow-sm">
          <Text className="text-lg font-inter-bold text-gray-900 mb-4">Calorie Intake</Text>
          <LineChart
            data={{
              labels: currentData.labels,
              datasets: [{ data: currentData.calories }],
            }}
            width={screenWidth - 32}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={{ borderRadius: 16 }}
          />
        </View>

        {/* Average Macros */}
        <View className="bg-white mx-6 mt-4 rounded-2xl p-4 shadow-sm">
          <Text className="text-lg font-inter-bold text-gray-900 mb-4">Average Daily Macros</Text>
          <BarChart
            data={{
              labels: ['Protein', 'Carbs', 'Fats'],
              datasets: [
                {
                  data: [
                    progressData.averages.protein,
                    progressData.averages.carbs,
                    progressData.averages.fats,
                  ],
                },
              ],
            }}
            width={screenWidth - 32}
            height={220}
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => `rgba(34,197,94,${opacity})`,
            }}
            style={{ borderRadius: 16 }} yAxisLabel={''} yAxisSuffix={''}          />
        </View>

        {/* Summary */}
        <View className="bg-white mx-6 mt-4 rounded-2xl p-4 shadow-sm mb-8">
          <Text className="text-lg font-inter-bold text-gray-900 mb-4">
            {timeframe === 'weekly' ? 'This Week' : 'This Month'} Summary
          </Text>
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-2xl font-inter-bold text-primary-600">
                {progressData.averages.calories}
              </Text>
              <Text className="text-gray-600 font-inter text-sm">Avg Calories</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-inter-bold text-secondary-600">
                {progressData.averages.protein}g
              </Text>
              <Text className="text-gray-600 font-inter text-sm">Avg Protein</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-inter-bold text-accent-600">
                {currentData.calories.length > 0
                  ? Math.max(...currentData.calories) - Math.min(...currentData.calories)
                  : 0}
              </Text>
              <Text className="text-gray-600 font-inter text-sm">Cal Range</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
