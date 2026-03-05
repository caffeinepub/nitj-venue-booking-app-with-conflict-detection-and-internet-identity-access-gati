import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Principal } from '@dfinity/principal';

export function useApproveVerificationRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (studentCoordinatorPrincipal: Principal) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.approveVerificationRequest(studentCoordinatorPrincipal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingVerificationRequests'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}
