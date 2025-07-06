import { Stack, Link } from 'expo-router';
import { View, Text } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className="flex-1 justify-center items-center bg-white px-4">
        <Text className="text-2xl font-bold text-center text-black">
          This screen doesn't exist.
        </Text>
        <Link href="/(tabs)/dashboard" className="mt-6 text-blue-600 font-medium">
          Go to Dashboard
        </Link>
      </View>
    </>
  );
}
