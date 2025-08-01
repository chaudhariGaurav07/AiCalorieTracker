import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Alert,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { LineChart, BarChart } from "react-native-chart-kit";
import { useRouter } from "expo-router";

const screenWidth = Dimensions.get("window").width;
const BASE_URL = "https://aicalorietracker.onrender.com/api/v1";

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
  const router = useRouter();
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      router.replace("/auth/login");
      return;
    }
    fetchProgressData();
  }, [token]);

  const fetchProgressData = async () => {
    try {
      const response = await fetch(`${BASE_URL}/logs/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await response.json();
      if (!response.ok || !json.data?.history) {
        throw new Error(json.message || "Failed to fetch data");
      }

      const history = json.data.history;
      const sorted = [...history].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      const weeklyLabels = sorted.map((entry) =>
        new Date(entry.date).toLocaleDateString("en-US", { weekday: "short" })
      );
      const weeklyCalories = sorted.map((entry) => entry.totals.calories || 0);
      const weeklyProtein = sorted.map((entry) => entry.totals.protein || 0);
      const weeklyCarbs = sorted.map((entry) => entry.totals.carbs || 0);
      const weeklyFats = sorted.map((entry) => entry.totals.fats || 0);

      const chunkBy = 7;
      const chunkedCalories: number[] = [];
      const monthlyLabels: string[] = [];

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
    } catch (error: any) {
      Alert.alert("Error", error.message || "Could not load progress data.");
      setProgressData(null);
    } finally {
      setLoading(false);
    }
  };

  const chartConfig = {
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    color: (opacity = 1) => `rgba(14, 165, 233, ${opacity})`,
    strokeWidth: 3,
    barPercentage: 0.7,
    decimalPlaces: 0,
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-soft">
        <Text className="text-muted font-inter">Loading progress...</Text>
      </SafeAreaView>
    );
  }

  if (!progressData) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-soft">
        <Text className="text-muted font-inter">
          No progress data available yet.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-soft">
      <View className="px-6 py-12 bg-card">
        <Text className="text-2xl font-inter-bold text-gray-900">Progress</Text>
        <Text className="text-muted font-inter mt-1">
          Track your fitness journey
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Weekly Section */}
        <View className="mx-6 mt-4 rounded-2xl p-4 bg-card shadow-sm">
          <Text className="text-xl font-inter-bold mb-4"> Weekly Progress</Text>
          <LineChart
            data={{
              labels: progressData.weekly.labels,
              datasets: [{ data: progressData.weekly.calories }],
            }}
            width={screenWidth - 32}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={{ borderRadius: 16 }}
          />
          <View className="flex-row justify-between mt-4">
            <View className="items-center">
              <Text className="text-xl font-inter-bold text-primary">
                {progressData.averages.calories}
              </Text>
              <Text className="text-muted font-inter text-sm">Avg Cal</Text>
            </View>
            <View className="items-center">
              <Text className="text-xl font-inter-bold text-secondary">
                {progressData.averages.protein}g
              </Text>
              <Text className="text-muted font-inter text-sm">Avg Protein</Text>
            </View>
            <View className="items-center">
              <Text className="text-xl font-inter-bold text-accent">
                {(
                  Math.max(...progressData.weekly.calories) -
                  Math.min(...progressData.weekly.calories)
                ).toFixed(2)}
              </Text>
              <Text className="text-muted font-inter text-sm">Cal Range</Text>
            </View>
          </View>
        </View>

        {/* Monthly Section */}
        <View className="mx-6 mt-6 rounded-2xl p-4 bg-card shadow-sm">
          <Text className="text-xl font-inter-bold mb-4">Monthly Progress</Text>
          <LineChart
            data={{
              labels: progressData.monthly.labels,
              datasets: [{ data: progressData.monthly.calories }],
            }}
            width={screenWidth - 32}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={{ borderRadius: 16 }}
          />
        </View>

        {/* Macros */}
        <View className="mx-6 mt-6 rounded-2xl p-4 bg-card shadow-sm mb-10">
          <Text className="text-xl font-inter-bold mb-4">
            {" "}
            🍽️ Avg Daily Macros
          </Text>
          <BarChart
            data={{
              labels: ["Protein", "Carbs", "Fats"],
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
            style={{ borderRadius: 16 }}
            yAxisLabel=""
            yAxisSuffix=""
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
