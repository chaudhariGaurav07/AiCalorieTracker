import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Dimensions } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { LineChart } from 'react-native-chart-kit';
import { Calendar, TrendingUp, Target, Activity } from 'lucide-react-native';

const screenWidth = Dimensions.get('window').width;

interface HistoryData {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  steps: number;
  goal: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
}

export default function ProgressScreen() {
  const { token } = useAuth();
  const [history, setHistory] = useState<HistoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

  const fetchHistory = async () => {
    try {
      const res = await fetch(
        'https://aicalorietracker.onrender.com/api/v1/logs/history',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const json = await res.json();
      if (res.ok && json.success) {
        setHistory(json.logs || []);
      } else {
        setHistory([]);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setHistory([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) fetchHistory();
  }, [token]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  const getChartData = () => {
    const data =
      viewMode === 'month'
        ? history.slice(-30)
        : history.slice(-7);

    if (data.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{ data: [0] }],
      };
    }

    return {
      labels: data.map((item) =>
        new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' })
      ),
      datasets: [
        {
          data: data.map((item) => item.calories),
          color: (opacity = 1) => `rgba(59,130,246,${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
  };

  const getAverages = () => {
    if (history.length === 0) return { calories: 0, protein: 0, carbs: 0, fats: 0 };
    const total = history.reduce(
      (acc, curr) => ({
        calories: acc.calories + curr.calories,
        protein: acc.protein + curr.protein,
        carbs: acc.carbs + curr.carbs,
        fats: acc.fats + curr.fats,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );
    const count = history.length;
    return {
      calories: Math.round(total.calories / count),
      protein: Math.round(total.protein / count),
      carbs: Math.round(total.carbs / count),
      fats: Math.round(total.fats / count),
    };
  };

  const averages = getAverages();

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-600">Loading progress...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View className="px-4 pt-12 pb-6">
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-800">Progress Tracking</Text>
          <Text className="text-gray-600 mt-1">
            Monitor your nutrition and fitness journey
          </Text>
        </View>

        {/* Toggle View */}
        <View className="bg-white rounded-2xl p-4 shadow-sm mb-6">
          <View className="flex-row">
            {['week', 'month'].map((mode) => (
              <TouchableOpacity
                key={mode}
                className={`flex-1 py-2 rounded-lg ${viewMode === mode ? 'bg-primary-500' : 'bg-gray-100'} ${
                  mode === 'month' ? 'ml-2' : ''
                }`}
                onPress={() => setViewMode(mode as 'week' | 'month')}
              >
                <Text
                  className={`text-center font-medium ${
                    viewMode === mode ? 'text-white' : 'text-gray-600'
                  }`}
                >
                  {mode === 'week' ? 'Week' : 'Month'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Chart */}
        <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-gray-800">Calorie Trend</Text>
            <TrendingUp size={24} color="#3B82F6" />
          </View>

          {history.length > 0 ? (
            <LineChart
              data={getChartData()}
              width={screenWidth - 64}
              height={220}
              yAxisSuffix=" cal"
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
                propsForDots: {
                  r: '5',
                  strokeWidth: '2',
                  stroke: '#3B82F6',
                },
              }}
              bezier
              style={{ marginVertical: 8, borderRadius: 16 }}
            />
          ) : (
            <View className="h-48 justify-center items-center bg-gray-50 rounded-xl">
              <Calendar size={48} color="#9CA3AF" />
              <Text className="text-gray-500 mt-2">No data available</Text>
            </View>
          )}
        </View>

        {/* Averages */}
        <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-gray-800">Averages</Text>
            <Target size={24} color="#3B82F6" />
          </View>

          {['calories', 'protein', 'carbs', 'fats'].map((key) => (
            <View key={key} className="flex-row justify-between items-center py-1">
              <Text className="text-gray-600 capitalize">{key}</Text>
              <Text className="text-lg font-semibold text-gray-800">
                {averages[key as keyof typeof averages]}
                {key === 'calories' ? ' cal' : 'g'}
              </Text>
            </View>
          ))}
        </View>

        {/* Recent Activity */}
        <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-gray-800">Recent Activity</Text>
            <Activity size={24} color="#3B82F6" />
          </View>

          {history.length > 0 ? (
            <View className="space-y-3">
              {history.slice(0, 5).map((day, index) => (
                <View key={index} className="flex-row justify-between items-center py-2 border-b border-gray-100">
                  <View>
                    <Text className="font-medium text-gray-800">
                      {new Date(day.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                    <Text className="text-sm text-gray-600">{day.steps} steps</Text>
                  </View>
                  <View className="items-end">
                    <Text className="font-semibold text-primary-500">
                      {day.calories} cal
                    </Text>
                    <Text className="text-sm text-gray-600">
                      {day.protein}p / {day.carbs}c / {day.fats}f
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text className="text-gray-500 text-center py-4">No activity data available</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
