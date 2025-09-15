import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { AdminLogin } from "@/components/AdminLogin";
import { 
  Users, 
  Settings, 
  Activity, 
  Shield, 
  Plus,
  Edit,
  Trash2,
  Search,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff
} from "lucide-react";

interface Client {
  id: string;
  client_id: string;
  username: string;
  company_name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  subscription_status: string;
  subscription_start: string;
  subscription_end: string;
  access_status: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

const AdminPanel = () => {
  const { isAdminAuthenticated, isLoading: authLoading, adminLogout } = useAdminAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [newClient, setNewClient] = useState({
    username: '',
    password: '',
    company_name: '',
    contact_person: '',
    email: '',
    phone: '',
    subscription_end: ''
  });
  
  const { toast } = useToast();

  useEffect(() => {
    if (isAdminAuthenticated && !authLoading) {
      fetchClients();
    }
  }, [isAdminAuthenticated, authLoading]);

  // Fetch all clients from database
  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: "Error",
        description: "Failed to fetch clients from database",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Add new client
  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newClient.username || !newClient.company_name || !newClient.password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      // Generate client ID
      const client_id = 'CLI_' + Date.now().toString() + Math.random().toString(36).substr(2, 9);
      
      // Set subscription end date (default 1 year from now)
      const subscription_end = newClient.subscription_end || 
        new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const { error } = await supabase
        .from('clients')
        .insert([{
          client_id,
          username: newClient.username,
          password_hash: newClient.password, // In production, this should be hashed
          company_name: newClient.company_name,
          contact_person: newClient.contact_person,
          email: newClient.email,
          phone: newClient.phone,
          subscription_status: 'ACTIVE',
          access_status: true,
          subscription_start: new Date().toISOString().split('T')[0],
          subscription_end
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Client added successfully"
      });

      // Reset form and refresh clients
      setNewClient({
        username: '',
        password: '',
        company_name: '',
        contact_person: '',
        email: '',
        phone: '',
        subscription_end: ''
      });
      fetchClients();

    } catch (error: any) {
      console.error('Error adding client:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add client",
        variant: "destructive"
      });
    }
  };

  // Delete client
  const deleteClient = async (clientId: string) => {
    if (!confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Client deleted successfully"
      });

      fetchClients();
    } catch (error: any) {
      console.error('Error deleting client:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete client",
        variant: "destructive"
      });
    }
  };

  // Update subscription status
  const toggleSubscription = async (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    const newStatus = client.subscription_status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    try {
      const { error } = await supabase
        .from('clients')
        .update({ 
          subscription_status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', clientId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Subscription ${newStatus.toLowerCase()}`
      });

      fetchClients();
    } catch (error: any) {
      console.error('Error updating subscription:', error);
      toast({
        title: "Error", 
        description: error.message || "Failed to update subscription",
        variant: "destructive"
      });
    }
  };

  // Toggle access status
  const toggleAccess = async (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    const newAccess = !client.access_status;

    try {
      const { error } = await supabase
        .from('clients')
        .update({ 
          access_status: newAccess,
          updated_at: new Date().toISOString()
        })
        .eq('id', clientId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Client access ${newAccess ? 'enabled' : 'disabled'}`
      });

      fetchClients();
    } catch (error: any) {
      console.error('Error updating access:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update access",
        variant: "destructive"
      });
    }
  };

  // Extend subscription
  const extendSubscription = async (clientId: string, months: number) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    try {
      const currentEndDate = new Date(client.subscription_end);
      const newEndDate = new Date(currentEndDate);
      newEndDate.setMonth(currentEndDate.getMonth() + months);

      const { error } = await supabase
        .from('clients')
        .update({ 
          subscription_end: newEndDate.toISOString().split('T')[0],
          subscription_status: 'ACTIVE',
          updated_at: new Date().toISOString()
        })
        .eq('id', clientId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Subscription extended by ${months} month(s)`
      });

      fetchClients();
    } catch (error: any) {
      console.error('Error extending subscription:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to extend subscription",
        variant: "destructive"
      });
    }
  };

  const filteredClients = clients.filter(client =>
    client.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.client_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const activeClients = clients.filter(c => c.subscription_status === 'ACTIVE' && c.access_status).length;
  const inactiveClients = clients.filter(c => c.subscription_status === 'INACTIVE' || !c.access_status).length;
  const expiringSoon = clients.filter(c => {
    const endDate = new Date(c.subscription_end);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0 && c.subscription_status === 'ACTIVE';
  }).length;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    return <AdminLogin />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Shield className="h-8 w-8 text-blue-400" />
            <div>
              <h1 className="text-3xl font-bold text-white">InviX ERP Admin</h1>
              <p className="text-slate-400">System Administration Panel</p>
            </div>
          </div>
          <Button 
            onClick={adminLogout}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            Logout
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Clients</p>
                  <h3 className="text-2xl font-bold text-white">{clients.length}</h3>
                </div>
                <Users className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Active Clients</p>
                  <h3 className="text-2xl font-bold text-green-400">{activeClients}</h3>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Inactive Clients</p>
                  <h3 className="text-2xl font-bold text-red-400">{inactiveClients}</h3>
                </div>
                <XCircle className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Expiring Soon</p>
                  <h3 className="text-2xl font-bold text-yellow-400">{expiringSoon}</h3>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="clients" className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-slate-700">
            <TabsTrigger 
              value="clients" 
              className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400"
            >
              <Users className="h-4 w-4 mr-2" />
              Clients
            </TabsTrigger>
            <TabsTrigger 
              value="add-client" 
              className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="clients">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Client Management
                  </CardTitle>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                      <Input
                        placeholder="Search clients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
                    <p className="text-slate-400 mt-2">Loading clients...</p>
                  </div>
                ) : filteredClients.length === 0 ? (
                  <p className="text-center text-slate-400 py-8">
                    No clients found {searchTerm && `matching "${searchTerm}"`}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {filteredClients.map((client) => (
                      <div key={client.id} className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <h3 className="font-medium text-white">{client.company_name}</h3>
                            <Badge 
                              variant={client.subscription_status === 'ACTIVE' && client.access_status ? 'default' : 'destructive'}
                              className={
                                client.subscription_status === 'ACTIVE' && client.access_status
                                  ? 'bg-green-600 text-white' 
                                  : 'bg-red-600 text-white'
                              }
                            >
                              {client.subscription_status} / {client.access_status ? 'ENABLED' : 'DISABLED'}
                            </Badge>
                            <span className="text-xs text-slate-400 font-mono">{client.client_id}</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-400 mb-3">
                          <span>Username: {client.username}</span>
                          <span>Contact: {client.contact_person || 'N/A'}</span>
                          <span>Email: {client.email || 'N/A'}</span>
                          <span>Phone: {client.phone || 'N/A'}</span>
                          <span>Start: {client.subscription_start}</span>
                          <span>End: {client.subscription_end}</span>
                          <span>Created: {new Date(client.created_at).toLocaleDateString()}</span>
                          <span>Last Login: {client.last_login ? new Date(client.last_login).toLocaleDateString() : 'Never'}</span>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                          <Button 
                            onClick={() => extendSubscription(client.id, 1)}
                            variant="outline"
                            size="sm"
                            className="border-slate-600 text-blue-400 hover:bg-slate-700 hover:text-blue-300"
                          >
                            <Calendar className="h-4 w-4 mr-1" />
                            Extend 1M
                          </Button>
                          <Button 
                            onClick={() => extendSubscription(client.id, 12)}
                            variant="outline"
                            size="sm"
                            className="border-slate-600 text-blue-400 hover:bg-slate-700 hover:text-blue-300"
                          >
                            <Calendar className="h-4 w-4 mr-1" />
                            Extend 1Y
                          </Button>
                          <Button 
                            onClick={() => toggleSubscription(client.id)}
                            variant="outline"
                            size="sm"
                            className={`border-slate-600 hover:bg-slate-700 ${
                              client.subscription_status === 'ACTIVE' 
                                ? 'text-yellow-400 hover:text-yellow-300' 
                                : 'text-green-400 hover:text-green-300'
                            }`}
                          >
                            {client.subscription_status === 'ACTIVE' ? 'Suspend Subscription' : 'Activate Subscription'}
                          </Button>
                          <Button 
                            onClick={() => toggleAccess(client.id)}
                            variant="outline"
                            size="sm"
                            className={`border-slate-600 hover:bg-slate-700 ${
                              client.access_status
                                ? 'text-orange-400 hover:text-orange-300' 
                                : 'text-blue-400 hover:text-blue-300'
                            }`}
                          >
                            {client.access_status ? (
                              <>
                                <EyeOff className="h-4 w-4 mr-1" />
                                Stop Access
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4 mr-1" />
                                Grant Access
                              </>
                            )}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => deleteClient(client.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-slate-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="add-client">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add New Client
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddClient} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="username" className="text-slate-300">Username *</Label>
                      <Input
                        id="username"
                        value={newClient.username}
                        onChange={(e) => setNewClient({...newClient, username: e.target.value})}
                        className="bg-slate-700 border-slate-600 text-white"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="password" className="text-slate-300">Password *</Label>
                      <Input
                        id="password"
                        type="password"
                        value={newClient.password}
                        onChange={(e) => setNewClient({...newClient, password: e.target.value})}
                        className="bg-slate-700 border-slate-600 text-white"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="company_name" className="text-slate-300">Company Name *</Label>
                      <Input
                        id="company_name"
                        value={newClient.company_name}
                        onChange={(e) => setNewClient({...newClient, company_name: e.target.value})}
                        className="bg-slate-700 border-slate-600 text-white"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact_person" className="text-slate-300">Contact Person</Label>
                      <Input
                        id="contact_person"
                        value={newClient.contact_person}
                        onChange={(e) => setNewClient({...newClient, contact_person: e.target.value})}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-slate-300">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newClient.email}
                        onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-slate-300">Phone</Label>
                      <Input
                        id="phone"
                        value={newClient.phone}
                        onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="subscription_end" className="text-slate-300">Subscription End Date (Optional)</Label>
                      <Input
                        id="subscription_end"
                        type="date"
                        value={newClient.subscription_end}
                        onChange={(e) => setNewClient({...newClient, subscription_end: e.target.value})}
                        className="bg-slate-700 border-slate-600 text-white"
                        placeholder="Leave empty for 1 year default"
                      />
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Client
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  System Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 bg-slate-700/50 rounded-lg">
                    <h3 className="text-white font-medium mb-2">Database Status</h3>
                    <p className="text-slate-400">Connected to InviX ERP Database</p>
                    <Badge variant="default" className="mt-2 bg-green-600">Online</Badge>
                  </div>
                  
                  <div className="p-4 bg-slate-700/50 rounded-lg">
                    <h3 className="text-white font-medium mb-2">System Information</h3>
                    <div className="space-y-1 text-slate-400 text-sm">
                      <p>Total Clients: {clients.length}</p>
                      <p>Active Subscriptions: {activeClients}</p>
                      <p>System Version: 1.0.0</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;