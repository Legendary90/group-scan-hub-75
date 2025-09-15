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
  Briefcase, 
  FileText, 
  Shield, 
  Building, 
  Plus,
  Edit,
  Trash2,
  Calendar,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import type { Period } from "../ERPDashboard";

interface LegalDocument {
  id: string;
  type: 'contract' | 'license' | 'permit' | 'insurance' | 'regulatory' | 'agreement';
  title: string;
  description: string;
  issueDate: string;
  expiryDate?: string;
  status: 'active' | 'expired' | 'pending' | 'cancelled';
  authority?: string;
  referenceNumber?: string;
  amount?: number;
  periodId: string;
  createdAt: string;
}

interface LegalComplianceModuleProps {
  currentPeriod: Period | null;
}

export const LegalComplianceModule = ({ currentPeriod }: LegalComplianceModuleProps) => {
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [activeTab, setActiveTab] = useState("contracts");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    type: 'contract' as LegalDocument['type'],
    title: '',
    description: '',
    issueDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    status: 'active' as LegalDocument['status'],
    authority: '',
    referenceNumber: '',
    amount: ''
  });

  // Load documents for current period
  useEffect(() => {
    if (currentPeriod) {
      const savedDocuments = localStorage.getItem(`legal_documents_${currentPeriod.id}`);
      if (savedDocuments) {
        setDocuments(JSON.parse(savedDocuments));
      }
    }
  }, [currentPeriod]);

  // Save documents when they change
  useEffect(() => {
    if (currentPeriod && documents.length > 0) {
      localStorage.setItem(`legal_documents_${currentPeriod.id}`, JSON.stringify(documents));
    }
  }, [documents, currentPeriod]);

  const resetForm = () => {
    setFormData({
      type: 'contract',
      title: '',
      description: '',
      issueDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
      status: 'active',
      authority: '',
      referenceNumber: '',
      amount: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPeriod || !formData.title || !formData.description) return;

    const document: LegalDocument = {
      id: editingId || Date.now().toString(),
      type: formData.type,
      title: formData.title,
      description: formData.description,
      issueDate: formData.issueDate,
      expiryDate: formData.expiryDate || undefined,
      status: formData.status,
      authority: formData.authority || undefined,
      referenceNumber: formData.referenceNumber || undefined,
      amount: formData.amount ? parseFloat(formData.amount) : undefined,
      periodId: currentPeriod.id,
      createdAt: editingId ? documents.find(d => d.id === editingId)?.createdAt || new Date().toISOString() : new Date().toISOString()
    };

    if (editingId) {
      setDocuments(prev => prev.map(d => d.id === editingId ? document : d));
    } else {
      setDocuments(prev => [...prev, document]);
    }

    resetForm();
  };

  const handleEdit = (document: LegalDocument) => {
    setFormData({
      type: document.type,
      title: document.title,
      description: document.description,
      issueDate: document.issueDate,
      expiryDate: document.expiryDate || '',
      status: document.status,
      authority: document.authority || '',
      referenceNumber: document.referenceNumber || '',
      amount: document.amount?.toString() || ''
    });
    setEditingId(document.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      setDocuments(prev => prev.filter(d => d.id !== id));
    }
  };

  const filterDocumentsByType = (type: string) => {
    const typeMap: Record<string, LegalDocument['type'][]> = {
      contracts: ['contract', 'agreement'],
      licenses: ['license'],
      permits: ['permit'],
      insurance: ['insurance'],
      regulatory: ['regulatory']
    };
    
    return documents.filter(d => typeMap[type]?.includes(d.type));
  };

  const getExpiryStatus = (document: LegalDocument) => {
    if (!document.expiryDate) return null;
    
    const today = new Date();
    const expiry = new Date(document.expiryDate);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return { status: 'expired', days: Math.abs(daysUntilExpiry) };
    if (daysUntilExpiry <= 30) return { status: 'expiring', days: daysUntilExpiry };
    return { status: 'valid', days: daysUntilExpiry };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'expired': return 'destructive';
      case 'pending': return 'secondary';
      case 'cancelled': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (document: LegalDocument) => {
    const expiryStatus = getExpiryStatus(document);
    
    if (expiryStatus?.status === 'expired') return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (expiryStatus?.status === 'expiring') return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    if (document.status === 'active') return <CheckCircle className="h-4 w-4 text-green-500" />;
    return null;
  };

  if (!currentPeriod) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No active period. Please create a period to start managing legal documents.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Legal & Compliance Documents - {currentPeriod.name}
            </CardTitle>
            <Button onClick={() => setShowForm(!showForm)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Document
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Add/Edit Form */}
          {showForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">
                  {editingId ? 'Edit Document' : 'Add New Legal Document'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="type">Document Type</Label>
                      <Select 
                        value={formData.type} 
                        onValueChange={(value) => setFormData(prev => ({...prev, type: value as LegalDocument['type']}))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="contract">Contract</SelectItem>
                          <SelectItem value="agreement">Agreement</SelectItem>
                          <SelectItem value="license">License</SelectItem>
                          <SelectItem value="permit">Permit</SelectItem>
                          <SelectItem value="insurance">Insurance</SelectItem>
                          <SelectItem value="regulatory">Regulatory Filing</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select 
                        value={formData.status} 
                        onValueChange={(value) => setFormData(prev => ({...prev, status: value as LegalDocument['status']}))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="expired">Expired</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="title">Document Title</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
                        placeholder="Enter document title"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="issueDate">Issue Date</Label>
                      <Input
                        id="issueDate"
                        type="date"
                        value={formData.issueDate}
                        onChange={(e) => setFormData(prev => ({...prev, issueDate: e.target.value}))}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
                      <Input
                        id="expiryDate"
                        type="date"
                        value={formData.expiryDate}
                        onChange={(e) => setFormData(prev => ({...prev, expiryDate: e.target.value}))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="authority">Issuing Authority</Label>
                      <Input
                        id="authority"
                        value={formData.authority}
                        onChange={(e) => setFormData(prev => ({...prev, authority: e.target.value}))}
                        placeholder="e.g., Government Agency, Court"
                      />
                    </div>

                    <div>
                      <Label htmlFor="referenceNumber">Reference Number</Label>
                      <Input
                        id="referenceNumber"
                        value={formData.referenceNumber}
                        onChange={(e) => setFormData(prev => ({...prev, referenceNumber: e.target.value}))}
                        placeholder="Document reference/ID"
                      />
                    </div>

                    <div>
                      <Label htmlFor="amount">Amount/Fee ($)</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => setFormData(prev => ({...prev, amount: e.target.value}))}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                      placeholder="Enter document description"
                      required
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit">
                      {editingId ? 'Update Document' : 'Add Document'}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Documents Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="contracts">Contracts</TabsTrigger>
              <TabsTrigger value="licenses">Licenses</TabsTrigger>
              <TabsTrigger value="permits">Permits</TabsTrigger>
              <TabsTrigger value="insurance">Insurance</TabsTrigger>
              <TabsTrigger value="regulatory">Regulatory</TabsTrigger>
            </TabsList>

            {['contracts', 'licenses', 'permits', 'insurance', 'regulatory'].map(tab => (
              <TabsContent key={tab} value={tab} className="space-y-4">
                {filterDocumentsByType(tab).length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No {tab} documents for this period</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filterDocumentsByType(tab).map((document) => {
                      const expiryStatus = getExpiryStatus(document);
                      return (
                        <div key={document.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              {getStatusIcon(document)}
                              <h4 className="font-medium">{document.title}</h4>
                              <Badge variant={getStatusColor(document.status)}>
                                {document.status}
                              </Badge>
                              {expiryStatus && (
                                <Badge variant={expiryStatus.status === 'expired' ? 'destructive' : expiryStatus.status === 'expiring' ? 'secondary' : 'outline'}>
                                  {expiryStatus.status === 'expired' 
                                    ? `Expired ${expiryStatus.days} days ago`
                                    : expiryStatus.status === 'expiring'
                                    ? `Expires in ${expiryStatus.days} days`
                                    : 'Valid'
                                  }
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{document.description}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {document.issueDate}
                              </span>
                              {document.expiryDate && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  Expires: {document.expiryDate}
                                </span>
                              )}
                              {document.authority && <span>Authority: {document.authority}</span>}
                              {document.referenceNumber && <span>Ref: {document.referenceNumber}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {document.amount && (
                              <span className="font-semibold">${document.amount.toFixed(2)}</span>
                            )}
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" onClick={() => handleEdit(document)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(document.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
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