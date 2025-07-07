import { useEffect, useState } from 'react';
import { Pedometer } from 'expo-sensors';

export const useSteps = () => {
  const [steps, setSteps] = useState(0);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    let subscription: any;

    const subscribe = async () => {
      const available = await Pedometer.isAvailableAsync();
      setIsAvailable(available);

      if (available) {
        const now = new Date();
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const result = await Pedometer.getStepCountAsync(startOfDay, now);
        setSteps(result.steps);

        subscription = Pedometer.watchStepCount(result => {
          setSteps(prev => prev + result.steps);
        });
      }
    };

    subscribe();

    return () => {
      if (subscription) subscription.remove();
    };
  }, []);

  return { steps, isAvailable };
};
