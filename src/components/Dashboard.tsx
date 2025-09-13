import { useState, useEffect } from "react";
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
import { BalanceSheet } from "./BalanceSheet";
import { UpdateNotification } from "./UpdateNotification";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    // Check if user should see update notification
    const lastVersion = localStorage.getItem('skipped_update_version');
    const currentAppVersion = "2.0.0"; // This would be dynamic in production
    
    if (!lastVersion || lastVersion !== "2.1.0") {
      // Show update notification after 3 seconds
      const timer = setTimeout(() => {
        setShowUpdateNotification(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                InviX Professional
              </h1>
              <p className="text-muted-foreground">Enterprise Inventory & Financial Management System</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-primary border-primary">
                  {user?.company_name || 'Professional Edition'}
                </Badge>
                <Button onClick={logout} variant="outline" size="sm">
                  Logout
                </Button>
              </div>
              <Badge variant="secondary" className="text-xs">v2.1.0</Badge>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-card border-0 shadow-card">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Package className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-muted-foreground">Total Projects</p>
                    <p className="text-lg md:text-xl font-semibold">12</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-0 shadow-card">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-muted-foreground">Monthly Sales</p>
                    <p className="text-lg md:text-xl font-semibold">$45,280</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-0 shadow-card">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <DollarSign className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-muted-foreground">Net Profit</p>
                    <p className="text-lg md:text-xl font-semibold">$12,340</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-0 shadow-card">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-destructive/10 rounded-lg">
                    <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-muted-foreground">Low Stock Items</p>
                    <p className="text-lg md:text-xl font-semibold">5</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-7 lg:w-fit lg:grid-cols-7 bg-card/50 backdrop-blur-sm min-w-fit">
              <TabsTrigger value="overview" className="flex items-center gap-2 px-2 md:px-4">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="accounts" className="flex items-center gap-2 px-2 md:px-4">
                <DollarSign className="h-4 w-4" />
                <span className="hidden sm:inline">Financials</span>
              </TabsTrigger>
              <TabsTrigger value="inventory" className="flex items-center gap-2 px-2 md:px-4">
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Inventory</span>
              </TabsTrigger>
              <TabsTrigger value="groups" className="flex items-center gap-2 px-2 md:px-4">
                <Scan className="h-4 w-4" />
                <span className="hidden sm:inline">Projects</span>
              </TabsTrigger>
              <TabsTrigger value="documents" className="flex items-center gap-2 px-2 md:px-4">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Documents</span>
              </TabsTrigger>
              <TabsTrigger value="balance-sheet" className="flex items-center gap-2 px-2 md:px-4">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Balance Sheet</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2 px-2 md:px-4">
                <History className="h-4 w-4" />
                <span className="hidden sm:inline">History</span>
              </TabsTrigger>
            </TabsList>
          </div>

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
                        <span>Financial Management</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">✓</Badge>
                        <span>Balance Sheet Generation</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">✓</Badge>
                        <span>Inventory Tracking</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">✓</Badge>
                        <span>Project Management</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">✓</Badge>
                        <span>Document Generation</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">✓</Badge>
                        <span>History & Reports</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Professional Features</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="default">✓</Badge>
                        <span>Automatic Balance Sheets</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="default">✓</Badge>
                        <span>Multi-currency Support</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="default">✓</Badge>
                        <span>Advanced Reporting</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="default">✓</Badge>
                        <span>Data Security & Backup</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="default">✓</Badge>
                        <span>Real-time Analytics</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="default">✓</Badge>
                        <span>Mobile Responsive</span>
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

          <TabsContent value="balance-sheet">
            <BalanceSheet />
          </TabsContent>

          <TabsContent value="history">
            <HistoryModule />
          </TabsContent>
        </Tabs>
      </div>
      
      {showUpdateNotification && (
        <UpdateNotification onDismiss={() => setShowUpdateNotification(false)} />
      )}
    </div>
  );
};

export default Dashboard;