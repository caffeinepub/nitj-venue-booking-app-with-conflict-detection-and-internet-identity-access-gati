import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useUserNotifications() {
  const { actor, isFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserNotifications();
    },
    enabled: !!actor && !isFetching,
  });
}
