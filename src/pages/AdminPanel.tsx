import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  AlertCircle
} from "lucide-react";

interface Client {
  id: string;
  clientId: string;
  companyName: string;
  contactEmail: string;
  subscriptionStatus: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  subscriptionEnd: string;
  createdDate: string;
  lastLogin: string;
}

const AdminPanel = () => {
  const [clients, setClients] = useState<Client[]>([
    {
      id: '1',
      clientId: 'CLI_001',
      companyName: 'ABC Manufacturing',
      contactEmail: 'admin@abc.com',
      subscriptionStatus: 'ACTIVE',
      subscriptionEnd: '2025-01-15',
      createdDate: '2024-01-15',
      lastLogin: '2024-11-08'
    },
    {
      id: '2',
      clientId: 'CLI_002', 
      companyName: 'XYZ Exports',
      contactEmail: 'manager@xyz.com',
      subscriptionStatus: 'INACTIVE',
      subscriptionEnd: '2024-10-30',
      createdDate: '2024-05-20',
      lastLogin: '2024-10-25'
    }
  ]);

  const [newClient, setNewClient] = useState({
    clientId: '',
    companyName: '',
    contactEmail: '',
    subscriptionEnd: ''
  });

  const [searchTerm, setSearchTerm] = useState('');

  const generateClientId = () => {
    const id = 'CLI_' + String(Date.now()).slice(-6);
    setNewClient({...newClient, clientId: id});
  };

  const addClient = () => {
    if (!newClient.clientId || !newClient.companyName || !newClient.contactEmail) return;
    
    const client: Client = {
      id: Date.now().toString(),
      clientId: newClient.clientId,
      companyName: newClient.companyName,
      contactEmail: newClient.contactEmail,
      subscriptionStatus: 'ACTIVE',
      subscriptionEnd: newClient.subscriptionEnd || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdDate: new Date().toISOString().split('T')[0],
      lastLogin: 'Never'
    };

    setClients([...clients, client]);
    setNewClient({ clientId: '', companyName: '', contactEmail: '', subscriptionEnd: '' });
  };

  const toggleSubscription = (clientId: string) => {
    setClients(clients.map(client => 
      client.id === clientId 
        ? { ...client, subscriptionStatus: client.subscriptionStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }
        : client
    ));
  };

  const deleteClient = (clientId: string) => {
    if (confirm('Are you sure you want to delete this client?')) {
      setClients(clients.filter(client => client.id !== clientId));
    }
  };

  const filteredClients = clients.filter(client =>
    client.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.clientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.contactEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeClients = clients.filter(c => c.subscriptionStatus === 'ACTIVE').length;
  const inactiveClients = clients.filter(c => c.subscriptionStatus === 'INACTIVE').length;
  const expiringSoon = clients.filter(c => {
    const endDate = new Date(c.subscriptionEnd);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
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
            <Badge variant="outline" className="text-green-400 border-green-400">
              System Online
            </Badge>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-slate-300">Client ID</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        value={newClient.clientId}
                        onChange={(e) => setNewClient({...newClient, clientId: e.target.value})}
                        placeholder="CLI_XXXXXX"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                      <Button 
                        onClick={generateClientId}
                        variant="outline"
                        size="sm"
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        Generate
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-slate-300">Company Name</Label>
                    <Input
                      value={newClient.companyName}
                      onChange={(e) => setNewClient({...newClient, companyName: e.target.value})}
                      placeholder="Company Name"
                      className="bg-slate-700 border-slate-600 text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">Contact Email</Label>
                    <Input
                      type="email"
                      value={newClient.contactEmail}
                      onChange={(e) => setNewClient({...newClient, contactEmail: e.target.value})}
                      placeholder="admin@company.com"
                      className="bg-slate-700 border-slate-600 text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">Subscription End</Label>
                    <Input
                      type="date"
                      value={newClient.subscriptionEnd}
                      onChange={(e) => setNewClient({...newClient, subscriptionEnd: e.target.value})}
                      className="bg-slate-700 border-slate-600 text-white mt-1"
                    />
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
                {filteredClients.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">No clients found</p>
                ) : (
                  <div className="space-y-3">
                    {filteredClients.map((client) => (
                      <div key={client.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium text-white">{client.companyName}</h3>
                            <Badge 
                              variant={client.subscriptionStatus === 'ACTIVE' ? 'default' : 'destructive'}
                              className={
                                client.subscriptionStatus === 'ACTIVE' 
                                  ? 'bg-green-600 text-white' 
                                  : 'bg-red-600 text-white'
                              }
                            >
                              {client.subscriptionStatus}
                            </Badge>
                            <span className="text-xs text-slate-400 font-mono">{client.clientId}</span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-400">
                            <span>Email: {client.contactEmail}</span>
                            <span>Created: {new Date(client.createdDate).toLocaleDateString()}</span>
                            <span>Expires: {new Date(client.subscriptionEnd).toLocaleDateString()}</span>
                            <span>Last Login: {client.lastLogin}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button 
                            onClick={() => toggleSubscription(client.id)}
                            variant="outline"
                            size="sm"
                            className={`border-slate-600 hover:bg-slate-700 ${
                              client.subscriptionStatus === 'ACTIVE' 
                                ? 'text-red-400 hover:text-red-300' 
                                : 'text-green-400 hover:text-green-300'
                            }`}
                          >
                            {client.subscriptionStatus === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-slate-400 hover:text-white hover:bg-slate-700"
                          >
                            <Edit className="h-4 w-4" />
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