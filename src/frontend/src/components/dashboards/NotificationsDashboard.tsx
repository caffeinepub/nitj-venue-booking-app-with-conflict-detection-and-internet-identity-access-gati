import { useUserNotifications } from '@/hooks/useUserNotifications';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bell, Inbox } from 'lucide-react';

export default function NotificationsDashboard() {
  const { data: notifications, isLoading, isError } = useUserNotifications();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-sm text-muted-foreground">Loading notifications...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load notifications. Please try again.</AlertDescription>
      </Alert>
    );
  }

  if (!notifications || notifications.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <Inbox className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No notifications</p>
            <p className="text-sm text-muted-foreground mt-2">You're all caught up!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Notifications</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {notifications.length} {notifications.length === 1 ? 'notification' : 'notifications'}
        </p>
      </div>

      <div className="space-y-3">
        {notifications.map((notification, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Bell className="h-5 w-5 text-primary mt-0.5" />
                <p className="text-sm flex-1">{notification}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
