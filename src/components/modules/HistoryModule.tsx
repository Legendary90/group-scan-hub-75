import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Archive, 
  Calendar, 
  Download, 
  FileText, 
  Trash2,
  Eye,
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign
} from "lucide-react";
import type { Period } from "../ERPDashboard";

interface HistoryModuleProps {
  periods: Period[];
}

export const HistoryModule = ({ periods }: HistoryModuleProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [viewMode, setViewMode] = useState<'overview' | 'financial' | 'legal' | 'employee' | 'customer'>('overview');

  const getHistoricalData = (periodId: string) => {
    const financial = localStorage.getItem(`financial_records_${periodId}`);
    const legal = localStorage.getItem(`legal_documents_${periodId}`);
    const employees = localStorage.getItem(`employees_${periodId}`);
    const customers = localStorage.getItem(`customers_${periodId}`);
    const invoices = localStorage.getItem(`invoices_${periodId}`);
    const attendance = localStorage.getItem(`attendance_${periodId}`);
    const leaves = localStorage.getItem(`leaves_${periodId}`);
    const feedback = localStorage.getItem(`feedback_${periodId}`);

    return {
      financial: financial ? JSON.parse(financial) : [],
      legal: legal ? JSON.parse(legal) : [],
      employees: employees ? JSON.parse(employees) : [],
      customers: customers ? JSON.parse(customers) : [],
      invoices: invoices ? JSON.parse(invoices) : [],
      attendance: attendance ? JSON.parse(attendance) : [],
      leaves: leaves ? JSON.parse(leaves) : [],
      feedback: feedback ? JSON.parse(feedback) : []
    };
  };

  const calculatePeriodStats = (periodId: string) => {
    const data = getHistoricalData(periodId);
    
    const totalIncome = data.financial.filter((r: any) => r.type === 'income').reduce((sum: number, r: any) => sum + r.amount, 0);
    const totalExpenses = data.financial.filter((r: any) => ['expense', 'bill', 'payroll', 'tax'].includes(r.type)).reduce((sum: number, r: any) => sum + r.amount, 0);
    const netProfit = totalIncome - totalExpenses;
    
    const totalRevenue = data.invoices.filter((i: any) => i.status === 'paid').reduce((sum: number, i: any) => sum + i.total, 0);
    const pendingRevenue = data.invoices.filter((i: any) => ['sent', 'overdue'].includes(i.status)).reduce((sum: number, i: any) => sum + i.total, 0);
    
    return {
      totalIncome,
      totalExpenses,
      netProfit,
      totalRevenue,
      pendingRevenue,
      financialRecords: data.financial.length,
      legalDocuments: data.legal.length,
      employees: data.employees.length,
      customers: data.customers.length,
      invoices: data.invoices.length,
      attendanceRecords: data.attendance.length,
      leaveRequests: data.leaves.length,
      feedbackRecords: data.feedback.length
    };
  };

  const exportPeriodData = (periodId: string) => {
    const period = periods.find(p => p.id === periodId);
    const data = getHistoricalData(periodId);
    const stats = calculatePeriodStats(periodId);
    
    const exportData = {
      period,
      stats,
      data
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invix_period_${period?.name.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const deletePeriodData = (periodId: string) => {
    if (confirm('Are you sure you want to permanently delete this period data? This action cannot be undone.')) {
      localStorage.removeItem(`financial_records_${periodId}`);
      localStorage.removeItem(`legal_documents_${periodId}`);
      localStorage.removeItem(`employees_${periodId}`);
      localStorage.removeItem(`customers_${periodId}`);
      localStorage.removeItem(`invoices_${periodId}`);
      localStorage.removeItem(`attendance_${periodId}`);
      localStorage.removeItem(`leaves_${periodId}`);
      localStorage.removeItem(`feedback_${periodId}`);
      
      // Remove from periods list
      const savedPeriods = localStorage.getItem('erp_periods');
      if (savedPeriods) {
        const periodsList = JSON.parse(savedPeriods);
        const updatedPeriods = periodsList.filter((p: Period) => p.id !== periodId);
        localStorage.setItem('erp_periods', JSON.stringify(updatedPeriods));
      }
      
      window.location.reload(); // Refresh to update the UI
    }
  };

  const selectedPeriodData = selectedPeriod ? getHistoricalData(selectedPeriod) : null;
  const selectedPeriodStats = selectedPeriod ? calculatePeriodStats(selectedPeriod) : null;
  const selectedPeriodInfo = periods.find(p => p.id === selectedPeriod);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Historical Data & Archives
          </CardTitle>
        </CardHeader>
        <CardContent>
          {periods.length === 0 ? (
            <div className="text-center py-8">
              <Archive className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No closed periods available</p>
              <p className="text-sm text-muted-foreground mt-2">
                Historical data will appear here when you close periods and create new ones.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Period Selection */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a period to view historical data" />
                    </SelectTrigger>
                    <SelectContent>
                      {periods.map(period => (
                        <SelectItem key={period.id} value={period.id}>
                          {period.name} ({period.startDate} to {period.endDate})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedPeriod && (
                  <div className="flex gap-2">
                    <Button onClick={() => exportPeriodData(selectedPeriod)} variant="outline" className="gap-2">
                      <Download className="h-4 w-4" />
                      Export
                    </Button>
                    <Button onClick={() => deletePeriodData(selectedPeriod)} variant="destructive" className="gap-2">
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                )}
              </div>

              {/* Period Overview */}
              {selectedPeriod && selectedPeriodInfo && selectedPeriodStats && (
                <div className="space-y-6">
                  <Card className="bg-muted/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        {selectedPeriodInfo.name} Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="text-center p-4 border rounded-lg">
                          <p className="text-sm text-muted-foreground">Period Type</p>
                          <p className="text-xl font-bold capitalize">{selectedPeriodInfo.type}</p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <p className="text-sm text-muted-foreground">Duration</p>
                          <p className="text-xl font-bold">
                            {Math.ceil((new Date(selectedPeriodInfo.endDate).getTime() - new Date(selectedPeriodInfo.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                          </p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <p className="text-sm text-muted-foreground">Status</p>
                          <Badge variant="secondary" className="text-lg">Closed</Badge>
                        </div>
                      </div>

                      {/* Financial Summary */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card className={`bg-gradient-to-r ${selectedPeriodStats.netProfit >= 0 ? 'from-green-500 to-green-600' : 'from-red-500 to-red-600'} text-white border-0`}>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              {selectedPeriodStats.netProfit >= 0 ? 
                                <TrendingUp className="h-6 w-6 opacity-80" /> : 
                                <TrendingDown className="h-6 w-6 opacity-80" />
                              }
                              <div>
                                <p className="text-sm opacity-90">Net {selectedPeriodStats.netProfit >= 0 ? 'Profit' : 'Loss'}</p>
                                <p className="text-xl font-bold">${Math.abs(selectedPeriodStats.netProfit).toFixed(2)}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <DollarSign className="h-6 w-6 opacity-80" />
                              <div>
                                <p className="text-sm opacity-90">Total Income</p>
                                <p className="text-xl font-bold">${selectedPeriodStats.totalIncome.toFixed(2)}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <BarChart3 className="h-6 w-6 opacity-80" />
                              <div>
                                <p className="text-sm opacity-90">Total Expenses</p>
                                <p className="text-xl font-bold">${selectedPeriodStats.totalExpenses.toFixed(2)}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <FileText className="h-6 w-6 opacity-80" />
                              <div>
                                <p className="text-sm opacity-90">Revenue</p>
                                <p className="text-xl font-bold">${selectedPeriodStats.totalRevenue.toFixed(2)}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Data Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Data Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 border rounded-lg">
                          <p className="text-2xl font-bold text-blue-600">{selectedPeriodStats.financialRecords}</p>
                          <p className="text-sm text-muted-foreground">Financial Records</p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <p className="text-2xl font-bold text-green-600">{selectedPeriodStats.legalDocuments}</p>
                          <p className="text-sm text-muted-foreground">Legal Documents</p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <p className="text-2xl font-bold text-purple-600">{selectedPeriodStats.employees}</p>
                          <p className="text-sm text-muted-foreground">Employees</p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <p className="text-2xl font-bold text-orange-600">{selectedPeriodStats.customers}</p>
                          <p className="text-sm text-muted-foreground">Customers</p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <p className="text-2xl font-bold text-red-600">{selectedPeriodStats.invoices}</p>
                          <p className="text-sm text-muted-foreground">Invoices</p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <p className="text-2xl font-bold text-teal-600">{selectedPeriodStats.attendanceRecords}</p>
                          <p className="text-sm text-muted-foreground">Attendance Records</p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <p className="text-2xl font-bold text-yellow-600">{selectedPeriodStats.leaveRequests}</p>
                          <p className="text-sm text-muted-foreground">Leave Requests</p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <p className="text-2xl font-bold text-pink-600">{selectedPeriodStats.feedbackRecords}</p>
                          <p className="text-sm text-muted-foreground">Feedback Records</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Detailed View Options */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Detailed Data View</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2 mb-4">
                        <Button 
                          variant={viewMode === 'overview' ? 'default' : 'outline'} 
                          onClick={() => setViewMode('overview')}
                        >
                          Overview
                        </Button>
                        <Button 
                          variant={viewMode === 'financial' ? 'default' : 'outline'} 
                          onClick={() => setViewMode('financial')}
                        >
                          Financial
                        </Button>
                        <Button 
                          variant={viewMode === 'legal' ? 'default' : 'outline'} 
                          onClick={() => setViewMode('legal')}
                        >
                          Legal
                        </Button>
                        <Button 
                          variant={viewMode === 'employee' ? 'default' : 'outline'} 
                          onClick={() => setViewMode('employee')}
                        >
                          Employee
                        </Button>
                        <Button 
                          variant={viewMode === 'customer' ? 'default' : 'outline'} 
                          onClick={() => setViewMode('customer')}
                        >
                          Customer
                        </Button>
                      </div>

                      {viewMode === 'overview' && (
                        <div className="space-y-4">
                          <p className="text-muted-foreground">
                            Select a category above to view detailed historical data for this period.
                          </p>
                        </div>
                      )}

                      {viewMode === 'financial' && selectedPeriodData && (
                        <div className="space-y-3">
                          <h4 className="font-semibold">Financial Records ({selectedPeriodData.financial.length})</h4>
                          {selectedPeriodData.financial.length === 0 ? (
                            <p className="text-muted-foreground">No financial records in this period</p>
                          ) : (
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                              {selectedPeriodData.financial.map((record: any) => (
                                <div key={record.id} className="p-3 border rounded-lg text-sm">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="font-medium">{record.description}</p>
                                      <p className="text-muted-foreground">{record.date} • {record.category}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-semibold">${record.amount.toFixed(2)}</p>
                                      <Badge variant="outline" className="text-xs">{record.type}</Badge>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {viewMode === 'legal' && selectedPeriodData && (
                        <div className="space-y-3">
                          <h4 className="font-semibold">Legal Documents ({selectedPeriodData.legal.length})</h4>
                          {selectedPeriodData.legal.length === 0 ? (
                            <p className="text-muted-foreground">No legal documents in this period</p>
                          ) : (
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                              {selectedPeriodData.legal.map((doc: any) => (
                                <div key={doc.id} className="p-3 border rounded-lg text-sm">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="font-medium">{doc.title}</p>
                                      <p className="text-muted-foreground">{doc.issueDate} • {doc.authority}</p>
                                    </div>
                                    <div className="text-right">
                                      <Badge variant="outline" className="text-xs">{doc.type}</Badge>
                                      <Badge variant={doc.status === 'active' ? 'default' : 'secondary'} className="text-xs ml-1">
                                        {doc.status}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {viewMode === 'employee' && selectedPeriodData && (
                        <div className="space-y-3">
                          <h4 className="font-semibold">Employee Data</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h5 className="font-medium mb-2">Employees ({selectedPeriodData.employees.length})</h5>
                              {selectedPeriodData.employees.length === 0 ? (
                                <p className="text-muted-foreground text-sm">No employees in this period</p>
                              ) : (
                                <div className="space-y-1 max-h-32 overflow-y-auto">
                                  {selectedPeriodData.employees.map((emp: any) => (
                                    <div key={emp.id} className="text-sm p-2 border rounded">
                                      {emp.name} - {emp.position}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div>
                              <h5 className="font-medium mb-2">Attendance ({selectedPeriodData.attendance.length})</h5>
                              <p className="text-sm text-muted-foreground">
                                {selectedPeriodData.attendance.filter((a: any) => a.status === 'present').length} present, {' '}
                                {selectedPeriodData.attendance.filter((a: any) => a.status === 'absent').length} absent
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {viewMode === 'customer' && selectedPeriodData && (
                        <div className="space-y-3">
                          <h4 className="font-semibold">Customer & Sales Data</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h5 className="font-medium mb-2">Customers ({selectedPeriodData.customers.length})</h5>
                              {selectedPeriodData.customers.length === 0 ? (
                                <p className="text-muted-foreground text-sm">No customers in this period</p>
                              ) : (
                                <div className="space-y-1 max-h-32 overflow-y-auto">
                                  {selectedPeriodData.customers.map((customer: any) => (
                                    <div key={customer.id} className="text-sm p-2 border rounded">
                                      {customer.name} - {customer.email}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div>
                              <h5 className="font-medium mb-2">Invoices ({selectedPeriodData.invoices.length})</h5>
                              <p className="text-sm text-muted-foreground">
                                Total Value: ${selectedPeriodData.invoices.reduce((sum: number, inv: any) => sum + inv.total, 0).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};