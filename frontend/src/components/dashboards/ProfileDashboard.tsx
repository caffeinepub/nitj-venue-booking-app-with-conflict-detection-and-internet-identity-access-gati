import { useCallerUserProfile } from '@/hooks/useCallerUserProfile';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Shield, Key, CheckCircle, Clock, XCircle } from 'lucide-react';
import { ProfileRole, VerificationStatus } from '@/backend';

export default function ProfileDashboard() {
  const { identity } = useInternetIdentity();
  const { data: profile, isLoading, isError } = useCallerUserProfile();

  const principal = identity?.getPrincipal().toString();

  const getRoleLabel = (role: ProfileRole) => {
    switch (role) {
      case ProfileRole.faculty:
        return 'Faculty';
      case ProfileRole.studentCoordinator:
        return 'Student Coordinator';
      case ProfileRole.student:
        return 'Student';
      default:
        return 'Unknown';
    }
  };

  const getVerificationBadge = (status: VerificationStatus) => {
    switch (status) {
      case VerificationStatus.verified:
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        );
      case VerificationStatus.pending:
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Pending Faculty Approval
          </Badge>
        );
      case VerificationStatus.unverified:
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Unverified
          </Badge>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-sm text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load profile. Please try again.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">Your Profile</CardTitle>
              <CardDescription>View your account information and role</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Email Address</p>
                <p className="text-base font-medium">{profile?.email || 'Not available'}</p>
              </div>
            </div>

            <Separator />

            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Role</p>
                <Badge variant="secondary" className="mt-1">
                  {profile ? getRoleLabel(profile.role) : 'Not available'}
                </Badge>
              </div>
            </div>

            {profile?.role === ProfileRole.studentCoordinator && (
              <>
                <Separator />
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Verification Status</p>
                    <div className="mt-1">
                      {getVerificationBadge(profile.verificationStatus)}
                    </div>
                    {profile.verificationStatus === VerificationStatus.pending && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Your account is currently under review by faculty. You will be notified once approved.
                      </p>
                    )}
                    {profile.verificationStatus === VerificationStatus.unverified && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Your account requires faculty verification. Please contact a faculty member.
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}

            <Separator />

            <div className="flex items-start gap-3">
              <Key className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Principal ID</p>
                <p className="text-xs font-mono break-all mt-1 text-muted-foreground">
                  {principal || 'Not available'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
