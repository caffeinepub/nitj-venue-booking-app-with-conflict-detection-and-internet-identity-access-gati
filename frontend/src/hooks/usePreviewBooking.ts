import { useMutation } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { ValidationWarning, ContactDetails } from '@/backend';

interface PreviewBookingParams {
  clubName: string;
  eventDescription: string;
  clubContact: ContactDetails;
  venue: string;
  date: string;
  startTime: string;
  endTime: string;
  expectedAudience: number;
}

export function usePreviewBooking() {
  const { actor } = useActor();

  return useMutation<ValidationWarning | null, Error, PreviewBookingParams>({
    mutationFn: async ({ 
      clubName,
      eventDescription,
      clubContact, 
      venue, 
      date, 
      startTime, 
      endTime, 
      expectedAudience
    }: PreviewBookingParams) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.previewBooking(
        clubName,
        eventDescription,
        clubContact, 
        venue, 
        date, 
        startTime, 
        endTime, 
        BigInt(expectedAudience)
      );
    },
  });
}
