import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { ProfileRole, ContactDetails } from '@/backend';

interface RegisterProfileParams {
  email: string;
  role: ProfileRole;
  contactDetails: ContactDetails;
}

export function useRegisterProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, role, contactDetails }: RegisterProfileParams) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.registerProfile(email, role, contactDetails);
    },
    onSuccess: () => {
      // Invalidate registration status to unlock the app
      queryClient.invalidateQueries({ queryKey: ['registration-status'] });
    },
  });
}
