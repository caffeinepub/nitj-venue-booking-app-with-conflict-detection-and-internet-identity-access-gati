import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useRegistrationStatus } from './hooks/useRegistrationStatus';
import LoginView from './components/auth/LoginView';
import RegistrationGate from './components/auth/RegistrationGate';
import AuthenticatedApp from './pages/AuthenticatedApp';

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: isRegistered, isLoading: isCheckingRegistration } = useRegistrationStatus();

  // Show loading state during initialization
  if (isInitializing || isCheckingRegistration) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - show login
  if (!identity) {
    return <LoginView />;
  }

  // Authenticated but not registered - show registration gate
  if (!isRegistered) {
    return <RegistrationGate />;
  }

  // Authenticated and registered - show authenticated app with dashboards
  return <AuthenticatedApp />;
}
