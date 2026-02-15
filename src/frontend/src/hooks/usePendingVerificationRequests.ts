import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { VerificationRequest } from '@/backend';

export function usePendingVerificationRequests() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<VerificationRequest[]>({
    queryKey: ['pendingVerificationRequests'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getPendingVerificationRequests();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}
