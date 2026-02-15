import BookingForm from '@/components/booking/BookingForm';
import TodayScheduleTable from '@/components/schedule/TodayScheduleTable';
import { useIsStudentReadOnly } from '@/hooks/useIsStudentReadOnly';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, Clock } from 'lucide-react';

export default function BookingPage() {
  const { isStudentReadOnly, readOnlyReason, isLoading } = useIsStudentReadOnly();

  const getReadOnlyMessage = () => {
    switch (readOnlyReason) {
      case 'student':
        return {
          title: 'Read-Only Access',
          description: 'As a student, you have view-only access to the booking system. You can view schedules and event details, but cannot create or cancel bookings.',
        };
      case 'pending-approval':
        return {
          title: 'Pending Faculty Approval',
          description: 'Your Student Coordinator registration is currently under review by faculty. You will be able to create and cancel bookings once your account is approved.',
        };
      case 'unverified':
        return {
          title: 'Verification Required',
          description: 'Your Student Coordinator account requires faculty verification before you can access booking features. Please contact a faculty member.',
        };
      default:
        return null;
    }
  };

  const readOnlyMessage = getReadOnlyMessage();

  return (
    <div className="space-y-8">
      {/* Booking Form Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Request Venue Booking</CardTitle>
          <CardDescription>
            Submit your club's venue booking request. Bookings are automatically approved if no conflicts exist.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : isStudentReadOnly && readOnlyMessage ? (
            <Alert>
              {readOnlyReason === 'pending-approval' ? (
                <Clock className="h-4 w-4" />
              ) : (
                <Info className="h-4 w-4" />
              )}
              <AlertTitle>{readOnlyMessage.title}</AlertTitle>
              <AlertDescription>
                {readOnlyMessage.description}
              </AlertDescription>
            </Alert>
          ) : (
            <BookingForm />
          )}
        </CardContent>
      </Card>

      <Separator className="my-8" />

      {/* Today's Schedule Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Today's Confirmed Schedule</CardTitle>
          <CardDescription>
            View all approved bookings for today to find available time slots.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TodayScheduleTable />
        </CardContent>
      </Card>
    </div>
  );
}
