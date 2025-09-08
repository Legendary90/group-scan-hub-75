import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  History, 
  Download, 
  Search, 
  FileText,
  Calendar,
  Package,
  Filter
} from "lucide-react";

interface HistoryGroup {
  id: string;
  name: string;
  closedDate: string;
  totalItems: number;
  type: 'stock_in' | 'export';
  status: 'completed' | 'archived';
  value: number;
}

export const HistoryModule = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<'all' | 'stock_in' | 'export'>('all');

  // Mock data - in real app, this would come from database
  const [historyGroups] = useState<HistoryGroup[]>([
    {
      id: '1',
      name: 'October Export Batch A',
      closedDate: '2024-10-15',
      totalItems: 245,
      type: 'export',
      status: 'completed',
      value: 12500
    },
    {
      id: '2', 
      name: 'Raw Material Stock',
      closedDate: '2024-10-10',
      totalItems: 150,
      type: 'stock_in',
      status: 'completed',
      value: 8750
    },
    {
      id: '3',
      name: 'September Export Batch B',
      closedDate: '2024-09-28',
      totalItems: 320,
      type: 'export',
      status: 'archived',
      value: 18900
    }
  ]);

  const filteredGroups = historyGroups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || group.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const exportToExcel = (group?: HistoryGroup) => {
    if (group) {
      console.log(`Exporting group "${group.name}" to Excel`);
      alert(`Exporting "${group.name}" to Excel format`);
    } else {
      console.log("Exporting all groups to Excel");
      alert("Exporting all history to Excel format");
    }
  };

  const totalValue = filteredGroups.reduce((sum, group) => sum + group.value, 0);

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-card border-0 shadow-elegant">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">History & Archive</h2>
              <p className="text-muted-foreground">View and export completed groups</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold text-accent">${totalValue.toLocaleString()}</p>
              </div>
              <History className="h-8 w-8 text-primary opacity-80" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search history..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                className="p-2 border rounded-md bg-card"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
              >
                <option value="all">All Types</option>
                <option value="stock_in">Stock In</option>
                <option value="export">Export</option>
              </select>
            </div>

            <Button 
              onClick={() => exportToExcel()} 
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export All to Excel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-card border-0 shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Groups</p>
                <p className="text-xl font-semibold">{filteredGroups.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <FileText className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-xl font-semibold">
                  {filteredGroups.reduce((sum, group) => sum + group.totalItems, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-xl font-semibold">
                  {filteredGroups.filter(g => 
                    new Date(g.closedDate).getMonth() === new Date().getMonth()
                  ).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* History List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Completed Groups ({filteredGroups.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredGroups.length === 0 ? (
            <div className="text-center py-8">
              <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm || filterType !== 'all' ? 'No groups match your filters' : 'No completed groups yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredGroups.map((group) => (
                <div key={group.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium">{group.name}</h3>
                      <Badge variant={group.type === 'export' ? 'default' : 'secondary'}>
                        {group.type === 'export' ? 'Export' : 'Stock In'}
                      </Badge>
                      <Badge variant={group.status === 'completed' ? 'default' : 'outline'}>
                        {group.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Closed: {new Date(group.closedDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        {group.totalItems} items
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        Value: ${group.value.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => exportToExcel(group)}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Export
                    </Button>
                    <Button variant="ghost" size="sm">
                      <FileText className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Export Settings</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="radio" name="export-type" value="stock_in" defaultChecked />
                  <span>Mark as Stock In</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="export-type" value="exported" />
                  <span>Mark as Exported</span>
                </label>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">File Format</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="radio" name="file-format" value="excel" defaultChecked />
                  <span>Excel (.xlsx)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="file-format" value="csv" />
                  <span>CSV (.csv)</span>
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};