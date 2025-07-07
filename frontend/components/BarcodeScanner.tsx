import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { X } from 'lucide-react-native';

interface BarcodeScannerProps {
  visible: boolean;
  onClose: () => void;
  onScan?: (data: string) => void; // Optional callback
}

export default function BarcodeScanner({
  visible,
  onClose,
  onScan,
}: BarcodeScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (visible) setScanned(false); // reset scan when re-opened
  }, [visible]);

  if (Platform.OS === 'web') {
    return (
      <Modal visible={visible} animationType="slide">
        <View className="flex-1 justify-center items-center bg-gray-900">
          <View className="bg-white rounded-xl p-6 mx-4">
            <Text className="text-lg font-inter-bold mb-4 text-center">
              Camera Not Available
            </Text>
            <Text className="text-gray-600 font-inter mb-4 text-center">
              Barcode scanning is not supported on web. Please use a mobile device.
            </Text>
            <TouchableOpacity
              className="bg-primary-500 rounded-xl py-3 px-6"
              onPress={onClose}
            >
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
            <Text className="text-lg font-inter-bold mb-4 text-center">
              Camera Permission Required
            </Text>
            <Text className="text-gray-600 font-inter mb-4 text-center">
              This feature requires camera access to scan barcodes.
            </Text>
            <TouchableOpacity
              className="bg-primary-500 rounded-xl py-3 px-6 mb-3"
              onPress={requestPermission}
            >
              <Text className="text-white font-inter-bold text-center">
                Grant Permission
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-gray-500 rounded-xl py-3 px-6"
              onPress={onClose}
            >
              <Text className="text-white font-inter-bold text-center">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  const handleBarCodeScanned = ({ data, type }: { data: string; type: string }) => {
    if (scanned) return;
    setScanned(true);

    // optional callback
    if (onScan) onScan(data);

    Alert.alert('Barcode Scanned', `Type: ${type}\nData: ${data}`, [
      {
        text: 'OK',
        onPress: () => {
          setScanned(false);
          onClose();
        },
      },
    ]);
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View className="flex-1 bg-black">
        <CameraView
          className="flex-1"
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr', 'ean13', 'code128', 'upc_a', 'upc_e'] }}
          onBarcodeScanned={handleBarCodeScanned}
        >
          {/* Top Close Button */}
          <View className="absolute top-12 left-4 z-10">
            <TouchableOpacity
              className="bg-black/50 rounded-full p-3"
              onPress={onClose}
            >
              <X size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Scan box */}
          <View className="flex-1 justify-center items-center">
            <View className="w-64 h-64 border-4 border-white rounded-xl items-center justify-center">
              <Text className="text-white mt-2 text-center font-inter">
                Position barcode within the frame
              </Text>
            </View>
          </View>

          {/* Instruction text */}
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
