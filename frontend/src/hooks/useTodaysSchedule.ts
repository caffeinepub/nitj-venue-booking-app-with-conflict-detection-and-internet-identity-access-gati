import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Booking } from '@/backend';

export function useTodaysSchedule() {
  const { actor, isFetching } = useActor();

  return useQuery<Booking[]>({
    queryKey: ['todays-schedule'],
    queryFn: async () => {
      if (!actor) return [];
      
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
      
      return actor.getTodaysSchedule(today);
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}
