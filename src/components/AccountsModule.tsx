import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  Edit, 
  Trash2, 
  DollarSign, 
  ShoppingCart, 
  Receipt, 
  Building, 
  CreditCard, 
  FileBarChart,
  Calendar,
  TrendingUp,
  TrendingDown
} from "lucide-react";

interface AccountEntry {
  id: string;
  description: string;
  amount: number;
  date: string;
  category?: string;
  status?: string;
}

export const AccountsModule = () => {
  const [salesEntries, setSalesEntries] = useState<AccountEntry[]>([]);
  const [purchaseEntries, setPurchaseEntries] = useState<AccountEntry[]>([]);
  const [monthlyExpenseEntries, setMonthlyExpenseEntries] = useState<AccountEntry[]>([]);
  const [expenseEntries, setExpenseEntries] = useState<AccountEntry[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [currentYear] = useState<number>(new Date().getFullYear());
  
  const [newEntry, setNewEntry] = useState({
    description: "",
    amount: "",
    date: new Date().toISOString().split('T')[0],
    category: "",
    status: ""
  });

  const [profitLoss, setProfitLoss] = useState({
    totalSales: 0,
    totalExpenses: 0,
    netProfitLoss: 0
  });

  const addEntry = (type: 'sales' | 'purchase' | 'monthly-expense' | 'expense') => {
    if (!newEntry.description || !newEntry.amount) return;
    
    const entry: AccountEntry = {
      id: Date.now().toString(),
      description: newEntry.description,
      amount: parseFloat(newEntry.amount),
      date: newEntry.date,
      category: newEntry.category,
      status: newEntry.status
    };

    if (type === 'sales') {
      setSalesEntries([...salesEntries, entry]);
    } else if (type === 'purchase') {
      setPurchaseEntries([...purchaseEntries, entry]);
    } else if (type === 'monthly-expense') {
      setMonthlyExpenseEntries([...monthlyExpenseEntries, entry]);
    } else {
      setExpenseEntries([...expenseEntries, entry]);
    }

    setNewEntry({
      description: "",
      amount: "",
      date: new Date().toISOString().split('T')[0],
      category: "",
      status: ""
    });
    calculateProfitLoss();
  };

  const deleteEntry = (type: 'sales' | 'purchase' | 'monthly-expense' | 'expense', id: string) => {
    if (type === 'sales') {
      setSalesEntries(salesEntries.filter(entry => entry.id !== id));
    } else if (type === 'purchase') {
      setPurchaseEntries(purchaseEntries.filter(entry => entry.id !== id));
    } else if (type === 'monthly-expense') {
      setMonthlyExpenseEntries(monthlyExpenseEntries.filter(entry => entry.id !== id));
    } else {
      setExpenseEntries(expenseEntries.filter(entry => entry.id !== id));
    }
    calculateProfitLoss();
  };

  const calculateProfitLoss = () => {
    const totalSales = salesEntries.reduce((sum, entry) => sum + entry.amount, 0);
    const totalMonthlyExpenses = monthlyExpenseEntries.reduce((sum, entry) => sum + entry.amount, 0);
    const totalExpenses = expenseEntries.reduce((sum, entry) => sum + entry.amount, 0);
    const totalAllExpenses = totalMonthlyExpenses + totalExpenses;
    
    setProfitLoss({
      totalSales,
      totalExpenses: totalAllExpenses,
      netProfitLoss: totalSales - totalAllExpenses
    });
  };

  useEffect(() => {
    calculateProfitLoss();
  }, [salesEntries, monthlyExpenseEntries, expenseEntries]);

  const getMonthName = (monthNum: number) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[monthNum - 1];
  };

  const EntryForm = ({ type, onAdd }: { type: string; onAdd: () => void }) => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add New {type} Entry
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={newEntry.description}
              onChange={(e) => setNewEntry({...newEntry, description: e.target.value})}
              placeholder="Enter description"
            />
          </div>
          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              value={newEntry.amount}
              onChange={(e) => setNewEntry({...newEntry, amount: e.target.value})}
              placeholder="0.00"
            />
          </div>
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={newEntry.date}
              onChange={(e) => setNewEntry({...newEntry, date: e.target.value})}
            />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={newEntry.category}
              onChange={(e) => setNewEntry({...newEntry, category: e.target.value})}
              placeholder="Category (optional)"
            />
          </div>
        </div>
        {type === 'Sales' && (
          <div>
            <Label htmlFor="status">Payment Status</Label>
            <select
              className="w-full p-2 border rounded-md bg-card"
              value={newEntry.status}
              onChange={(e) => setNewEntry({...newEntry, status: e.target.value})}
            >
              <option value="">Select Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        )}
        <Button onClick={onAdd} className="w-full">
          Add Entry
        </Button>
      </CardContent>
    </Card>
  );

  const EntryList = ({ 
    entries, 
    title, 
    icon, 
    type 
  }: { 
    entries: AccountEntry[]; 
    title: string; 
    icon: React.ReactNode;
    type: 'sales' | 'purchase' | 'monthly-expense' | 'expense';
  }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No entries yet</p>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{entry.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {entry.date} {entry.category && `• ${entry.category}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">${entry.amount.toFixed(2)}</span>
                  {entry.status && (
                    <Badge variant={entry.status === 'paid' ? 'default' : entry.status === 'pending' ? 'secondary' : 'destructive'}>
                      {entry.status}
                    </Badge>
                  )}
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => deleteEntry(type, entry.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-success text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Accounts Management</h2>
              <p className="opacity-90">Current Month: {currentMonth}</p>
            </div>
            <div className="flex items-center gap-4">
              <Calendar className="h-8 w-8 opacity-80" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="sales" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="sales" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Sales
          </TabsTrigger>
          <TabsTrigger value="purchases" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Purchases
          </TabsTrigger>
          <TabsTrigger value="monthly-expenses" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Monthly Expenses
          </TabsTrigger>
          <TabsTrigger value="expenses" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Expenses
          </TabsTrigger>
          <TabsTrigger value="assets" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Assets
          </TabsTrigger>
          <TabsTrigger value="banking" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Banking
          </TabsTrigger>
          <TabsTrigger value="taxes" className="flex items-center gap-2">
            <FileBarChart className="h-4 w-4" />
            Taxes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-6">
          <EntryForm type="Sales" onAdd={() => addEntry('sales')} />
          <EntryList 
            entries={salesEntries} 
            title="Sales Records" 
            icon={<DollarSign className="h-5 w-5" />}
            type="sales"
          />
        </TabsContent>

        <TabsContent value="purchases" className="space-y-6">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Monthly Purchases - {getMonthName(selectedMonth)} {currentYear}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        Month {i + 1} - {getMonthName(i + 1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          <EntryForm type="Purchase" onAdd={() => addEntry('purchase')} />
          <EntryList 
            entries={purchaseEntries} 
            title="Purchase Records" 
            icon={<ShoppingCart className="h-5 w-5" />}
            type="purchase"
          />
        </TabsContent>

        <TabsContent value="monthly-expenses" className="space-y-6">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Monthly Expenses - {getMonthName(selectedMonth)} {currentYear}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        Month {i + 1} - {getMonthName(i + 1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          <EntryForm type="Monthly Expense" onAdd={() => addEntry('monthly-expense')} />
          <EntryList 
            entries={monthlyExpenseEntries} 
            title="Monthly Expense Records" 
            icon={<Receipt className="h-5 w-5" />}
            type="monthly-expense"
          />
        </TabsContent>

        <TabsContent value="expenses" className="space-y-6">
          <EntryForm type="Expense" onAdd={() => addEntry('expense')} />
          <EntryList 
            entries={expenseEntries} 
            title="General Expense Records" 
            icon={<Receipt className="h-5 w-5" />}
            type="expense"
          />
        </TabsContent>

        <TabsContent value="assets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Assets & Liabilities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-accent">Assets</h3>
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg">
                      <Label>Current Assets</Label>
                      <Input placeholder="Cash, Bank Balance, Inventory" className="mt-1" />
                    </div>
                    <div className="p-3 border rounded-lg">
                      <Label>Fixed Assets</Label>
                      <Input placeholder="Machinery, Vehicles, Property" className="mt-1" />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-destructive">Liabilities</h3>
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg">
                      <Label>Current Liabilities</Label>
                      <Input placeholder="Accounts Payable, Short-term Loans" className="mt-1" />
                    </div>
                    <div className="p-3 border rounded-lg">
                      <Label>Long-term Liabilities</Label>
                      <Input placeholder="Bank Loans, Mortgages" className="mt-1" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="banking" className="space-y-6">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {profitLoss.netProfitLoss >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-green-500" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-500" />
                )}
                Profit & Loss Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-900/20">
                  <Label className="text-green-700 dark:text-green-300">Total Sales</Label>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                    ${profitLoss.totalSales.toFixed(2)}
                  </p>
                </div>
                <div className="p-4 border rounded-lg bg-red-50 dark:bg-red-900/20">
                  <Label className="text-red-700 dark:text-red-300">Total Expenses</Label>
                  <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                    ${profitLoss.totalExpenses.toFixed(2)}
                  </p>
                </div>
                <div className={`p-4 border rounded-lg ${profitLoss.netProfitLoss >= 0 
                  ? 'bg-green-50 dark:bg-green-900/20' 
                  : 'bg-red-50 dark:bg-red-900/20'}`}>
                  <Label className={profitLoss.netProfitLoss >= 0 
                    ? 'text-green-700 dark:text-green-300' 
                    : 'text-red-700 dark:text-red-300'}>
                    Net {profitLoss.netProfitLoss >= 0 ? 'Profit' : 'Loss'}
                  </Label>
                  <p className={`text-2xl font-bold ${profitLoss.netProfitLoss >= 0 
                    ? 'text-green-700 dark:text-green-300' 
                    : 'text-red-700 dark:text-red-300'}`}>
                    ${Math.abs(profitLoss.netProfitLoss).toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Banking & Cashflow
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <Label>Cash in Hand</Label>
                  <Input placeholder="0.00" className="mt-2" />
                </div>
                <div className="p-4 border rounded-lg">
                  <Label>Bank Balance</Label>
                  <Input placeholder="0.00" className="mt-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="taxes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileBarChart className="h-5 w-5" />
                Taxes & Compliance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <Label>Sales Tax Collected</Label>
                  <Input placeholder="0.00" className="mt-2" />
                </div>
                <div className="p-4 border rounded-lg">
                  <Label>Income Tax Paid</Label>
                  <Input placeholder="0.00" className="mt-2" />
                </div>
                <div className="p-4 border rounded-lg">
                  <Label>Export Rebates</Label>
                  <Input placeholder="0.00" className="mt-2" />
                </div>
                <div className="p-4 border rounded-lg">
                  <Label>Customs Duty</Label>
                  <Input placeholder="0.00" className="mt-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};