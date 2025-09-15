import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, UserPlus, Building } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const LoginForm = () => {
  const { login, register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });
  
  const [registerData, setRegisterData] = useState({
    username: '',
    password: '',
    companyName: '',
    contactPerson: '',
    email: '',
    phone: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginData.username || !loginData.password) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields",
      });
      return;
    }

    setIsLoading(true);
    const result = await login(loginData.username, loginData.password);
    
    if (result.success) {
      toast({
        title: "Success",
        description: "Login successful!",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: result.error,
      });
    }
    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerData.companyName.trim()) {
      toast({
        variant: "destructive",
        title: "Company Name Required",
        description: "Please enter your company name as your username",
      });
      return;
    }
    
    setIsLoading(true);
    const result = await register({
      username: registerData.companyName, // Use company name as username
      password: registerData.password,
      company_name: registerData.companyName,
      contact_person: registerData.contactPerson,
      email: registerData.email,
      phone: registerData.phone,
    });
    
    if (result.success) {
      toast({
        title: "Registration successful!",
        description: `Your client ID is: ${result.client_id}. Use your company name as username to login.`,
      });
      setRegisterData({
        username: "",
        password: "",
        companyName: "",
        contactPerson: "",
        email: "",
        phone: "",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: result.error,
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Building className="h-6 w-6" />
            InviX ERP
          </CardTitle>
          <p className="text-muted-foreground">Access your account</p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                Login
              </TabsTrigger>
              <TabsTrigger value="register" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Register
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="username">Company Name (Username)</Label>
                  <Input
                    id="username"
                    value={loginData.username}
                    onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                    placeholder="Enter your company name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    placeholder="Enter your password"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <Label htmlFor="company-name">Company Name (This will be your username) *</Label>
                  <Input
                    id="company-name"
                    value={registerData.companyName}
                    onChange={(e) => setRegisterData({...registerData, companyName: e.target.value, username: e.target.value})}
                    placeholder="Your company name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="reg-password">Password *</Label>
                  <Input
                    id="reg-password"
                    type="password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                    placeholder="Choose a password"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contact-person">Contact Person</Label>
                  <Input
                    id="contact-person"
                    value={registerData.contactPerson}
                    onChange={(e) => setRegisterData({...registerData, contactPerson: e.target.value})}
                    placeholder="Contact person name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                    placeholder="Email address"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={registerData.phone}
                    onChange={(e) => setRegisterData({...registerData, phone: e.target.value})}
                    placeholder="Phone number"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  * Required fields. Your Client ID will be generated automatically.
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};