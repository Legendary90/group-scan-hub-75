import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Download, 
  Printer, 
  Plus, 
  Receipt,
  FileSpreadsheet,
  Building
} from "lucide-react";

interface InvoiceData {
  sellerName: string;
  sellerAddress: string;
  sellerPhone: string;
  sellerGST: string;
  buyerName: string;
  buyerAddress: string;
  buyerPhone: string;
  buyerNTN: string;
  invoiceNumber: string;
  date: string;
  products: Array<{
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentTerms: string;
}

interface ChallanData {
  challanNumber: string;
  date: string;
  senderName: string;
  senderAddress: string;
  receiverName: string;
  receiverAddress: string;
  goodsDescription: string;
  batchNumber: string;
  quantity: string;
  weight: string;
  units: string;
  truckNumber: string;
  driverName: string;
  courierService: string;
}

export const DocumentsModule = () => {
  const [activeTab, setActiveTab] = useState("create");
  const [documentType, setDocumentType] = useState("invoice");

  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    sellerName: "",
    sellerAddress: "",
    sellerPhone: "",
    sellerGST: "",
    buyerName: "",
    buyerAddress: "",
    buyerPhone: "",
    buyerNTN: "",
    invoiceNumber: "INV-" + Date.now(),
    date: new Date().toISOString().split('T')[0],
    products: [{ description: "", quantity: 0, rate: 0, amount: 0 }],
    subtotal: 0,
    discount: 0,
    tax: 0,
    total: 0,
    paymentTerms: ""
  });

  const [challanData, setChallanData] = useState<ChallanData>({
    challanNumber: "CH-" + Date.now(),
    date: new Date().toISOString().split('T')[0],
    senderName: "",
    senderAddress: "",
    receiverName: "",
    receiverAddress: "",
    goodsDescription: "",
    batchNumber: "",
    quantity: "",
    weight: "",
    units: "",
    truckNumber: "",
    driverName: "",
    courierService: ""
  });

  const addProduct = () => {
    setInvoiceData({
      ...invoiceData,
      products: [...invoiceData.products, { description: "", quantity: 0, rate: 0, amount: 0 }]
    });
  };

  const updateProduct = (index: number, field: string, value: any) => {
    const updatedProducts = [...invoiceData.products];
    updatedProducts[index] = { ...updatedProducts[index], [field]: value };
    
    if (field === 'quantity' || field === 'rate') {
      updatedProducts[index].amount = updatedProducts[index].quantity * updatedProducts[index].rate;
    }
    
    const subtotal = updatedProducts.reduce((sum, product) => sum + product.amount, 0);
    const total = subtotal - invoiceData.discount + invoiceData.tax;
    
    setInvoiceData({
      ...invoiceData,
      products: updatedProducts,
      subtotal,
      total
    });
  };

  const generateDocument = () => {
    console.log("Generating document:", documentType);
    // Here you would implement actual document generation
    alert(`${documentType.charAt(0).toUpperCase() + documentType.slice(1)} generated successfully!`);
  };

  const generateBalanceSheet = () => {
    const balanceSheetData = {
      companyName: "Your Company Name",
      date: new Date().toLocaleDateString(),
      assets: {
        current: {
          cash: 0,
          bank: 0,
          receivables: 0,
          inventory: 0,
          prepaid: 0
        },
        fixed: {
          land: 0,
          building: 0,
          machinery: 0,
          vehicles: 0,
          furniture: 0
        }
      },
      liabilities: {
        current: {
          payables: 0,
          shortTermLoans: 0,
          taxes: 0,
          salaries: 0
        },
        longTerm: {
          bankLoans: 0,
          bonds: 0,
          leases: 0
        }
      },
      equity: {
        shareCapital: 0,
        retainedEarnings: 0,
        reserves: 0
      }
    };

    console.log("Balance Sheet Data:", balanceSheetData);
    alert("Balance Sheet generated! Check console for details.");
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-card border-0 shadow-elegant">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Document Generation</h2>
              <p className="text-muted-foreground">Create invoices, challans, and balance sheets</p>
            </div>
            <FileText className="h-8 w-8 text-primary opacity-80" />
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Document
          </TabsTrigger>
          <TabsTrigger value="auto" className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Auto Generate
          </TabsTrigger>
          <TabsTrigger value="balance" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Balance Sheet
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Document Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button
                  variant={documentType === "invoice" ? "default" : "outline"}
                  onClick={() => setDocumentType("invoice")}
                  className="flex items-center gap-2"
                >
                  <Receipt className="h-4 w-4" />
                  Invoice
                </Button>
                <Button
                  variant={documentType === "challan" ? "default" : "outline"}
                  onClick={() => setDocumentType("challan")}
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Challan
                </Button>
              </div>
            </CardContent>
          </Card>

          {documentType === "challan" && (
            <Card>
              <CardHeader>
                <CardTitle>Challan Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Challan Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Challan Number</Label>
                    <Input
                      value={challanData.challanNumber}
                      onChange={(e) => setChallanData({...challanData, challanNumber: e.target.value})}
                      placeholder="CH-001"
                    />
                  </div>
                  <div>
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={challanData.date}
                      onChange={(e) => setChallanData({...challanData, date: e.target.value})}
                    />
                  </div>
                </div>

                {/* Sender & Receiver Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Sender Details (Supplier/Exporter)</h3>
                    <div className="space-y-3">
                      <div>
                        <Label>Sender Name</Label>
                        <Input
                          value={challanData.senderName}
                          onChange={(e) => setChallanData({...challanData, senderName: e.target.value})}
                          placeholder="Sender Company Name"
                        />
                      </div>
                      <div>
                        <Label>Sender Address</Label>
                        <Textarea
                          value={challanData.senderAddress}
                          onChange={(e) => setChallanData({...challanData, senderAddress: e.target.value})}
                          placeholder="Complete Sender Address"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Receiver Details (Buyer/Importer)</h3>
                    <div className="space-y-3">
                      <div>
                        <Label>Receiver Name</Label>
                        <Input
                          value={challanData.receiverName}
                          onChange={(e) => setChallanData({...challanData, receiverName: e.target.value})}
                          placeholder="Receiver Company Name"
                        />
                      </div>
                      <div>
                        <Label>Receiver Address</Label>
                        <Textarea
                          value={challanData.receiverAddress}
                          onChange={(e) => setChallanData({...challanData, receiverAddress: e.target.value})}
                          placeholder="Complete Receiver Address"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Goods Details */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Description of Goods</h3>
                    <Button 
                      onClick={() => {
                        setChallanData({
                          ...challanData,
                          goods: [...challanData.goods, { description: "", quantity: 0, weight: "", batchNo: "" }]
                        });
                      }} 
                      variant="outline" 
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Item
                    </Button>
                  </div>

                  {challanData.goods.map((item, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 border rounded">
                      <div>
                        <Label>Product Description</Label>
                        <Input
                          placeholder="Product name"
                          value={item.description}
                          onChange={(e) => {
                            const updatedGoods = [...challanData.goods];
                            updatedGoods[index].description = e.target.value;
                            setChallanData({...challanData, goods: updatedGoods});
                          }}
                        />
                      </div>
                      <div>
                        <Label>Quantity/Units</Label>
                        <Input
                          type="number"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => {
                            const updatedGoods = [...challanData.goods];
                            updatedGoods[index].quantity = parseInt(e.target.value) || 0;
                            setChallanData({...challanData, goods: updatedGoods});
                          }}
                        />
                      </div>
                      <div>
                        <Label>Weight</Label>
                        <Input
                          placeholder="Weight/Units"
                          value={item.weight}
                          onChange={(e) => {
                            const updatedGoods = [...challanData.goods];
                            updatedGoods[index].weight = e.target.value;
                            setChallanData({...challanData, goods: updatedGoods});
                          }}
                        />
                      </div>
                      <div>
                        <Label>Batch/Lot No.</Label>
                        <Input
                          placeholder="Batch number"
                          value={item.batchNo}
                          onChange={(e) => {
                            const updatedGoods = [...challanData.goods];
                            updatedGoods[index].batchNo = e.target.value;
                            setChallanData({...challanData, goods: updatedGoods});
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Transport Details */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Transport Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Vehicle Number</Label>
                      <Input
                        value={challanData.transportDetails.vehicleNumber}
                        onChange={(e) => setChallanData({
                          ...challanData, 
                          transportDetails: {...challanData.transportDetails, vehicleNumber: e.target.value}
                        })}
                        placeholder="Truck/Van Number"
                      />
                    </div>
                    <div>
                      <Label>Driver Name</Label>
                      <Input
                        value={challanData.transportDetails.driverName}
                        onChange={(e) => setChallanData({
                          ...challanData, 
                          transportDetails: {...challanData.transportDetails, driverName: e.target.value}
                        })}
                        placeholder="Driver Name"
                      />
                    </div>
                    <div>
                      <Label>Courier Service</Label>
                      <Input
                        value={challanData.transportDetails.courierService}
                        onChange={(e) => setChallanData({
                          ...challanData, 
                          transportDetails: {...challanData.transportDetails, courierService: e.target.value}
                        })}
                        placeholder="Courier/Delivery Service"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Note: Signature of sender & receiver will be added manually after printing
                  </p>
                  <div className="flex gap-3">
                    <Button onClick={generateDocument} className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Generate Challan
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Printer className="h-4 w-4" />
                      Print
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {documentType === "invoice" && (
            <Card>
              <CardHeader>
                <CardTitle>Invoice Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Seller & Buyer Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Seller Details</h3>
                    <div className="space-y-3">
                      <div>
                        <Label>Company Name</Label>
                        <Input
                          value={invoiceData.sellerName}
                          onChange={(e) => setInvoiceData({...invoiceData, sellerName: e.target.value})}
                          placeholder="Your Company Name"
                        />
                      </div>
                      <div>
                        <Label>Address</Label>
                        <Textarea
                          value={invoiceData.sellerAddress}
                          onChange={(e) => setInvoiceData({...invoiceData, sellerAddress: e.target.value})}
                          placeholder="Complete Address"
                        />
                      </div>
                      <div>
                        <Label>Phone</Label>
                        <Input
                          value={invoiceData.sellerPhone}
                          onChange={(e) => setInvoiceData({...invoiceData, sellerPhone: e.target.value})}
                          placeholder="+92 300 1234567"
                        />
                      </div>
                      <div>
                        <Label>GST/Sales Tax Number</Label>
                        <Input
                          value={invoiceData.sellerGST}
                          onChange={(e) => setInvoiceData({...invoiceData, sellerGST: e.target.value})}
                          placeholder="GST Number"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Buyer Details</h3>
                    <div className="space-y-3">
                      <div>
                        <Label>Buyer Name</Label>
                        <Input
                          value={invoiceData.buyerName}
                          onChange={(e) => setInvoiceData({...invoiceData, buyerName: e.target.value})}
                          placeholder="Buyer Name"
                        />
                      </div>
                      <div>
                        <Label>Address</Label>
                        <Textarea
                          value={invoiceData.buyerAddress}
                          onChange={(e) => setInvoiceData({...invoiceData, buyerAddress: e.target.value})}
                          placeholder="Buyer Address"
                        />
                      </div>
                      <div>
                        <Label>Phone</Label>
                        <Input
                          value={invoiceData.buyerPhone}
                          onChange={(e) => setInvoiceData({...invoiceData, buyerPhone: e.target.value})}
                          placeholder="Contact Number"
                        />
                      </div>
                      <div>
                        <Label>NTN/GST Number</Label>
                        <Input
                          value={invoiceData.buyerNTN}
                          onChange={(e) => setInvoiceData({...invoiceData, buyerNTN: e.target.value})}
                          placeholder="NTN Number"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Invoice Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Invoice Number</Label>
                    <Input
                      value={invoiceData.invoiceNumber}
                      onChange={(e) => setInvoiceData({...invoiceData, invoiceNumber: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={invoiceData.date}
                      onChange={(e) => setInvoiceData({...invoiceData, date: e.target.value})}
                    />
                  </div>
                </div>

                {/* Products */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Products/Services</h3>
                    <Button onClick={addProduct} variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Product
                    </Button>
                  </div>

                  {invoiceData.products.map((product, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 border rounded">
                      <Input
                        placeholder="Product description"
                        value={product.description}
                        onChange={(e) => updateProduct(index, 'description', e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="Qty"
                        value={product.quantity}
                        onChange={(e) => updateProduct(index, 'quantity', parseFloat(e.target.value) || 0)}
                      />
                      <Input
                        type="number"
                        placeholder="Rate"
                        value={product.rate}
                        onChange={(e) => updateProduct(index, 'rate', parseFloat(e.target.value) || 0)}
                      />
                      <div className="flex items-center">
                        <span className="font-medium">${product.amount.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-3 max-w-md ml-auto">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${invoiceData.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Discount:</span>
                    <Input
                      type="number"
                      className="w-24"
                      value={invoiceData.discount}
                      onChange={(e) => {
                        const discount = parseFloat(e.target.value) || 0;
                        setInvoiceData({
                          ...invoiceData,
                          discount,
                          total: invoiceData.subtotal - discount + invoiceData.tax
                        });
                      }}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Tax:</span>
                    <Input
                      type="number"
                      className="w-24"
                      value={invoiceData.tax}
                      onChange={(e) => {
                        const tax = parseFloat(e.target.value) || 0;
                        setInvoiceData({
                          ...invoiceData,
                          tax,
                          total: invoiceData.subtotal - invoiceData.discount + tax
                        });
                      }}
                    />
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>${invoiceData.total.toFixed(2)}</span>
                  </div>
                </div>

                <div>
                  <Label>Payment Terms</Label>
                  <Input
                    value={invoiceData.paymentTerms}
                    onChange={(e) => setInvoiceData({...invoiceData, paymentTerms: e.target.value})}
                    placeholder="Payment within 30 days"
                  />
                </div>

                <div className="flex gap-3">
                  <Button onClick={generateDocument} className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Generate Invoice
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Printer className="h-4 w-4" />
                    Print
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="auto" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Auto-Generate from Data</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Automatically generate documents from your existing data
              </p>
              <Badge variant="outline">Coming Soon</Badge>
              <p className="text-sm text-muted-foreground mt-2">
                This feature will fetch data from your accounts and generate documents automatically
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Balance Sheet Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-accent">Assets</h3>
                  <div className="space-y-2">
                    <Input placeholder="Cash in Hand" />
                    <Input placeholder="Bank Balance" />
                    <Input placeholder="Accounts Receivable" />
                    <Input placeholder="Inventory Value" />
                    <Input placeholder="Fixed Assets" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold text-destructive">Liabilities</h3>
                  <div className="space-y-2">
                    <Input placeholder="Accounts Payable" />
                    <Input placeholder="Short-term Loans" />
                    <Input placeholder="Taxes Payable" />
                    <Input placeholder="Bank Loans" />
                    <Input placeholder="Other Liabilities" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold text-primary">Equity</h3>
                  <div className="space-y-2">
                    <Input placeholder="Share Capital" />
                    <Input placeholder="Retained Earnings" />
                    <Input placeholder="Reserves" />
                    <Input placeholder="Current Year Profit" />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={generateBalanceSheet} className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Generate Balance Sheet
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export to PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};