import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
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
  AlertCircle,
  RefreshCw,
  Loader2
} from "lucide-react";

interface Client {
  id: string;
  client_id: string;
  username: string;
  company_name: string;
  email?: string;
  contact_person?: string;
  phone?: string;
  subscription_status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  access_status: 'ACTIVE' | 'STOPPED';
  subscription_start: string;
  subscription_end: string;
  created_at: string;
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

  // Show loading spinner while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          <p className="mt-2 text-white">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!isAdminAuthenticated) {
    return <AdminLogin />;
  }

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

  // Load clients on component mount
  useEffect(() => {
    fetchClients();
  }, []);

  // Add new client
  const addClient = async () => {
    if (!newClient.username || !newClient.password || !newClient.company_name) {
      toast({
        title: "Error",
        description: "Please fill in all required fields (username, password, company name)",
        variant: "destructive"
      });
      return;
    }

    try {
      const client_id = 'CLI_' + Date.now().toString().slice(-8);
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
          access_status: 'ACTIVE',
          subscription_start: new Date().toISOString().split('T')[0],
          subscription_end
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Client added successfully"
      });

      // Refresh client list and reset form
      await fetchClients();
      setNewClient({
        username: '',
        password: '',
        company_name: '',
        contact_person: '',
        email: '',
        phone: '',
        subscription_end: ''
      });
    } catch (error) {
      console.error('Error adding client:', error);
      toast({
        title: "Error",
        description: "Failed to add client. Username might already exist.",
        variant: "destructive"
      });
    }
  };

  // Toggle subscription status
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
        description: `Client subscription ${newStatus.toLowerCase()}`
      });

      await fetchClients();
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast({
        title: "Error",
        description: "Failed to update subscription status",
        variant: "destructive"
      });
    }
  };

  // Toggle access status
  const toggleAccess = async (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    const newAccess = client.access_status === 'ACTIVE' ? 'STOPPED' : 'ACTIVE';

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
        description: `Client access ${newAccess.toLowerCase()}`
      });

      await fetchClients();
    } catch (error) {
      console.error('Error updating access:', error);
      toast({
        title: "Error",
        description: "Failed to update access status",
        variant: "destructive"
      });
    }
  };

  // Update subscription end date
  const updateSubscriptionEnd = async (clientId: string, newEndDate: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .update({ 
          subscription_end: newEndDate,
          updated_at: new Date().toISOString()
        })
        .eq('id', clientId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Subscription end date updated"
      });

      await fetchClients();
    } catch (error) {
      console.error('Error updating subscription end:', error);
      toast({
        title: "Error",
        description: "Failed to update subscription end date",
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

      await fetchClients();
    } catch (error) {
      console.error('Error deleting client:', error);
      toast({
        title: "Error",
        description: "Failed to delete client",
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

  const activeClients = clients.filter(c => c.subscription_status === 'ACTIVE' && c.access_status === 'ACTIVE').length;
  const inactiveClients = clients.filter(c => c.subscription_status === 'INACTIVE' || c.access_status === 'STOPPED').length;
  const expiringSoon = clients.filter(c => {
    const endDate = new Date(c.subscription_end);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0 && c.subscription_status === 'ACTIVE';
  }).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Shield className="h-8 w-8 text-blue-400" />
                Admin Panel
              </h1>
              <p className="text-slate-400 mt-1">Inventory Management System - Administration</p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={fetchClients}
                variant="outline"
                size="sm"
                disabled={loading}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh
              </Button>
              <Button 
                onClick={adminLogout}
                variant="outline"
                size="sm"
                className="border-red-600 text-red-400 hover:bg-red-700/20"
              >
                Logout
              </Button>
              <Badge variant="outline" className="text-green-400 border-green-400">
                System Online
              </Badge>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Users className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Active Clients</p>
                    <p className="text-xl font-bold text-green-400">{activeClients}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-500/20 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Inactive Clients</p>
                    <p className="text-xl font-bold text-red-400">{inactiveClients}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                    <Calendar className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Expiring Soon</p>
                    <p className="text-xl font-bold text-yellow-400">{expiringSoon}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Activity className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Total Clients</p>
                    <p className="text-xl font-bold text-blue-400">{clients.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="clients" className="space-y-6">
          <TabsList className="bg-slate-800/50 border-slate-700">
            <TabsTrigger value="clients" className="data-[state=active]:bg-slate-700">
              <Users className="h-4 w-4 mr-2" />
              Client Management
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-slate-700">
              <Settings className="h-4 w-4 mr-2" />
              System Settings
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-slate-700">
              <Activity className="h-4 w-4 mr-2" />
              Activity Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="clients" className="space-y-6">
            {/* Add New Client */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add New Client
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-slate-300">Username *</Label>
                    <Input
                      value={newClient.username}
                      onChange={(e) => setNewClient({...newClient, username: e.target.value})}
                      placeholder="Enter username (suggest company name)"
                      className="bg-slate-700 border-slate-600 text-white mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">Password *</Label>
                    <Input
                      type="password"
                      value={newClient.password}
                      onChange={(e) => setNewClient({...newClient, password: e.target.value})}
                      placeholder="Enter password"
                      className="bg-slate-700 border-slate-600 text-white mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">Company Name *</Label>
                    <Input
                      value={newClient.company_name}
                      onChange={(e) => setNewClient({...newClient, company_name: e.target.value})}
                      placeholder="Company Name"
                      className="bg-slate-700 border-slate-600 text-white mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">Contact Person</Label>
                    <Input
                      value={newClient.contact_person}
                      onChange={(e) => setNewClient({...newClient, contact_person: e.target.value})}
                      placeholder="Contact Person"
                      className="bg-slate-700 border-slate-600 text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">Email</Label>
                    <Input
                      type="email"
                      value={newClient.email}
                      onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                      placeholder="admin@company.com"
                      className="bg-slate-700 border-slate-600 text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">Phone</Label>
                    <Input
                      value={newClient.phone}
                      onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                      placeholder="Phone Number"
                      className="bg-slate-700 border-slate-600 text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">Subscription End</Label>
                    <Input
                      type="date"
                      value={newClient.subscription_end}
                      onChange={(e) => setNewClient({...newClient, subscription_end: e.target.value})}
                      className="bg-slate-700 border-slate-600 text-white mt-1"
                    />
                    <p className="text-xs text-slate-400 mt-1">Leave empty for 1 year default</p>
                  </div>
                </div>
                <Button 
                  onClick={addClient}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Client
                </Button>
              </CardContent>
            </Card>

            {/* Search */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search clients by name, ID, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Client List */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Clients ({filteredClients.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
                    <span className="ml-2 text-slate-400">Loading clients...</span>
                  </div>
                ) : filteredClients.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">
                    {searchTerm ? 'No clients found matching your search' : 'No clients registered yet'}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {filteredClients.map((client) => (
                      <div key={client.id} className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <h3 className="font-medium text-white">{client.company_name}</h3>
                            <Badge 
                              variant={client.subscription_status === 'ACTIVE' && client.access_status === 'ACTIVE' ? 'default' : 'destructive'}
                              className={
                                client.subscription_status === 'ACTIVE' && client.access_status === 'ACTIVE'
                                  ? 'bg-green-600 text-white' 
                                  : 'bg-red-600 text-white'
                              }
                            >
                              {client.subscription_status} / {client.access_status}
                            </Badge>
                            <span className="text-xs text-slate-400 font-mono">{client.client_id}</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-400 mb-3">
                          <span>Username: {client.username}</span>
                          <span>Contact: {client.contact_person || 'N/A'}</span>
                          <span>Email: {client.email || 'N/A'}</span>
                          <span>Phone: {client.phone || 'N/A'}</span>
                          <span>Created: {new Date(client.created_at).toLocaleDateString()}</span>
                          <span>Expires: {new Date(client.subscription_end).toLocaleDateString()}</span>
                          <span>Last Login: {client.last_login ? new Date(client.last_login).toLocaleDateString() : 'Never'}</span>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          <Input
                            type="date"
                            defaultValue={client.subscription_end}
                            onChange={(e) => {
                              if (e.target.value) {
                                updateSubscriptionEnd(client.id, e.target.value);
                              }
                            }}
                            className="bg-slate-600 border-slate-500 text-white text-sm max-w-40"
                          />
                          <span className="text-xs text-slate-400">Update subscription end</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button 
                            onClick={() => toggleSubscription(client.id)}
                            variant="outline"
                            size="sm"
                            className={`border-slate-600 hover:bg-slate-700 ${
                              client.subscription_status === 'ACTIVE' 
                                ? 'text-red-400 hover:text-red-300' 
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
                              client.access_status === 'ACTIVE' 
                                ? 'text-orange-400 hover:text-orange-300' 
                                : 'text-blue-400 hover:text-blue-300'
                            }`}
                          >
                            {client.access_status === 'ACTIVE' ? 'Stop Access' : 'Grant Access'}
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

          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  System Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-white">Database Settings</h3>
                    <div className="space-y-3">
                      <div className="p-3 bg-slate-700/50 rounded border border-slate-600">
                        <Label className="text-slate-300">Firebase URL</Label>
                        <Input 
                          placeholder="https://your-project.firebaseio.com" 
                          className="bg-slate-700 border-slate-600 text-white mt-1"
                        />
                      </div>
                      <div className="p-3 bg-slate-700/50 rounded border border-slate-600">
                        <Label className="text-slate-300">API Key</Label>
                        <Input 
                          type="password" 
                          placeholder="••••••••••••••••" 
                          className="bg-slate-700 border-slate-600 text-white mt-1"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-white">Subscription Settings</h3>
                    <div className="space-y-3">
                      <div className="p-3 bg-slate-700/50 rounded border border-slate-600">
                        <Label className="text-slate-300">Default Subscription Duration (days)</Label>
                        <Input 
                          type="number" 
                          defaultValue="365" 
                          className="bg-slate-700 border-slate-600 text-white mt-1"
                        />
                      </div>
                      <div className="p-3 bg-slate-700/50 rounded border border-slate-600">
                        <Label className="text-slate-300">Grace Period (days)</Label>
                        <Input 
                          type="number" 
                          defaultValue="7" 
                          className="bg-slate-700 border-slate-600 text-white mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Save Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  System Activity Logs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-slate-700/50 rounded border border-slate-600">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white font-medium">Client Login</p>
                        <p className="text-slate-400 text-sm">CLI_001 (ABC Manufacturing) logged in successfully</p>
                      </div>
                      <span className="text-xs text-slate-400">2 hours ago</span>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-slate-700/50 rounded border border-slate-600">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white font-medium">Subscription Updated</p>
                        <p className="text-slate-400 text-sm">CLI_002 subscription status changed to INACTIVE</p>
                      </div>
                      <span className="text-xs text-slate-400">1 day ago</span>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-slate-700/50 rounded border border-slate-600">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white font-medium">New Client Added</p>
                        <p className="text-slate-400 text-sm">New client CLI_003 (Demo Corp) created</p>
                      </div>
                      <span className="text-xs text-slate-400">3 days ago</span>
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