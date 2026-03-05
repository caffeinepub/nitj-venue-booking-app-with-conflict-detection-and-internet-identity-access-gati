import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useRegistrationStatus() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['registration-status'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isUserRegistered();
    },
    enabled: !!actor && !isFetching,
  });
}
