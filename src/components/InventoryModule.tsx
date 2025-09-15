import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Package, 
  Search
} from "lucide-react";

interface InventoryItem {
  id: string;
  name: string;
  currentStock: number;
}

export const InventoryModule = () => {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([
    { id: '1', name: 'Cardboard Boxes', currentStock: 150 },
    { id: '2', name: 'Plastic Wrapping', currentStock: 25 },
    { id: '3', name: 'Shipping Labels', currentStock: 200 },
  ]);

  const [newItem, setNewItem] = useState({
    name: "",
    currentStock: ""
  });

  const [searchTerm, setSearchTerm] = useState("");

  const addItem = () => {
    if (!newItem.name || !newItem.currentStock) return;
    
    const item: InventoryItem = {
      id: Date.now().toString(),
      name: newItem.name,
      currentStock: parseInt(newItem.currentStock)
    };

    setInventoryItems([...inventoryItems, item]);
    setNewItem({ name: "", currentStock: "" });
  };

  const deleteItem = (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      setInventoryItems(inventoryItems.filter(item => item.id !== id));
    }
  };

  const filteredItems = inventoryItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-primary text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Inventory Management</h2>
              <p className="opacity-90">Track and manage your inventory levels</p>
            </div>
            <Package className="h-8 w-8 opacity-80" />
          </div>
        </CardContent>
      </Card>


      {/* Add New Item */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Inventory Item
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={newItem.name}
                onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                placeholder="Enter product name"
              />
            </div>
            <div>
              <Label htmlFor="currentStock">Current Stock</Label>
              <Input
                id="currentStock"
                type="number"
                value={newItem.currentStock}
                onChange={(e) => setNewItem({...newItem, currentStock: e.target.value})}
                placeholder="0"
              />
            </div>
          </div>
          <Button onClick={addItem} className="w-full">
            Add Item
          </Button>
        </CardContent>
      </Card>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search inventory items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Inventory List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Inventory Items ({filteredItems.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredItems.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              {searchTerm ? 'No items match your search' : 'No inventory items yet'}
            </p>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Current Stock: {item.currentStock}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">
                      {item.currentStock}
                    </Badge>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deleteItem(item.id)}
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

      {/* Stock Movement (Coming Soon) */}
      <Card className="opacity-60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Stock Movements
            <Badge variant="outline">Coming Soon</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Real-time stock movements will be available with scanner integration
          </p>
        </CardContent>
      </Card>
    </div>
  );
};