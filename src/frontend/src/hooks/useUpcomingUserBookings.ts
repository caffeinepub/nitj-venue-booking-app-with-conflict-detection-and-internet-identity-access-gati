import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Booking } from '@/backend';

export function useUpcomingUserBookings() {
  const { actor, isFetching } = useActor();

  return useQuery<Booking[]>({
    queryKey: ['upcoming-bookings'],
    queryFn: async () => {
      if (!actor) return [];
      
      // Get current date in YYYY-MM-DD format
      const currentDate = new Date().toISOString().split('T')[0];
      
      return actor.getUpcomingUserBookings(currentDate);
    },
    enabled: !!actor && !isFetching,
  });
}
