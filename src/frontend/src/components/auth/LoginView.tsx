import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, LogIn } from 'lucide-react';

export default function LoginView() {
  const { login, isLoggingIn, isLoginError, loginError } = useInternetIdentity();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-8">
        {/* Banner */}
        <div className="w-full overflow-hidden rounded-lg shadow-lg">
          <img
            src="/assets/generated/nitj-booking-banner.dim_1600x400.png"
            alt="NITJ Venue Booking"
            className="w-full h-auto object-cover"
          />
        </div>

        {/* Login Card */}
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <img
                src="/assets/generated/nitj-booking-logo.dim_512x512.png"
                alt="NITJ Logo"
                className="h-20 w-20 object-contain"
              />
            </div>
            <CardTitle className="text-3xl font-bold">Welcome to NITJ Venue Booking</CardTitle>
            <CardDescription className="text-base">
              Automated club venue scheduling with conflict detection
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Sign in with Internet Identity to access the booking system. Only faculty and student coordinators
                with official NITJ email addresses can make bookings.
              </p>

              {isLoginError && loginError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{loginError.message}</AlertDescription>
                </Alert>
              )}

              <Button onClick={login} disabled={isLoggingIn} className="w-full" size="lg">
                {isLoggingIn ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-5 w-5" />
                    Sign In with Internet Identity
                  </>
                )}
              </Button>
            </div>

            <div className="pt-4 border-t">
              <h3 className="font-semibold text-sm mb-2">Features:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Automatic conflict detection</li>
                <li>• Instant booking approval</li>
                <li>• Real-time schedule visibility</li>
                <li>• No more double bookings</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
