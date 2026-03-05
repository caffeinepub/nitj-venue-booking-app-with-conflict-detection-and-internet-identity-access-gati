import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Notification } from '@/backend';

export function useUserNotifications() {
  const { actor, isFetching } = useActor();

  return useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserNotifications();
    },
    enabled: !!actor && !isFetching,
  });
}
