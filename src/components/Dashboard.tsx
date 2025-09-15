import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  Package, 
  History, 
  FileText, 
  Settings,
  Scan,
  AlertCircle,
  TrendingUp,
  DollarSign
} from "lucide-react";
import { AccountsModule } from "./AccountsModule";
import { InventoryModule } from "./InventoryModule";
import { DocumentsModule } from "./DocumentsModule";
import { HistoryModule } from "./HistoryModule";
import { GroupsModule } from "./GroupsModule";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [clientId, setClientId] = useState("");

  const handleClientLogin = () => {
    // For now, just simulate login
    if (clientId.trim()) {
      console.log("Client logged in:", clientId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Inventory Management System
              </h1>
              <p className="text-muted-foreground">Professional inventory and accounting solution</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Enter Client ID"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="px-3 py-2 border rounded-md bg-card text-sm"
                />
                <Button onClick={handleClientLogin} variant="outline">
                  Login
                </Button>
              </div>
              <Badge variant="secondary" className="text-xs">v1.0</Badge>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-card border-0 shadow-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Groups</p>
                    <p className="text-xl font-semibold">12</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-0 shadow-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Sales</p>
                    <p className="text-xl font-semibold">$45,280</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-0 shadow-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Payments</p>
                    <p className="text-xl font-semibold">$8,950</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-0 shadow-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-destructive/10 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Low Stock Items</p>
                    <p className="text-xl font-semibold">5</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-fit lg:grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="accounts" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Accounts
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Inventory
            </TabsTrigger>
            <TabsTrigger value="groups" className="flex items-center gap-2">
              <Scan className="h-4 w-4" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card className="bg-gradient-card border-0 shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  System Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Available Features</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">✓</Badge>
                        <span>Accounts Management</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">✓</Badge>
                        <span>Document Generation</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">✓</Badge>
                        <span>Inventory Tracking</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">✓</Badge>
                        <span>History Management</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Scanner Features</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Coming Soon</Badge>
                        <span>Real-time Scanning</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Coming Soon</Badge>
                        <span>QR Code Generation</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Coming Soon</Badge>
                        <span>Live Group Tracking</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Coming Soon</Badge>
                        <span>Auto Stock Updates</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accounts">
            <AccountsModule />
          </TabsContent>

          <TabsContent value="inventory">
            <InventoryModule />
          </TabsContent>

          <TabsContent value="groups">
            <GroupsModule />
          </TabsContent>

          <TabsContent value="documents">
            <DocumentsModule />
          </TabsContent>

          <TabsContent value="history">
            <HistoryModule />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;