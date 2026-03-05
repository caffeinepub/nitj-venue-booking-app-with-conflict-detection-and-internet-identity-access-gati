import { useState } from 'react';
import { useRegisterProfile } from '@/hooks/useRegisterProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, CheckCircle2, Mail, User, Phone, Info } from 'lucide-react';
import { ProfileRole } from '@/backend';

export default function RegistrationGate() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<ProfileRole | ''>('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [validationError, setValidationError] = useState('');

  const { mutate: registerProfile, isPending, isError, error } = useRegisterProfile();

  const validatePhone = (phone: string): boolean => {
    // Allow digits, spaces, +, and -
    return /^[\d\s+\-]+$/.test(phone);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    // Validate email
    const emailLower = email.toLowerCase().trim();
    if (!emailLower.endsWith('nitj.ac.in')) {
      setValidationError('Email must end with @nitj.ac.in');
      return;
    }

    if (!role) {
      setValidationError('Please select your role');
      return;
    }

    // Validate contact details
    if (!contactName.trim()) {
      setValidationError('Please provide your contact name');
      return;
    }

    if (!contactPhone.trim()) {
      setValidationError('Please provide your contact phone number');
      return;
    }

    if (!validatePhone(contactPhone)) {
      setValidationError('Phone number can only contain digits, spaces, +, and -');
      return;
    }

    registerProfile({ 
      email: emailLower, 
      role,
      contactDetails: {
        name: contactName.trim(),
        phone: contactPhone.trim(),
      }
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Complete Your Profile</CardTitle>
          <CardDescription>
            Enter your official NITJ email address and contact details to access the booking system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Official Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.name@nitj.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isPending}
              />
              <p className="text-xs text-muted-foreground">Must end with @nitj.ac.in</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={(value) => setRole(value as ProfileRole)} disabled={isPending}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ProfileRole.student}>Student</SelectItem>
                  <SelectItem value={ProfileRole.studentCoordinator}>Student Coordinator</SelectItem>
                  <SelectItem value={ProfileRole.faculty}>Faculty</SelectItem>
                </SelectContent>
              </Select>
              {role === ProfileRole.studentCoordinator && (
                <Alert className="mt-2">
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Student Coordinators must be approved by Faculty before they can create or cancel venue bookings.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactName">
                <User className="inline h-4 w-4 mr-1" />
                Contact Name
              </Label>
              <Input
                id="contactName"
                type="text"
                placeholder="e.g., John Doe"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                required
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPhone">
                <Phone className="inline h-4 w-4 mr-1" />
                Contact Phone
              </Label>
              <Input
                id="contactPhone"
                type="tel"
                placeholder="e.g., +91 98765 43210"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                required
                disabled={isPending}
              />
            </div>

            {validationError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{validationError}</AlertDescription>
              </Alert>
            )}

            {isError && error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error.message}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Registering...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Complete Registration
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong>Note:</strong> Students have read-only access to view schedules. Student Coordinators require faculty approval before gaining booking permissions. Faculty members have full access immediately.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
