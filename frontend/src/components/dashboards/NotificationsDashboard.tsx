import { useUserNotifications } from '@/hooks/useUserNotifications';
import { usePendingVerificationRequests } from '@/hooks/usePendingVerificationRequests';
import { useApproveVerification } from '@/hooks/useApproveVerification';
import { useRejectVerification } from '@/hooks/useRejectVerification';
import { useCallerUserProfile } from '@/hooks/useCallerUserProfile';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, Inbox, UserCheck, UserX, Clock, Mail, Phone } from 'lucide-react';
import { ProfileRole } from '@/backend';
import type { Principal } from '@icp-sdk/core/principal';

const COORDINATOR_NOTIF_PREFIX = 'Coordination verification request received:';

export default function NotificationsDashboard() {
  const { data: notifications, isLoading: notifLoading, isError: notifError } = useUserNotifications();
  const { data: profile } = useCallerUserProfile();
  const isFaculty = profile?.role === ProfileRole.faculty;

  const {
    data: pendingRequests,
    isLoading: requestsLoading,
  } = usePendingVerificationRequests();

  const { mutate: approveRequest, isPending: isApproving, variables: approvingPrincipal } = useApproveVerification();
  const { mutate: rejectRequest, isPending: isRejecting, variables: rejectingPrincipal } = useRejectVerification();

  const isLoading = notifLoading || (isFaculty && requestsLoading);

  // For faculty: filter out coordinator verification notifications from general list
  // since they are shown in the dedicated pending requests section with action buttons
  const generalNotifications = notifications?.filter(
    (n) => !n.title.startsWith(COORDINATOR_NOTIF_PREFIX)
  ) ?? [];

  const hasPendingRequests = isFaculty && pendingRequests && pendingRequests.length > 0;
  const hasGeneralNotifications = generalNotifications.length > 0;
  const hasAnyContent = hasPendingRequests || hasGeneralNotifications;

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

  if (notifError && !hasAnyContent) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold">Notifications</h2>
        </div>
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Inbox className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground">No notifications</p>
              <p className="text-sm text-muted-foreground mt-2">You're all caught up!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasAnyContent) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold">Notifications</h2>
        </div>
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Inbox className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground">No notifications</p>
              <p className="text-sm text-muted-foreground mt-2">You're all caught up!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleApprove = (principal: Principal) => {
    approveRequest(principal);
  };

  const handleReject = (principal: Principal) => {
    rejectRequest(principal);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Notifications</h2>
        {isFaculty && hasPendingRequests && (
          <p className="text-sm text-muted-foreground mt-1">
            {pendingRequests!.length} coordinator verification{pendingRequests!.length !== 1 ? 's' : ''} pending your approval
          </p>
        )}
      </div>

      {/* Faculty: Pending Coordinator Verification Requests */}
      {isFaculty && hasPendingRequests && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary" />
            <h3 className="text-base font-semibold">Student Coordinator Verification Requests</h3>
            <Badge variant="secondary">{pendingRequests!.length} pending</Badge>
          </div>

          {pendingRequests!.map((request) => {
            const principalStr = request.principal.toString();
            const isThisApproving = isApproving && approvingPrincipal?.toString() === principalStr;
            const isThisRejecting = isRejecting && rejectingPrincipal?.toString() === principalStr;
            const isThisActing = isThisApproving || isThisRejecting;

            return (
              <Card key={principalStr} className="border-l-4 border-l-amber-400">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-amber-500" />
                        <Badge variant="secondary" className="text-xs">
                          Pending Approval
                        </Badge>
                      </div>
                      {request.contactDetails.name && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-semibold text-foreground text-base">{request.contactDetails.name}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{request.email}</span>
                      </div>
                      {request.contactDetails.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span>{request.contactDetails.phone}</span>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground font-mono break-all">
                        Principal: {principalStr}
                      </p>
                    </div>

                    <div className="flex gap-2 sm:flex-col sm:items-end">
                      <Button
                        size="sm"
                        className="flex-1 sm:flex-none gap-1"
                        onClick={() => handleApprove(request.principal)}
                        disabled={isApproving || isRejecting}
                      >
                        {isThisApproving ? (
                          <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                        ) : (
                          <UserCheck className="h-3 w-3" />
                        )}
                        {isThisApproving ? 'Approving...' : 'Approve'}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex-1 sm:flex-none gap-1"
                        onClick={() => handleReject(request.principal)}
                        disabled={isApproving || isRejecting}
                      >
                        {isThisRejecting ? (
                          <div className="h-3 w-3 animate-spin rounded-full border-2 border-destructive-foreground border-t-transparent" />
                        ) : (
                          <UserX className="h-3 w-3" />
                        )}
                        {isThisRejecting ? 'Rejecting...' : 'Reject'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* General Notifications (excluding coordinator verification ones for faculty) */}
      {hasGeneralNotifications && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <h3 className="text-base font-semibold">Recent Notifications</h3>
          </div>
          {generalNotifications.map((notification) => (
            <Card
              key={notification.id.toString()}
              className={notification.isRead ? 'opacity-70' : 'border-l-4 border-l-primary'}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Bell className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{notification.title}</p>
                    <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">{notification.content}</p>
                  </div>
                  {!notification.isRead && (
                    <Badge variant="default" className="text-xs shrink-0">New</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
