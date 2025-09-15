import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calculator,
  FileText, 
  Users,
  ShoppingBag,
  History,
  Settings,
  DollarSign,
  Building,
  UserCheck,
  Briefcase,
  Calendar,
  Archive,
  Plus,
  BarChart3,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { FinancialModule } from "./modules/FinancialModule";
import { LegalComplianceModule } from "./modules/LegalComplianceModule";
import { EmployeeModule } from "./modules/EmployeeModule";
import { CustomerSalesModule } from "./modules/CustomerSalesModule";
import { HistoryModule } from "./modules/HistoryModule";
import { PeriodManager } from "./PeriodManager";
import { useToast } from "@/components/ui/use-toast";

export interface Period {
  id: string;
  name: string;
  type: 'daily' | 'monthly';
  startDate: string;
  endDate: string;
  status: 'active' | 'closed';
  createdAt: string;
}

const ERPDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [currentPeriod, setCurrentPeriod] = useState<Period | null>(null);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [showPeriodManager, setShowPeriodManager] = useState(false);
  const { toast } = useToast();

  // Initialize with a default period if none exists
  useEffect(() => {
    const savedPeriods = localStorage.getItem('erp_periods');
    if (savedPeriods) {
      const parsedPeriods = JSON.parse(savedPeriods);
      setPeriods(parsedPeriods);
      const active = parsedPeriods.find((p: Period) => p.status === 'active');
      if (active) {
        setCurrentPeriod(active);
      }
    } else {
      // Create initial monthly period
      const initialPeriod: Period = {
        id: Date.now().toString(),
        name: "January 2025",
        type: 'monthly',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
        status: 'active',
        createdAt: new Date().toISOString()
      };
      setPeriods([initialPeriod]);
      setCurrentPeriod(initialPeriod);
      localStorage.setItem('erp_periods', JSON.stringify([initialPeriod]));
    }
  }, []);

  const createNewPeriod = (period: Omit<Period, 'id' | 'createdAt'>) => {
    // Close current period
    if (currentPeriod) {
      const updatedPeriods = periods.map(p => 
        p.id === currentPeriod.id ? { ...p, status: 'closed' as const } : p
      );
      
      // Create new period
      const newPeriod: Period = {
        ...period,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      
      const allPeriods = [...updatedPeriods, newPeriod];
      setPeriods(allPeriods);
      setCurrentPeriod(newPeriod);
      localStorage.setItem('erp_periods', JSON.stringify(allPeriods));
      
      toast({
        title: "New Period Created",
        description: `${period.name} is now active. Previous period has been moved to history.`,
      });
    }
    setShowPeriodManager(false);
  };

  const closedPeriods = periods.filter(p => p.status === 'closed');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-primary flex items-center gap-3">
                <Building className="h-10 w-10" />
                InviX ERP
              </h1>
              <p className="text-muted-foreground mt-1">Enterprise Resource Planning System</p>
            </div>
            
            <div className="flex items-center gap-4">
              {currentPeriod && (
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Current Period</p>
                  <Badge variant="default" className="text-sm">
                    {currentPeriod.name} ({currentPeriod.type})
                  </Badge>
                </div>
              )}
              <Button onClick={() => setShowPeriodManager(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                New Period
              </Button>
              <Badge variant="outline" className="text-xs">v2.0</Badge>
            </div>
          </div>

          {/* Quick Stats Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-8 w-8 opacity-80" />
                  <div>
                    <p className="text-sm opacity-90">Revenue</p>
                    <p className="text-2xl font-bold">$128,450</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 opacity-80" />
                  <div>
                    <p className="text-sm opacity-90">Profit</p>
                    <p className="text-2xl font-bold">$45,280</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 opacity-80" />
                  <div>
                    <p className="text-sm opacity-90">Employees</p>
                    <p className="text-2xl font-bold">24</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="h-8 w-8 opacity-80" />
                  <div>
                    <p className="text-sm opacity-90">Customers</p>
                    <p className="text-2xl font-bold">156</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-8 w-8 opacity-80" />
                  <div>
                    <p className="text-sm opacity-90">Pending</p>
                    <p className="text-2xl font-bold">8</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 h-12">
            <TabsTrigger value="overview" className="flex items-center gap-2 h-10">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="financial" className="flex items-center gap-2 h-10">
              <Calculator className="h-4 w-4" />
              Financial
            </TabsTrigger>
            <TabsTrigger value="legal" className="flex items-center gap-2 h-10">
              <Briefcase className="h-4 w-4" />
              Legal
            </TabsTrigger>
            <TabsTrigger value="employee" className="flex items-center gap-2 h-10">
              <UserCheck className="h-4 w-4" />
              Employee
            </TabsTrigger>
            <TabsTrigger value="customer" className="flex items-center gap-2 h-10">
              <ShoppingBag className="h-4 w-4" />
              Customer
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2 h-10">
              <Archive className="h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Current Period Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {currentPeriod ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold">{currentPeriod.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {currentPeriod.startDate} to {currentPeriod.endDate}
                        </p>
                        <Badge variant="outline" className="mt-2">
                          {currentPeriod.type} period
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 border rounded-lg">
                          <p className="text-2xl font-bold text-green-600">45</p>
                          <p className="text-sm text-muted-foreground">Transactions</p>
                        </div>
                        <div className="text-center p-3 border rounded-lg">
                          <p className="text-2xl font-bold text-blue-600">12</p>
                          <p className="text-sm text-muted-foreground">Documents</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No active period</p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Archive className="h-5 w-5" />
                    Closed Periods
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {closedPeriods.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {closedPeriods.map((period) => (
                        <div key={period.id} className="p-3 border rounded-lg">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{period.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {period.startDate} to {period.endDate}
                              </p>
                            </div>
                            <Badge variant="secondary">Closed</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No closed periods yet</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>System Modules</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 border rounded-lg text-center hover:bg-muted/50 transition-colors cursor-pointer"
                       onClick={() => setActiveTab('financial')}>
                    <Calculator className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <h4 className="font-semibold">Financial Records</h4>
                    <p className="text-sm text-muted-foreground">Income, expenses, invoices</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center hover:bg-muted/50 transition-colors cursor-pointer"
                       onClick={() => setActiveTab('legal')}>
                    <Briefcase className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <h4 className="font-semibold">Legal & Compliance</h4>
                    <p className="text-sm text-muted-foreground">Contracts, licenses, permits</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center hover:bg-muted/50 transition-colors cursor-pointer"
                       onClick={() => setActiveTab('employee')}>
                    <UserCheck className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                    <h4 className="font-semibold">Employee Management</h4>
                    <p className="text-sm text-muted-foreground">Attendance, leave records</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center hover:bg-muted/50 transition-colors cursor-pointer"
                       onClick={() => setActiveTab('customer')}>
                    <ShoppingBag className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                    <h4 className="font-semibold">Customer & Sales</h4>
                    <p className="text-sm text-muted-foreground">Invoices, contacts, feedback</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financial">
            <FinancialModule currentPeriod={currentPeriod} />
          </TabsContent>

          <TabsContent value="legal">
            <LegalComplianceModule currentPeriod={currentPeriod} />
          </TabsContent>

          <TabsContent value="employee">
            <EmployeeModule currentPeriod={currentPeriod} />
          </TabsContent>

          <TabsContent value="customer">
            <CustomerSalesModule currentPeriod={currentPeriod} />
          </TabsContent>

          <TabsContent value="history">
            <HistoryModule periods={closedPeriods} />
          </TabsContent>
        </Tabs>

        {/* Period Manager Modal */}
        {showPeriodManager && (
          <PeriodManager
            onCreatePeriod={createNewPeriod}
            onClose={() => setShowPeriodManager(false)}
            currentPeriod={currentPeriod}
          />
        )}
      </div>
    </div>
  );
};

export default ERPDashboard;