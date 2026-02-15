import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useCancelBookings() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingIds: bigint[]) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.cancelBookings(bookingIds);
    },
    onSuccess: () => {
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ['todays-schedule'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['user-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
