import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, Scan } from "lucide-react-native";
import { Camera, CameraType } from "expo-camera";
export default function BarcodeScannerScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const router = useRouter();
  const cameraRef = useRef<Camera>(null);

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = ({
    type,
    data,
  }: {
    type: string;
    data: string;
  }) => {
    setScanned(true);
    Alert.alert("Barcode Scanned", `Barcode data: ${data}\nType: ${type}`, [
      {
        text: "Scan Again",
        onPress: () => setScanned(false),
      },
      {
        text: "OK",
        onPress: () => router.back(),
      },
    ]);
  };

  if (hasPermission === null) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-600">Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 px-6">
        <Scan size={64} color="#9CA3AF" />
        <Text className="text-xl font-semibold text-gray-800 mt-4 text-center">
          Camera Permission Required
        </Text>
        <Text className="text-gray-600 mt-2 text-center">
          Please enable camera access to scan barcodes
        </Text>
        <TouchableOpacity
          className="bg-primary-500 rounded-xl py-3 px-6 mt-6"
          onPress={() => router.back()}
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      {/* Top Header Controls */}
      <View className="absolute top-12 left-4 z-10">
        <TouchableOpacity
          className="bg-white/20 rounded-full p-3"
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View className="absolute top-12 right-4 z-10">
        <Text className="text-white font-semibold">Barcode Scanner</Text>
      </View>

      {/* Camera Feed */}
      <Camera
        ref={cameraRef}
        className="flex-1"
        type={CameraType.back}
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
      />

      {/* Scan Frame */}
      <View className="absolute inset-0 justify-center items-center">
        <View className="w-64 h-64 border-2 border-white rounded-2xl">
          <View className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-white rounded-tl-2xl" />
          <View className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-white rounded-tr-2xl" />
          <View className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-white rounded-bl-2xl" />
          <View className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-white rounded-br-2xl" />
        </View>
      </View>

      {/* Instruction Text */}
      <View className="absolute bottom-20 left-0 right-0 items-center">
        <Text className="text-white text-lg font-semibold mb-2">
          Position barcode within the frame
        </Text>
        <Text className="text-white/80 text-center px-6">
          Hold your device steady and ensure the barcode is clearly visible
        </Text>
      </View>

      {/* Scan Again Button */}
      {scanned && (
        <TouchableOpacity
          className="absolute bottom-8 left-4 right-4 bg-primary-500 rounded-xl py-3"
          onPress={() => setScanned(false)}
        >
          <Text className="text-white font-semibold text-center text-lg">
            Tap to Scan Again
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
