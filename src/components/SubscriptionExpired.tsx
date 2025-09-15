import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export const SubscriptionExpired = () => {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-destructive">
            Subscription Expired
          </CardTitle>
          <CardDescription>
            Your monthly subscription has expired. Please contact your administrator to renew your subscription.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">
              Your access to the system has been suspended due to an expired subscription. 
              Please reach out to your service provider to reactivate your account.
            </p>
          </div>
          <Button 
            onClick={logout} 
            variant="outline" 
            className="w-full"
          >
            Return to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};