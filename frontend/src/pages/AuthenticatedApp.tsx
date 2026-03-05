import { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, User, Bell, BookOpen } from 'lucide-react';
import ProfileDashboard from '@/components/dashboards/ProfileDashboard';
import UpcomingEventsDashboard from '@/components/dashboards/UpcomingEventsDashboard';
import NotificationsDashboard from '@/components/dashboards/NotificationsDashboard';
import BookingPage from './BookingPage';

export default function AuthenticatedApp() {
  const [activeTab, setActiveTab] = useState('booking');

  return (
    <AppShell>
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="booking" className="gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Booking</span>
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Upcoming Events</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="booking" className="space-y-6">
            <BookingPage />
          </TabsContent>

          <TabsContent value="upcoming">
            <UpcomingEventsDashboard />
          </TabsContent>

          <TabsContent value="profile">
            <ProfileDashboard />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationsDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
