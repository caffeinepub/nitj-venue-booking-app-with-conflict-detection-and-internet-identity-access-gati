import { useTodaysSchedule } from '@/hooks/useTodaysSchedule';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { normalizeVenueLabel } from '@/utils/venueLabel';
import { BookingStatus } from '@/backend';

export default function TodayScheduleTable() {
  const { data: bookings, isLoading, isError } = useTodaysSchedule();

  const formatTime = (time: string) => {
    // Convert HHMM to HH:MM
    const hours = time.slice(0, -2).padStart(2, '0');
    const mins = time.slice(-2);
    return `${hours}:${mins}`;
  };

  // Filter out cancelled bookings defensively and ensure all required fields exist
  const activeBookings = bookings?.filter(b => 
    b.status !== BookingStatus.cancelled && 
    b.clubName && 
    b.venue && 
    b.startTime && 
    b.endTime
  ) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-sm text-muted-foreground">Loading schedule...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load today's schedule. Please try again.</AlertDescription>
      </Alert>
    );
  }

  if (activeBookings.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-lg font-medium text-muted-foreground">No bookings for today</p>
        <p className="text-sm text-muted-foreground mt-2">All venues are available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Calendar className="h-4 w-4" />
        <span>
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </span>
        <Badge variant="secondary" className="ml-2">
          {activeBookings.length} {activeBookings.length === 1 ? 'booking' : 'bookings'}
        </Badge>
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Users className="inline h-4 w-4 mr-1" />
                Club Name
              </TableHead>
              <TableHead>
                <MapPin className="inline h-4 w-4 mr-1" />
                Venue
              </TableHead>
              <TableHead>
                <Clock className="inline h-4 w-4 mr-1" />
                Start Time
              </TableHead>
              <TableHead>
                <Clock className="inline h-4 w-4 mr-1" />
                End Time
              </TableHead>
              <TableHead>Duration</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activeBookings.map((booking) => {
              const startInt = parseInt(booking.startTime);
              const endInt = parseInt(booking.endTime);
              const durationMins = Math.floor((endInt - startInt) / 100) * 60 + ((endInt - startInt) % 100);
              const hours = Math.floor(durationMins / 60);
              const mins = durationMins % 60;
              const durationStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

              return (
                <TableRow key={booking.id.toString()}>
                  <TableCell className="font-medium">{booking.clubName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{normalizeVenueLabel(booking.venue)}</Badge>
                  </TableCell>
                  <TableCell>{formatTime(booking.startTime)}</TableCell>
                  <TableCell>{formatTime(booking.endTime)}</TableCell>
                  <TableCell className="text-muted-foreground">{durationStr}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
