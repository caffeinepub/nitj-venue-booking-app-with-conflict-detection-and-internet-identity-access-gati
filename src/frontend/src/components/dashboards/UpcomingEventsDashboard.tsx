import { useState } from 'react';
import { useUpcomingUserBookings } from '@/hooks/useUpcomingUserBookings';
import { useCancelBookings } from '@/hooks/useCancelBookings';
import { useIsStudentReadOnly } from '@/hooks/useIsStudentReadOnly';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, AlertCircle, Eye } from 'lucide-react';
import { normalizeVenueLabel } from '@/utils/venueLabel';
import { BookingStatus } from '@/backend';
import type { Booking } from '@/backend';
import UpcomingEventDetailView from './UpcomingEventDetailView';
import UpcomingEventSelectionToolbar from './UpcomingEventSelectionToolbar';

export default function UpcomingEventsDashboard() {
  const { data: bookings, isLoading, isError } = useUpcomingUserBookings();
  const { mutate: cancelBookings, isPending: isCancelling, isError: isCancelError, error: cancelError } = useCancelBookings();
  const { hasBookingPermissions } = useIsStudentReadOnly();
  const [selectedBookingIds, setSelectedBookingIds] = useState<Set<bigint>>(new Set());
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null);

  const formatTime = (time: string) => {
    const hours = time.slice(0, -2).padStart(2, '0');
    const mins = time.slice(-2);
    return `${hours}:${mins}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
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

  const handleToggleSelection = (bookingId: bigint) => {
    const newSelection = new Set(selectedBookingIds);
    if (newSelection.has(bookingId)) {
      newSelection.delete(bookingId);
    } else {
      newSelection.add(bookingId);
    }
    setSelectedBookingIds(newSelection);
  };

  const handleSelectAll = () => {
    if (!bookings) return;
    const allIds = bookings.map(b => b.id);
    setSelectedBookingIds(new Set(allIds));
  };

  const handleClearSelection = () => {
    setSelectedBookingIds(new Set());
  };

  const handleCancelSelected = () => {
    const idsArray = Array.from(selectedBookingIds);
    cancelBookings(idsArray, {
      onSuccess: () => {
        setSelectedBookingIds(new Set());
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-sm text-muted-foreground">Loading upcoming events...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load upcoming events. Please try again.</AlertDescription>
      </Alert>
    );
  }

  if (detailBooking) {
    return (
      <UpcomingEventDetailView
        booking={detailBooking}
        onClose={() => setDetailBooking(null)}
      />
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No upcoming events</p>
            <p className="text-sm text-muted-foreground mt-2">Your approved bookings will appear here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {hasBookingPermissions && selectedBookingIds.size > 0 && (
        <UpcomingEventSelectionToolbar
          selectedCount={selectedBookingIds.size}
          onClearSelection={handleClearSelection}
          onCancelSelected={handleCancelSelected}
          isLoading={isCancelling}
        />
      )}

      {isCancelError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{cancelError?.message || 'Failed to cancel bookings'}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4">
        {bookings.map((booking) => (
          <Card key={booking.id.toString()} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {hasBookingPermissions && (
                    <Checkbox
                      checked={selectedBookingIds.has(booking.id)}
                      onCheckedChange={() => handleToggleSelection(booking.id)}
                      className="mt-1"
                    />
                  )}
                  <div className="flex-1">
                    <CardTitle className="text-xl">{booking.clubName}</CardTitle>
                    <CardDescription className="mt-1">
                      <div className="flex flex-wrap gap-3 mt-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(booking.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {normalizeVenueLabel(booking.venue)}
                        </span>
                      </div>
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(booking.status)}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDetailBooking(booking)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {hasBookingPermissions && bookings.length > 1 && selectedBookingIds.size === 0 && (
        <Button variant="outline" onClick={handleSelectAll} className="w-full">
          Select All
        </Button>
      )}
    </div>
  );
}
