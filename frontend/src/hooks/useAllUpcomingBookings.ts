import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Booking } from '@/backend';

/**
 * Fetches all upcoming approved bookings system-wide using getAllUpcomingBookings.
 * Returns all approved bookings from today onward for all authenticated users.
 */
export function useAllUpcomingBookings() {
  const { actor, isFetching } = useActor();

  return useQuery<Booking[]>({
    queryKey: ['allUpcomingBookings'],
    queryFn: async () => {
      if (!actor) return [];
      const today = new Date().toISOString().split('T')[0];
      return actor.getAllUpcomingBookings(today);
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30_000,
  });
}
