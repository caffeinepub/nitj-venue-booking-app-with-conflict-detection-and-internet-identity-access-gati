import { useCancelBooking } from '@/hooks/useCancelBooking';
import { useIsStudentReadOnly } from '@/hooks/useIsStudentReadOnly';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Clock, MapPin, Users, X, AlertCircle, User, Phone, FileText } from 'lucide-react';
import { normalizeVenueLabel } from '@/utils/venueLabel';
import type { Booking } from '@/backend';
import { BookingStatus } from '@/backend';
import { useState } from 'react';

interface UpcomingEventDetailViewProps {
  booking: Booking;
  onClose: () => void;
}

export default function UpcomingEventDetailView({ booking, onClose }: UpcomingEventDetailViewProps) {
  const { mutate: cancelBooking, isPending, isError, error } = useCancelBooking();
  const { hasBookingPermissions } = useIsStudentReadOnly();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const formatTime = (time: string) => {
    const hours = time.slice(0, -2).padStart(2, '0');
    const mins = time.slice(-2);
    return `${hours}:${mins}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.approved:
        return <Badge className="bg-green-500">Approved</Badge>;
      case BookingStatus.pending:
        return <Badge variant="secondary">Pending</Badge>;
      case BookingStatus.rejected:
        return <Badge variant="destructive">Rejected</Badge>;
      case BookingStatus.cancelled:
        return <Badge variant="outline">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleCancelBooking = () => {
    cancelBooking(booking.id, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  const canCancel = hasBookingPermissions && booking.status === BookingStatus.approved;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Event Details</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{booking.clubName}</CardTitle>
              <CardDescription className="mt-2">Booking ID: {booking.id.toString()}</CardDescription>
            </div>
            {getStatusBadge(booking.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date</p>
                <p className="text-base font-medium">{formatDate(booking.date)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Time</p>
                <p className="text-base font-medium">
                  {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Venue</p>
                <p className="text-base font-medium">{normalizeVenueLabel(booking.venue)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expected Audience</p>
                <p className="text-base font-medium">{booking.expectedAudience.toString()}</p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Event Description</p>
                {booking.eventDescription && booking.eventDescription.trim() ? (
                  <p className="text-base mt-1 whitespace-pre-wrap">{booking.eventDescription}</p>
                ) : (
                  <p className="text-sm text-muted-foreground italic mt-1">No description provided</p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Club Contact Details</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Contact Name</p>
                  <p className="text-base font-medium">{booking.clubContact.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Contact Phone</p>
                  <p className="text-base font-medium">{booking.clubContact.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {canCancel && (
            <>
              <Separator />
              <div className="space-y-4">
                {!showCancelConfirm ? (
                  <Button
                    variant="destructive"
                    onClick={() => setShowCancelConfirm(true)}
                    className="w-full"
                  >
                    Cancel This Booking
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Are you sure you want to cancel this booking? This action cannot be undone.
                      </AlertDescription>
                    </Alert>
                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        onClick={handleCancelBooking}
                        disabled={isPending}
                        className="flex-1"
                      >
                        {isPending ? (
                          <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                            Cancelling...
                          </>
                        ) : (
                          'Confirm Cancellation'
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowCancelConfirm(false)}
                        disabled={isPending}
                        className="flex-1"
                      >
                        Keep Booking
                      </Button>
                    </div>
                  </div>
                )}

                {isError && error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error.message}</AlertDescription>
                  </Alert>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
