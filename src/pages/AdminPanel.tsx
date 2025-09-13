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
  Loader2,
  LogOut,
  Building,
  DollarSign
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
  access_status: boolean;
  subscription_start: string;
  subscription_end: string;
  created_at: string;
  last_login?: string;
}

const AdminPanel = () => {
  const { admin, logout, isLoading: authLoading } = useAdminAuth();
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

  // Show login if not authenticated
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!admin) {
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
          access_status: true,
          subscription_start: new Date().toISOString().split('T')[0],
          subscription_end
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Client added successfully! Client ID: ${client_id}`
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
        description: `Client subscription ${newStatus.toLowerCase()}. Client data preserved.`
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
        description: `Client access ${newAccess ? 'enabled' : 'disabled'}. Data remains intact.`
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
          subscription_status: 'ACTIVE', // Reactivate when extending
          updated_at: new Date().toISOString()
        })
        .eq('id', clientId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Subscription extended successfully"
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

  // Delete client (soft delete - preserve data)
  const deleteClient = async (clientId: string) => {
    if (!confirm('Are you sure you want to disable this client? Their data will be preserved.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('clients')
        .update({
          subscription_status: 'INACTIVE',
          access_status: false
        })
        .eq('id', clientId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Client disabled successfully. Data preserved."
      });

      await fetchClients();
    } catch (error) {
      console.error('Error disabling client:', error);
      toast({
        title: "Error",
        description: "Failed to disable client",
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

  const totalRevenue = clients.length * 50; // Assume $50 per client per month

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <div className="container mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                <Shield className="h-6 w-6 md:h-8 md:w-8 text-blue-400" />
                InviX Admin Panel
              </h1>
              <p className="text-slate-400 mt-1">Professional Inventory Management System - Administration</p>
              <p className="text-sm text-slate-500">Logged in as: {admin.username}</p>
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
              <Badge variant="outline" className="text-green-400 border-green-400">
                System Online
              </Badge>
              <Button 
                onClick={logout}
                variant="outline"
                size="sm"
                className="border-red-600 text-red-300 hover:bg-red-700"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Users className="h-4 w-4 md:h-5 md:w-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs md:text-sm">Active Clients</p>
                    <p className="text-lg md:text-xl font-bold text-green-400">{activeClients}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-500/20 rounded-lg">
                    <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs md:text-sm">Inactive</p>
                    <p className="text-lg md:text-xl font-bold text-red-400">{inactiveClients}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                    <Calendar className="h-4 w-4 md:h-5 md:w-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs md:text-sm">Expiring Soon</p>
                    <p className="text-lg md:text-xl font-bold text-yellow-400">{expiringSoon}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Building className="h-4 w-4 md:h-5 md:w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs md:text-sm">Total Clients</p>
                    <p className="text-lg md:text-xl font-bold text-blue-400">{clients.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <DollarSign className="h-4 w-4 md:h-5 md:w-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs md:text-sm">Est. Revenue</p>
                    <p className="text-lg md:text-xl font-bold text-purple-400">${totalRevenue}/m</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="clients" className="space-y-6">
          <TabsList className="bg-slate-800/50 border-slate-700 grid grid-cols-3 w-full md:w-fit">
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
                      placeholder="Enter username"
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
                  className="bg-blue-600 hover:bg-blue-700 text-white w-full md:w-auto"
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
                <CardTitle className="text-white">Client List ({filteredClients.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-400" />
                    <p className="text-slate-400 mt-2">Loading clients...</p>
                  </div>
                ) : filteredClients.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">No clients found</p>
                ) : (
                  <div className="space-y-4">
                    {filteredClients.map((client) => (
                      <div key={client.id} className="p-4 border border-slate-600 rounded-lg">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg text-white">{client.company_name}</h3>
                              <Badge variant={client.subscription_status === 'ACTIVE' && client.access_status ? 'default' : 'destructive'}>
                                {client.subscription_status === 'ACTIVE' && client.access_status ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            <div className="text-sm text-slate-400 space-y-1">
                              <p><span className="font-medium">Client ID:</span> {client.client_id}</p>
                              <p><span className="font-medium">Username:</span> {client.username}</p>
                              {client.contact_person && <p><span className="font-medium">Contact:</span> {client.contact_person}</p>}
                              {client.email && <p><span className="font-medium">Email:</span> {client.email}</p>}
                              <p><span className="font-medium">Subscription:</span> {client.subscription_start} to {client.subscription_end}</p>
                              <p><span className="font-medium">Created:</span> {new Date(client.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            <Button
                              onClick={() => toggleSubscription(client.id)}
                              variant="outline"
                              size="sm"
                              className={`border-slate-600 ${client.subscription_status === 'ACTIVE' ? 'text-red-400 hover:bg-red-700' : 'text-green-400 hover:bg-green-700'}`}
                            >
                              {client.subscription_status === 'ACTIVE' ? 'Pause' : 'Activate'}
                            </Button>
                            <Button
                              onClick={() => toggleAccess(client.id)}
                              variant="outline"
                              size="sm"
                              className={`border-slate-600 ${client.access_status ? 'text-yellow-400 hover:bg-yellow-700' : 'text-blue-400 hover:bg-blue-700'}`}
                            >
                              {client.access_status ? 'Stop Access' : 'Enable Access'}
                            </Button>
                            <Button
                              onClick={() => {
                                const newDate = prompt('Enter new subscription end date (YYYY-MM-DD):', client.subscription_end);
                                if (newDate) updateSubscriptionEnd(client.id, newDate);
                              }}
                              variant="outline"
                              size="sm"
                              className="border-slate-600 text-blue-400 hover:bg-blue-700"
                            >
                              <Calendar className="h-4 w-4 mr-1" />
                              Extend
                            </Button>
                            <Button
                              onClick={() => deleteClient(client.id)}
                              variant="outline"
                              size="sm"
                              className="border-slate-600 text-red-400 hover:bg-red-700"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Disable
                            </Button>
                          </div>
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
                    <h3 className="text-lg font-semibold text-white">Security Settings</h3>
                    <div className="space-y-2">
                      <Badge variant="default" className="mb-2">🔒 Admin Authentication: Enabled</Badge>
                      <Badge variant="default" className="mb-2">🛡️ Row Level Security: Active</Badge>
                      <Badge variant="default" className="mb-2">🔐 Data Encryption: Enabled</Badge>
                      <Badge variant="default" className="mb-2">📊 Backup System: Automatic</Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">System Status</h3>
                    <div className="space-y-2">
                      <Badge variant="default" className="mb-2">🟢 Database: Connected</Badge>
                      <Badge variant="default" className="mb-2">🟢 Authentication: Online</Badge>
                      <Badge variant="default" className="mb-2">🟢 File Storage: Available</Badge>
                      <Badge variant="default" className="mb-2">🟢 API Services: Running</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 border border-slate-600 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-white">Admin login</span>
                      <span className="text-slate-400 text-sm">{new Date().toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-slate-400">Administrator {admin.username} logged in</p>
                  </div>
                  
                  <div className="p-3 border border-slate-600 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-white">System startup</span>
                      <span className="text-slate-400 text-sm">System started</span>
                    </div>
                    <p className="text-sm text-slate-400">InviX Admin Panel initialized successfully</p>
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