import Dashboard from "@/components/Dashboard";
import { LoginForm } from "@/components/LoginForm";
import { SubscriptionExpired } from "@/components/SubscriptionExpired";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  // Check if subscription is expired or access is stopped
  if (user.subscription_status === 'INACTIVE' || user.access_status === 'STOPPED') {
    return <SubscriptionExpired />;
  }

  return <Dashboard />;
};

export default Index;