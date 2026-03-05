import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Principal } from '@icp-sdk/core/principal';

export function useRejectVerification() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (principalId: Principal) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.rejectVerificationRequest(principalId);
      // Clear the pending-approval notification from all faculty accounts
      try {
        await actor.resolveCoordinatorVerificationNotifications(principalId);
      } catch {
        // Non-critical: proceed even if notification cleanup fails
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingVerificationRequests'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}
