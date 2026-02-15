import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { LogOut, Calendar } from 'lucide-react';
import { type ReactNode } from 'react';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const { clear, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const principal = identity?.getPrincipal().toString();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src="/assets/generated/nitj-booking-logo.dim_512x512.png"
                alt="NITJ Booking"
                className="h-12 w-12 object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold tracking-tight">NITJ Venue Booking</h1>
                <p className="text-sm text-muted-foreground">Club Scheduling System</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {principal && (
                <div className="hidden md:block text-right">
                  <p className="text-xs text-muted-foreground">Logged in as</p>
                  <p className="text-sm font-mono truncate max-w-[200px]" title={principal}>
                    {principal.slice(0, 8)}...{principal.slice(-6)}
                  </p>
                </div>
              )}
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="border-t bg-card mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>© {new Date().getFullYear()} NIT Jalandhar Venue Booking System</span>
            </div>
            <div>
              Built with ❤️ using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                  typeof window !== 'undefined' ? window.location.hostname : 'nitj-booking'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium hover:text-foreground transition-colors underline"
              >
                caffeine.ai
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
