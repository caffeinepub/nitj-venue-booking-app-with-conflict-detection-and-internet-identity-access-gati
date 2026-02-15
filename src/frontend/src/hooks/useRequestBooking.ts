import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { BookingResponse, ContactDetails } from '@/backend';

interface RequestBookingParams {
  clubName: string;
  eventDescription: string;
  clubContact: ContactDetails;
  venue: string;
  date: string;
  startTime: string;
  endTime: string;
  expectedAudience: number;
  confirmRestGap?: boolean;
}

export function useRequestBooking() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<BookingResponse, Error, RequestBookingParams>({
    mutationFn: async ({ 
      clubName,
      eventDescription,
      clubContact, 
      venue, 
      date, 
      startTime, 
      endTime, 
      expectedAudience,
      confirmRestGap = false
    }: RequestBookingParams) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.requestBooking(
        clubName,
        eventDescription,
        clubContact, 
        venue, 
        date, 
        startTime, 
        endTime, 
        BigInt(expectedAudience),
        confirmRestGap
      );
    },
    onSuccess: (response) => {
      // Only invalidate queries if booking was successfully created
      if (response.__kind__ === 'success') {
        queryClient.invalidateQueries({ queryKey: ['todays-schedule'] });
        queryClient.invalidateQueries({ queryKey: ['upcoming-bookings'] });
        queryClient.invalidateQueries({ queryKey: ['user-bookings'] });
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      }
    },
  });
}
