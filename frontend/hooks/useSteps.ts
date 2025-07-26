import { useEffect, useState } from "react";
import { Platform, PermissionsAndroid, Alert } from "react-native";
import { Pedometer } from "expo-sensors";

export const useSteps = () => {
  const [steps, setSteps] = useState(0);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let subscription: any;

    const requestPermission = async () => {
      if (Platform.OS === "android" && Platform.Version >= 29) {
        console.log("🔑 Requesting motion permission...");

        const timeout = setTimeout(() => {
          setError("Permission request timed out");
          console.warn("⏰ Permission request timed out — device might be blocking it");
        }, 4000);

        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION,
            {
              title: "Motion Permission",
              message: "We need access to track your steps.",
              buttonPositive: "OK",
            }
          );

          clearTimeout(timeout);

          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            setError("Permission denied");
            return false;
          }
        } catch (err) {
          clearTimeout(timeout);
          setError("Permission error");
          return false;
        }
      }

      return true;
    };

    const subscribe = async () => {
      console.log("🔄 Subscribing to step counter...");

      const permissionGranted = await requestPermission();
      if (!permissionGranted) {
        setError("Motion permission not granted");
        return;
      }

      try {
        const available = await Pedometer.isAvailableAsync();
        console.log("👟 Is pedometer available?", available);
        setIsAvailable(available);

        if (!available) {
          setError("Step counter not available");
          return;
        }

        console.log("✅ Step detection working");

        subscription = Pedometer.watchStepCount(result => {
          console.log("📶 New step event:", result.steps);
          setSteps(prev => prev + result.steps);
        });
      } catch (err) {
        console.warn("❌ Error watching steps:", err);
        setError("Step tracking error");
      }
    };

    subscribe();

    return () => {
      if (subscription) subscription.remove();
    };
  }, []);

  return { steps, isAvailable, error };
};
