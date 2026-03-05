import { useCallerUserProfile } from './useCallerUserProfile';
import { ProfileRole, VerificationStatus } from '@/backend';

/**
 * Hook to determine if the current user has booking permissions.
 * Returns read-only status and reason for UI messaging.
 */
export function useIsStudentReadOnly() {
  const { data: profile, isLoading } = useCallerUserProfile();

  // Students always have read-only access
  const isStudent = profile?.role === ProfileRole.student;

  // Student Coordinators need verification
  const isUnverifiedCoordinator = 
    profile?.role === ProfileRole.studentCoordinator && 
    (profile?.verificationStatus === VerificationStatus.unverified || 
     profile?.verificationStatus === VerificationStatus.pending);

  // Faculty always have full access
  const isFaculty = profile?.role === ProfileRole.faculty;

  // Verified coordinators have full access
  const isVerifiedCoordinator = 
    profile?.role === ProfileRole.studentCoordinator && 
    profile?.verificationStatus === VerificationStatus.verified;

  const isStudentReadOnly = isStudent || isUnverifiedCoordinator;
  const hasBookingPermissions = isFaculty || isVerifiedCoordinator;

  // Determine the reason for read-only status
  let readOnlyReason: 'student' | 'pending-approval' | 'unverified' | null = null;
  if (isStudent) {
    readOnlyReason = 'student';
  } else if (profile?.role === ProfileRole.studentCoordinator) {
    if (profile?.verificationStatus === VerificationStatus.pending) {
      readOnlyReason = 'pending-approval';
    } else if (profile?.verificationStatus === VerificationStatus.unverified) {
      readOnlyReason = 'unverified';
    }
  }

  return {
    isStudentReadOnly,
    hasBookingPermissions,
    readOnlyReason,
    isLoading,
    profile,
  };
}
