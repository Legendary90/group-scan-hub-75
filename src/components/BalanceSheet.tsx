import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { FileBarChart, Download, Calendar, Building, DollarSign } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface BalanceSheetData {
  month: number;
  year: number;
  totalSales: number;
  totalPurchases: number;
  totalExpenses: number;
  totalMonthlyExpenses: number;
  netProfitLoss: number;
  assets: {
    currentAssets: number;
    fixedAssets: number;
    totalAssets: number;
  };
  liabilities: {
    currentLiabilities: number;
    longTermLiabilities: number;
    totalLiabilities: number;
  };
  equity: number;
}

export const BalanceSheet = () => {
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [balanceData, setBalanceData] = useState<BalanceSheetData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const generateBalanceSheet = async () => {
    if (!user?.client_id) return;

    setIsLoading(true);
    try {
      // Fetch sales data
      const { data: salesData } = await supabase
        .from('sales_entries')
        .select('amount')
        .eq('client_id', user.client_id)
        .gte('date', `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-01`)
        .lt('date', `${selectedYear}-${(selectedMonth + 1).toString().padStart(2, '0')}-01`);

      // Fetch purchase data
      const { data: purchaseData } = await supabase
        .from('purchase_entries')
        .select('amount')
        .eq('client_id', user.client_id)
        .eq('month_number', selectedMonth)
        .eq('year', selectedYear);

      // Fetch expense data
      const { data: expenseData } = await supabase
        .from('expense_entries')
        .select('amount')
        .eq('client_id', user.client_id)
        .gte('date', `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-01`)
        .lt('date', `${selectedYear}-${(selectedMonth + 1).toString().padStart(2, '0')}-01`);

      // Fetch monthly expense data
      const { data: monthlyExpenseData } = await supabase
        .from('monthly_expenses')
        .select('amount')
        .eq('client_id', user.client_id)
        .eq('month_number', selectedMonth)
        .eq('year', selectedYear);

      // Calculate totals
      const totalSales = salesData?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
      const totalPurchases = purchaseData?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
      const totalExpenses = expenseData?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
      const totalMonthlyExpenses = monthlyExpenseData?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
      const netProfitLoss = totalSales - (totalPurchases + totalExpenses + totalMonthlyExpenses);

      // For demo purposes, calculate estimated assets and liabilities
      const estimatedCurrentAssets = totalSales * 0.3; // Assume 30% in cash/inventory
      const estimatedFixedAssets = totalSales * 0.5; // Assume 50% in equipment/property
      const totalAssets = estimatedCurrentAssets + estimatedFixedAssets;

      const estimatedCurrentLiabilities = totalPurchases * 0.2; // Assume 20% accounts payable
      const estimatedLongTermLiabilities = totalAssets * 0.1; // Assume 10% long-term debt
      const totalLiabilities = estimatedCurrentLiabilities + estimatedLongTermLiabilities;

      const equity = totalAssets - totalLiabilities;

      const balanceSheetData: BalanceSheetData = {
        month: selectedMonth,
        year: selectedYear,
        totalSales,
        totalPurchases,
        totalExpenses,
        totalMonthlyExpenses,
        netProfitLoss,
        assets: {
          currentAssets: estimatedCurrentAssets,
          fixedAssets: estimatedFixedAssets,
          totalAssets
        },
        liabilities: {
          currentLiabilities: estimatedCurrentLiabilities,
          longTermLiabilities: estimatedLongTermLiabilities,
          totalLiabilities
        },
        equity
      };

      setBalanceData(balanceSheetData);
      
      toast({
        title: "Success",
        description: "Balance sheet generated successfully"
      });

    } catch (error) {
      console.error('Error generating balance sheet:', error);
      toast({
        title: "Error",
        description: "Failed to generate balance sheet",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const printBalanceSheet = () => {
    window.print();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-primary text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <FileBarChart className="h-6 w-6" />
                Balance Sheet Generator
              </h2>
              <p className="opacity-90">Generate professional balance sheets from your financial data</p>
            </div>
            <Building className="h-8 w-8 opacity-80" />
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Select Period
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Month</label>
              <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month, index) => (
                    <SelectItem key={index + 1} value={(index + 1).toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Year</label>
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end gap-2">
              <Button onClick={generateBalanceSheet} disabled={isLoading} className="flex-1">
                {isLoading ? 'Generating...' : 'Generate'}
              </Button>
              {balanceData && (
                <Button onClick={printBalanceSheet} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Print
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Balance Sheet Display */}
      {balanceData && (
        <div className="print:bg-white print:text-black" id="balance-sheet">
          <Card>
            <CardHeader className="text-center border-b">
              <CardTitle className="text-2xl">
                {user?.company_name || 'Company Name'}
              </CardTitle>
              <div className="text-lg font-semibold">
                Balance Sheet
              </div>
              <div className="text-sm text-muted-foreground">
                For the month of {months[balanceData.month - 1]} {balanceData.year}
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Assets */}
                <div>
                  <h3 className="text-xl font-bold mb-4 text-primary flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    ASSETS
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Current Assets</h4>
                      <div className="pl-4 space-y-1">
                        <div className="flex justify-between">
                          <span>Cash & Bank</span>
                          <span>{formatCurrency(balanceData.assets.currentAssets * 0.7)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Inventory</span>
                          <span>{formatCurrency(balanceData.assets.currentAssets * 0.3)}</span>
                        </div>
                        <div className="flex justify-between font-medium border-t pt-1">
                          <span>Total Current Assets</span>
                          <span>{formatCurrency(balanceData.assets.currentAssets)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Fixed Assets</h4>
                      <div className="pl-4 space-y-1">
                        <div className="flex justify-between">
                          <span>Equipment & Machinery</span>
                          <span>{formatCurrency(balanceData.assets.fixedAssets * 0.6)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Property & Buildings</span>
                          <span>{formatCurrency(balanceData.assets.fixedAssets * 0.4)}</span>
                        </div>
                        <div className="flex justify-between font-medium border-t pt-1">
                          <span>Total Fixed Assets</span>
                          <span>{formatCurrency(balanceData.assets.fixedAssets)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t-2 pt-2">
                      <div className="flex justify-between text-lg font-bold">
                        <span>TOTAL ASSETS</span>
                        <span>{formatCurrency(balanceData.assets.totalAssets)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Liabilities & Equity */}
                <div>
                  <h3 className="text-xl font-bold mb-4 text-destructive">
                    LIABILITIES & EQUITY
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Current Liabilities</h4>
                      <div className="pl-4 space-y-1">
                        <div className="flex justify-between">
                          <span>Accounts Payable</span>
                          <span>{formatCurrency(balanceData.liabilities.currentLiabilities * 0.8)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Short-term Loans</span>
                          <span>{formatCurrency(balanceData.liabilities.currentLiabilities * 0.2)}</span>
                        </div>
                        <div className="flex justify-between font-medium border-t pt-1">
                          <span>Total Current Liabilities</span>
                          <span>{formatCurrency(balanceData.liabilities.currentLiabilities)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Long-term Liabilities</h4>
                      <div className="pl-4 space-y-1">
                        <div className="flex justify-between">
                          <span>Bank Loans</span>
                          <span>{formatCurrency(balanceData.liabilities.longTermLiabilities)}</span>
                        </div>
                        <div className="flex justify-between font-medium border-t pt-1">
                          <span>Total Long-term Liabilities</span>
                          <span>{formatCurrency(balanceData.liabilities.longTermLiabilities)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-medium">
                        <span>Total Liabilities</span>
                        <span>{formatCurrency(balanceData.liabilities.totalLiabilities)}</span>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Owner's Equity</h4>
                      <div className="pl-4 space-y-1">
                        <div className="flex justify-between">
                          <span>Owner's Capital</span>
                          <span>{formatCurrency(balanceData.equity - balanceData.netProfitLoss)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Retained Earnings</span>
                          <span>{formatCurrency(balanceData.netProfitLoss)}</span>
                        </div>
                        <div className="flex justify-between font-medium border-t pt-1">
                          <span>Total Equity</span>
                          <span>{formatCurrency(balanceData.equity)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t-2 pt-2">
                      <div className="flex justify-between text-lg font-bold">
                        <span>TOTAL LIABILITIES & EQUITY</span>
                        <span>{formatCurrency(balanceData.liabilities.totalLiabilities + balanceData.equity)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="mt-8 pt-6 border-t">
                <h3 className="text-lg font-bold mb-4">Financial Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-sm text-muted-foreground">Total Sales</div>
                    <div className="text-lg font-semibold text-green-600">{formatCurrency(balanceData.totalSales)}</div>
                  </div>
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="text-sm text-muted-foreground">Total Expenses</div>
                    <div className="text-lg font-semibold text-red-600">
                      {formatCurrency(balanceData.totalPurchases + balanceData.totalExpenses + balanceData.totalMonthlyExpenses)}
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${balanceData.netProfitLoss >= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                    <div className="text-sm text-muted-foreground">Net Profit/Loss</div>
                    <div className={`text-lg font-semibold ${balanceData.netProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(balanceData.netProfitLoss)}
                    </div>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-sm text-muted-foreground">Total Assets</div>
                    <div className="text-lg font-semibold text-blue-600">{formatCurrency(balanceData.assets.totalAssets)}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};