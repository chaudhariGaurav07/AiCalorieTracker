import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';
import '../global.css';

export default function Index() {
  const { user, hasGoal, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!loading) {
        if (!user) router.replace('/auth/login');
        else if (!hasGoal) router.replace('/set-goal');
        else router.replace('/(tabs)');
      }
    }, 500); // slight delay
  
    return () => clearTimeout(timeout);
  }, [user, hasGoal, loading, router]);
  

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <ActivityIndicator size="large" color="#0ea5e9" />
    </View>
  );
}
