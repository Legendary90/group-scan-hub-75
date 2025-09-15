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
  ShoppingBag, 
  Users, 
  FileText, 
  MessageSquare, 
  Plus,
  Edit,
  Trash2,
  User,
  DollarSign,
  Star,
  Phone,
  Mail
} from "lucide-react";
import type { Period } from "../ERPDashboard";

interface Customer {
  id: string;
  name: string;
  company?: string;
  email: string;
  phone?: string;
  address?: string;
  type: 'individual' | 'business';
  status: 'active' | 'inactive';
  totalOrders: number;
  totalSpent: number;
  periodId: string;
  createdAt: string;
}

interface SalesInvoice {
  id: string;
  customerId: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  notes?: string;
  periodId: string;
  createdAt: string;
}

interface CustomerFeedback {
  id: string;
  customerId: string;
  type: 'feedback' | 'complaint' | 'suggestion';
  subject: string;
  message: string;
  rating?: number;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  response?: string;
  date: string;
  periodId: string;
  createdAt: string;
}

interface CustomerSalesModuleProps {
  currentPeriod: Period | null;
}

export const CustomerSalesModule = ({ currentPeriod }: CustomerSalesModuleProps) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<SalesInvoice[]>([]);
  const [feedback, setFeedback] = useState<CustomerFeedback[]>([]);
  const [activeTab, setActiveTab] = useState("customers");
  const [showForm, setShowForm] = useState<'customer' | 'invoice' | 'feedback' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [customerForm, setCustomerForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    type: 'individual' as Customer['type'],
    status: 'active' as Customer['status']
  });

  const [invoiceForm, setInvoiceForm] = useState({
    customerId: '',
    invoiceNumber: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
    tax: 0,
    notes: '',
    status: 'draft' as SalesInvoice['status']
  });

  const [feedbackForm, setFeedbackForm] = useState({
    customerId: '',
    type: 'feedback' as CustomerFeedback['type'],
    subject: '',
    message: '',
    rating: 5,
    status: 'open' as CustomerFeedback['status'],
    response: ''
  });

  // Load data for current period
  useEffect(() => {
    if (currentPeriod) {
      const savedCustomers = localStorage.getItem(`customers_${currentPeriod.id}`);
      const savedInvoices = localStorage.getItem(`invoices_${currentPeriod.id}`);
      const savedFeedback = localStorage.getItem(`feedback_${currentPeriod.id}`);
      
      if (savedCustomers) setCustomers(JSON.parse(savedCustomers));
      if (savedInvoices) setInvoices(JSON.parse(savedInvoices));
      if (savedFeedback) setFeedback(JSON.parse(savedFeedback));
    }
  }, [currentPeriod]);

  // Save data when it changes
  useEffect(() => {
    if (currentPeriod) {
      if (customers.length > 0) localStorage.setItem(`customers_${currentPeriod.id}`, JSON.stringify(customers));
      if (invoices.length > 0) localStorage.setItem(`invoices_${currentPeriod.id}`, JSON.stringify(invoices));
      if (feedback.length > 0) localStorage.setItem(`feedback_${currentPeriod.id}`, JSON.stringify(feedback));
    }
  }, [customers, invoices, feedback, currentPeriod]);

  const resetForms = () => {
    setCustomerForm({
      name: '',
      company: '',
      email: '',
      phone: '',
      address: '',
      type: 'individual',
      status: 'active'
    });
    setInvoiceForm({
      customerId: '',
      invoiceNumber: '',
      date: new Date().toISOString().split('T')[0],
      dueDate: '',
      items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
      tax: 0,
      notes: '',
      status: 'draft'
    });
    setFeedbackForm({
      customerId: '',
      type: 'feedback',
      subject: '',
      message: '',
      rating: 5,
      status: 'open',
      response: ''
    });
    setEditingId(null);
    setShowForm(null);
  };

  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPeriod || !customerForm.name || !customerForm.email) return;

    const customer: Customer = {
      id: editingId || Date.now().toString(),
      name: customerForm.name,
      company: customerForm.company || undefined,
      email: customerForm.email,
      phone: customerForm.phone || undefined,
      address: customerForm.address || undefined,
      type: customerForm.type,
      status: customerForm.status,
      totalOrders: 0,
      totalSpent: 0,
      periodId: currentPeriod.id,
      createdAt: editingId ? customers.find(c => c.id === editingId)?.createdAt || new Date().toISOString() : new Date().toISOString()
    };

    if (editingId) {
      setCustomers(prev => prev.map(c => c.id === editingId ? customer : c));
    } else {
      setCustomers(prev => [...prev, customer]);
    }

    resetForms();
  };

  const handleInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPeriod || !invoiceForm.customerId || !invoiceForm.invoiceNumber) return;

    const subtotal = invoiceForm.items.reduce((sum, item) => sum + item.total, 0);
    const total = subtotal + invoiceForm.tax;

    const invoice: SalesInvoice = {
      id: editingId || Date.now().toString(),
      customerId: invoiceForm.customerId,
      invoiceNumber: invoiceForm.invoiceNumber,
      date: invoiceForm.date,
      dueDate: invoiceForm.dueDate,
      items: invoiceForm.items,
      subtotal,
      tax: invoiceForm.tax,
      total,
      status: invoiceForm.status,
      notes: invoiceForm.notes || undefined,
      periodId: currentPeriod.id,
      createdAt: editingId ? invoices.find(i => i.id === editingId)?.createdAt || new Date().toISOString() : new Date().toISOString()
    };

    if (editingId) {
      setInvoices(prev => prev.map(i => i.id === editingId ? invoice : i));
    } else {
      setInvoices(prev => [...prev, invoice]);
    }

    resetForms();
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPeriod || !feedbackForm.customerId || !feedbackForm.subject) return;

    const feedbackRecord: CustomerFeedback = {
      id: editingId || Date.now().toString(),
      customerId: feedbackForm.customerId,
      type: feedbackForm.type,
      subject: feedbackForm.subject,
      message: feedbackForm.message,
      rating: feedbackForm.rating,
      status: feedbackForm.status,
      response: feedbackForm.response || undefined,
      date: new Date().toISOString().split('T')[0],
      periodId: currentPeriod.id,
      createdAt: editingId ? feedback.find(f => f.id === editingId)?.createdAt || new Date().toISOString() : new Date().toISOString()
    };

    if (editingId) {
      setFeedback(prev => prev.map(f => f.id === editingId ? feedbackRecord : f));
    } else {
      setFeedback(prev => [...prev, feedbackRecord]);
    }

    resetForms();
  };

  const getCustomerName = (customerId: string) => {
    return customers.find(c => c.id === customerId)?.name || 'Unknown Customer';
  };

  const updateInvoiceItem = (index: number, field: string, value: any) => {
    const newItems = [...invoiceForm.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
    }
    
    setInvoiceForm(prev => ({ ...prev, items: newItems }));
  };

  const addInvoiceItem = () => {
    setInvoiceForm(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, unitPrice: 0, total: 0 }]
    }));
  };

  const removeInvoiceItem = (index: number) => {
    setInvoiceForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const getSalesStats = () => {
    const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0);
    const pendingRevenue = invoices.filter(i => ['sent', 'overdue'].includes(i.status)).reduce((sum, i) => sum + i.total, 0);
    const totalInvoices = invoices.length;
    const activeCustomers = customers.filter(c => c.status === 'active').length;
    
    return { totalRevenue, pendingRevenue, totalInvoices, activeCustomers };
  };

  const stats = getSalesStats();

  if (!currentPeriod) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No active period. Please create a period to start managing customers and sales.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sales Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 opacity-80" />
              <div>
                <p className="text-sm opacity-90">Total Revenue</p>
                <p className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 opacity-80" />
              <div>
                <p className="text-sm opacity-90">Pending Revenue</p>
                <p className="text-2xl font-bold">${stats.pendingRevenue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 opacity-80" />
              <div>
                <p className="text-sm opacity-90">Active Customers</p>
                <p className="text-2xl font-bold">{stats.activeCustomers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 opacity-80" />
              <div>
                <p className="text-sm opacity-90">Total Invoices</p>
                <p className="text-2xl font-bold">{stats.totalInvoices}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Customer & Sales Management - {currentPeriod.name}
            </CardTitle>
            <div className="flex gap-2">
              <Button onClick={() => setShowForm('customer')} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Customer
              </Button>
              <Button onClick={() => setShowForm('invoice')} variant="outline" className="gap-2">
                <FileText className="h-4 w-4" />
                Create Invoice
              </Button>
              <Button onClick={() => setShowForm('feedback')} variant="outline" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Add Feedback
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Forms */}
          {showForm === 'customer' && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Add New Customer</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCustomerSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Customer Name</Label>
                      <Input
                        id="name"
                        value={customerForm.name}
                        onChange={(e) => setCustomerForm(prev => ({...prev, name: e.target.value}))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={customerForm.email}
                        onChange={(e) => setCustomerForm(prev => ({...prev, email: e.target.value}))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        value={customerForm.company}
                        onChange={(e) => setCustomerForm(prev => ({...prev, company: e.target.value}))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={customerForm.phone}
                        onChange={(e) => setCustomerForm(prev => ({...prev, phone: e.target.value}))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">Customer Type</Label>
                      <Select 
                        value={customerForm.type} 
                        onValueChange={(value) => setCustomerForm(prev => ({...prev, type: value as Customer['type']}))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="individual">Individual</SelectItem>
                          <SelectItem value="business">Business</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select 
                        value={customerForm.status} 
                        onValueChange={(value) => setCustomerForm(prev => ({...prev, status: value as Customer['status']}))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={customerForm.address}
                      onChange={(e) => setCustomerForm(prev => ({...prev, address: e.target.value}))}
                      placeholder="Customer address"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit">Add Customer</Button>
                    <Button type="button" variant="outline" onClick={resetForms}>Cancel</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Data Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="customers">Customers</TabsTrigger>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
              <TabsTrigger value="feedback">Feedback</TabsTrigger>
            </TabsList>

            <TabsContent value="customers" className="space-y-4">
              {customers.length === 0 ? (
                <div className="text-center py-8">
                  <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No customers added yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {customers.map((customer) => (
                    <div key={customer.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium">{customer.name}</h4>
                          {customer.company && <span className="text-sm text-muted-foreground">({customer.company})</span>}
                          <Badge variant={customer.status === 'active' ? 'default' : 'secondary'}>
                            {customer.status}
                          </Badge>
                          <Badge variant="outline">{customer.type}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {customer.email}
                          </span>
                          {customer.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {customer.phone}
                            </span>
                          )}
                          <span>Orders: {customer.totalOrders}</span>
                          <span>Spent: ${customer.totalSpent.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="invoices" className="space-y-4">
              {invoices.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No invoices created yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium">Invoice #{invoice.invoiceNumber}</h4>
                          <Badge variant={
                            invoice.status === 'paid' ? 'default' :
                            invoice.status === 'sent' ? 'secondary' :
                            invoice.status === 'overdue' ? 'destructive' : 'outline'
                          }>
                            {invoice.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Customer: {getCustomerName(invoice.customerId)}</span>
                          <span>Date: {invoice.date}</span>
                          <span>Due: {invoice.dueDate}</span>
                          <span>Items: {invoice.items.length}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-lg">${invoice.total.toFixed(2)}</span>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="feedback" className="space-y-4">
              {feedback.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No feedback records yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {feedback.map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium">{record.subject}</h4>
                          <Badge variant={
                            record.status === 'resolved' ? 'default' :
                            record.status === 'in_progress' ? 'secondary' : 'outline'
                          }>
                            {record.status}
                          </Badge>
                          <Badge variant="outline">{record.type}</Badge>
                          {record.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm">{record.rating}/5</span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{record.message}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>From: {getCustomerName(record.customerId)}</span>
                          <span>Date: {record.date}</span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};