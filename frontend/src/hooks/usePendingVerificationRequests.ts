import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { VerificationRequest } from '@/backend';
import { ProfileRole } from '@/backend';
import { useCallerUserProfile } from './useCallerUserProfile';

/**
 * Fetches pending verification requests for faculty users.
 * Only enabled when the current user is a faculty member.
 */
export function usePendingVerificationRequests() {
  const { actor, isFetching } = useActor();
  const { data: profile } = useCallerUserProfile();

  const isFaculty = profile?.role === ProfileRole.faculty;

  return useQuery<VerificationRequest[]>({
    queryKey: ['pendingVerificationRequests'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPendingVerificationRequests();
    },
    enabled: !!actor && !isFetching && isFaculty,
    refetchInterval: 30_000,
  });
}
