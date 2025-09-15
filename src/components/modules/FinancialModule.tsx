import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  DollarSign, 
  Receipt, 
  FileText, 
  CreditCard, 
  Plus,
  Edit,
  Trash2,
  Download,
  Calculator,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import type { Period } from "../ERPDashboard";

interface FinancialRecord {
  id: string;
  type: 'income' | 'expense' | 'invoice' | 'bill' | 'bank_statement' | 'payroll' | 'tax';
  amount: number;
  description: string;
  date: string;
  category: string;
  reference?: string;
  status: 'pending' | 'paid' | 'overdue';
  periodId: string;
  createdAt: string;
}

interface FinancialModuleProps {
  currentPeriod: Period | null;
}

export const FinancialModule = ({ currentPeriod }: FinancialModuleProps) => {
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [activeTab, setActiveTab] = useState("income");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    type: 'income' as FinancialRecord['type'],
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
    reference: '',
    status: 'pending' as FinancialRecord['status']
  });

  // Load records for current period
  useEffect(() => {
    if (currentPeriod) {
      const savedRecords = localStorage.getItem(`financial_records_${currentPeriod.id}`);
      if (savedRecords) {
        setRecords(JSON.parse(savedRecords));
      }
    }
  }, [currentPeriod]);

  // Save records when they change
  useEffect(() => {
    if (currentPeriod && records.length > 0) {
      localStorage.setItem(`financial_records_${currentPeriod.id}`, JSON.stringify(records));
    }
  }, [records, currentPeriod]);

  const resetForm = () => {
    setFormData({
      type: 'income',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      category: '',
      reference: '',
      status: 'pending'
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPeriod || !formData.amount || !formData.description) return;

    const record: FinancialRecord = {
      id: editingId || Date.now().toString(),
      type: formData.type,
      amount: parseFloat(formData.amount),
      description: formData.description,
      date: formData.date,
      category: formData.category,
      reference: formData.reference,
      status: formData.status,
      periodId: currentPeriod.id,
      createdAt: editingId ? records.find(r => r.id === editingId)?.createdAt || new Date().toISOString() : new Date().toISOString()
    };

    if (editingId) {
      setRecords(prev => prev.map(r => r.id === editingId ? record : r));
    } else {
      setRecords(prev => [...prev, record]);
    }

    resetForm();
  };

  const handleEdit = (record: FinancialRecord) => {
    setFormData({
      type: record.type,
      amount: record.amount.toString(),
      description: record.description,
      date: record.date,
      category: record.category,
      reference: record.reference || '',
      status: record.status
    });
    setEditingId(record.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this record?')) {
      setRecords(prev => prev.filter(r => r.id !== id));
    }
  };

  const filterRecordsByType = (type: string) => {
    const typeMap: Record<string, FinancialRecord['type'][]> = {
      income: ['income'],
      expenses: ['expense'],
      invoices: ['invoice'],
      bills: ['bill'],
      banking: ['bank_statement'],
      payroll: ['payroll'],
      taxes: ['tax']
    };
    
    return records.filter(r => typeMap[type]?.includes(r.type));
  };

  const calculateTotals = () => {
    const income = records.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0);
    const expenses = records.filter(r => ['expense', 'bill', 'payroll', 'tax'].includes(r.type)).reduce((sum, r) => sum + r.amount, 0);
    const netProfit = income - expenses;
    
    return { income, expenses, netProfit };
  };

  const totals = calculateTotals();

  const categories = {
    income: ['Sales Revenue', 'Service Income', 'Interest Income', 'Other Income'],
    expense: ['Office Supplies', 'Utilities', 'Rent', 'Marketing', 'Travel', 'Other'],
    invoice: ['Product Sales', 'Service Fees', 'Consulting', 'Subscription'],
    bill: ['Vendor Bills', 'Utilities', 'Rent', 'Insurance'],
    bank_statement: ['Bank Transfer', 'Credit Card', 'Cash'],
    payroll: ['Salaries', 'Benefits', 'Taxes', 'Bonuses'],
    tax: ['Income Tax', 'Sales Tax', 'Property Tax', 'Other Tax']
  };

  if (!currentPeriod) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Calculator className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No active period. Please create a period to start managing financial records.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 opacity-80" />
              <div>
                <p className="text-sm opacity-90">Total Income</p>
                <p className="text-2xl font-bold">${totals.income.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingDown className="h-8 w-8 opacity-80" />
              <div>
                <p className="text-sm opacity-90">Total Expenses</p>
                <p className="text-2xl font-bold">${totals.expenses.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-r ${totals.netProfit >= 0 ? 'from-blue-500 to-blue-600' : 'from-orange-500 to-orange-600'} text-white border-0`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calculator className="h-8 w-8 opacity-80" />
              <div>
                <p className="text-sm opacity-90">Net {totals.netProfit >= 0 ? 'Profit' : 'Loss'}</p>
                <p className="text-2xl font-bold">${Math.abs(totals.netProfit).toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Financial Records - {currentPeriod.name}
            </CardTitle>
            <Button onClick={() => setShowForm(!showForm)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Record
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Add/Edit Form */}
          {showForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">
                  {editingId ? 'Edit Record' : 'Add New Financial Record'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="type">Record Type</Label>
                      <Select 
                        value={formData.type} 
                        onValueChange={(value) => setFormData(prev => ({...prev, type: value as FinancialRecord['type']}))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="income">Income/Revenue</SelectItem>
                          <SelectItem value="expense">Expense</SelectItem>
                          <SelectItem value="invoice">Invoice</SelectItem>
                          <SelectItem value="bill">Bill</SelectItem>
                          <SelectItem value="bank_statement">Bank Statement</SelectItem>
                          <SelectItem value="payroll">Payroll</SelectItem>
                          <SelectItem value="tax">Tax Document</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="amount">Amount ($)</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => setFormData(prev => ({...prev, amount: e.target.value}))}
                        placeholder="0.00"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData(prev => ({...prev, date: e.target.value}))}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select 
                        value={formData.category} 
                        onValueChange={(value) => setFormData(prev => ({...prev, category: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories[formData.type]?.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="reference">Reference/Invoice #</Label>
                      <Input
                        id="reference"
                        value={formData.reference}
                        onChange={(e) => setFormData(prev => ({...prev, reference: e.target.value}))}
                        placeholder="Optional reference"
                      />
                    </div>

                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select 
                        value={formData.status} 
                        onValueChange={(value) => setFormData(prev => ({...prev, status: value as FinancialRecord['status']}))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="overdue">Overdue</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                      placeholder="Enter description"
                      required
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit">
                      {editingId ? 'Update Record' : 'Add Record'}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Records Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="income">Income</TabsTrigger>
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
              <TabsTrigger value="bills">Bills</TabsTrigger>
              <TabsTrigger value="banking">Banking</TabsTrigger>
              <TabsTrigger value="payroll">Payroll</TabsTrigger>
              <TabsTrigger value="taxes">Taxes</TabsTrigger>
            </TabsList>

            {['income', 'expenses', 'invoices', 'bills', 'banking', 'payroll', 'taxes'].map(tab => (
              <TabsContent key={tab} value={tab} className="space-y-4">
                {filterRecordsByType(tab).length === 0 ? (
                  <div className="text-center py-8">
                    <Receipt className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No {tab} records for this period</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filterRecordsByType(tab).map((record) => (
                      <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium">{record.description}</h4>
                            <Badge variant={record.status === 'paid' ? 'default' : record.status === 'pending' ? 'secondary' : 'destructive'}>
                              {record.status}
                            </Badge>
                            {record.category && (
                              <Badge variant="outline">{record.category}</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{record.date}</span>
                            {record.reference && <span>Ref: {record.reference}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-lg">${record.amount.toFixed(2)}</span>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(record)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(record.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};