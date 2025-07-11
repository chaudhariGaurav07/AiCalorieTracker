import { OPENROUTER_API_KEY } from '@env';
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Modal,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { X } from 'lucide-react-native';

interface BarcodeScannerProps {
  visible: boolean;
  onClose: () => void;
  onScan?: (data: string) => void;
}

interface Nutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export default function BarcodeScanner({
  visible,
  onClose,
  onScan,
}: BarcodeScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const cache = useRef<Record<string, Nutrition>>({});

  useEffect(() => {
    if (visible) {
      setScanned(false);
      setLoading(false);
    }
  }, [visible]);

  const fetchNutritionFromGPT = async (
    productName: string,
    brand?: string,
    category?: string
  ): Promise<Nutrition | null> => {
    const context = `${productName}${brand ? ` by ${brand}` : ''}${category ? `, which is a type of ${category}` : ''}`;

    // Check cache first
    if (cache.current[context]) {
      // console.log("Returning from cache:", context);
      return cache.current[context];
    }

    const prompt = `Give calories, protein, carbs, and fat for a food product named "${context}". Return ONLY a valid JSON like: {"calories": 120, "protein": 10, "carbs": 15, "fat": 5}`;

    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini',
          temperature: 0, // make deterministic
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!res.ok) throw new Error('OpenRouter API failed');
      const json = await res.json();
      const text = json.choices?.[0]?.message?.content;

      console.log("GPT Response Text:", text);

      const cleaned = text?.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      // Store in cache
      cache.current[context] = parsed;
      return parsed;
    } catch (err) {
      console.error('AI fetch or parse failed:', err);
      return null;
    }
  };

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned || loading) return;
    setScanned(true);
    setLoading(true);
    onScan?.(data);

    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${data}.json`);
      if (!response.ok) throw new Error('Failed to fetch OpenFoodFacts');

      const result = await response.json();
      const product = result.product || {};
      const productName = product.product_name || "this product";
      const brand = product.brands || "";
      const category = product.categories_tags?.[0] || "";

      // Filter non-edible products
      const nonEdibleKeywords = ["diaper", "soap", "detergent", "shampoo", "cleaner", "toothpaste"];
      const lowerName = productName.toLowerCase();
      const isNonEdible = nonEdibleKeywords.some(word => lowerName.includes(word));

      if (isNonEdible) {
        Alert.alert("Not Edible", `${productName} is not a food item.`);
        return;
      }

      const nutriments = product.nutriments || {};
      const kcal = nutriments.energy_kcal || nutriments.energy_100g || null;
      const protein = nutriments.proteins || nutriments.protein_100g || null;
      const carbs = nutriments.carbohydrates || nutriments.carbohydrates_100g || null;
      const fat = nutriments.fat || nutriments.fat_100g || null;

      const hasNutrition = kcal && protein && carbs && fat;

      if (result.status === 1 && hasNutrition) {
        Alert.alert(
          "Nutrition Facts",
          `Product: ${productName}\n\nCalories: ${kcal} kcal\nProtein: ${protein} g\nCarbs: ${carbs} g\nFat: ${fat} g`,
          [{ text: 'OK', onPress: onClose }]
        );
      } else {
        const aiData = await fetchNutritionFromGPT(productName, brand, category);
        if (aiData) {
          Alert.alert(
            "Estimated Nutrition (AI)",
            `Product: ${productName}\n\nCalories: ${aiData.calories} kcal\nProtein: ${aiData.protein} g\nCarbs: ${aiData.carbs} g\nFat: ${aiData.fat} g`,
            [{ text: 'OK', onPress: onClose }]
          );
        } else {
          Alert.alert("Not Found", "Could not find nutrition info for this item.");
        }
      }
    } catch (err) {
      console.error("Error fetching product:", err);
      Alert.alert("Error", "Something went wrong fetching product info.");
    } finally {
      setLoading(false);
    }
  };

  if (Platform.OS === 'web') {
    return (
      <Modal visible={visible} animationType="slide">
        <View className="flex-1 justify-center items-center bg-gray-900">
          <View className="bg-white rounded-xl p-6 mx-4">
            <Text className="text-lg font-inter-bold mb-4 text-center">Camera Not Available</Text>
            <Text className="text-gray-600 font-inter mb-4 text-center">
              Barcode scanning is not supported on web. Please use a mobile device.
            </Text>
            <TouchableOpacity className="bg-primary-500 rounded-xl py-3 px-6" onPress={onClose}>
              <Text className="text-white font-inter-bold text-center">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <Modal visible={visible} animationType="slide">
        <View className="flex-1 justify-center items-center bg-gray-900">
          <View className="bg-white rounded-xl p-6 mx-4">
            <Text className="text-lg font-inter-bold mb-4 text-center">Camera Permission Required</Text>
            <Text className="text-gray-600 font-inter mb-4 text-center">
              This feature requires camera access to scan barcodes.
            </Text>
            <TouchableOpacity className="bg-primary-500 rounded-xl py-3 px-6 mb-3" onPress={requestPermission}>
              <Text className="text-white font-inter-bold text-center">Grant Permission</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-gray-500 rounded-xl py-3 px-6" onPress={onClose}>
              <Text className="text-white font-inter-bold text-center">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide">
      <View className="flex-1 bg-black">
        <CameraView
          style={{ flex: 1 }}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr', 'ean13', 'code128', 'upc_a', 'upc_e'] }}
          onBarcodeScanned={handleBarCodeScanned}
        >
          <View className="absolute top-12 left-4 z-10">
            <TouchableOpacity className="bg-black/50 rounded-full p-3" onPress={onClose}>
              <X size={24} color="white" />
            </TouchableOpacity>
          </View>

          <View className="flex-1 justify-center items-center">
            <View className="w-64 h-64 border-4 border-white rounded-xl items-center justify-center">
              {loading ? (
                <ActivityIndicator size="large" color="#FFF" />
              ) : (
                <Text className="text-white mt-2 text-center font-inter">Position barcode within the frame</Text>
              )}
            </View>
          </View>

          <View className="absolute bottom-20 w-full items-center px-6">
            <Text className="text-white text-center font-inter text-sm">
              Ensure barcode is clear and well-lit
            </Text>
          </View>
        </CameraView>
      </View>
    </Modal>
  );
}
