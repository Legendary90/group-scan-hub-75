import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  FolderOpen, 
  Plus, 
  Package, 
  Calendar,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import { useState } from "react";

export const GroupsModule = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [groups] = useState([
    {
      id: 1,
      name: "Q1 2024 Projects",
      status: "active",
      itemCount: 45,
      createdDate: "2024-01-15",
      description: "First quarter project tracking"
    },
    {
      id: 2,
      name: "Manufacturing Batch #001",
      status: "closed",
      itemCount: 32,
      createdDate: "2023-12-20",
      description: "Completed manufacturing batch"
    }
  ]);

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-primary text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Projects & Groups</h2>
              <p className="opacity-90">Organize and manage project groups</p>
            </div>
            <FolderOpen className="h-8 w-8 opacity-80" />
          </div>
        </CardContent>
      </Card>

      {/* Create Group Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Active Groups</h3>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Group
        </Button>
      </div>

      {/* Create Group Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Group</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="groupName">Group Name</Label>
              <Input id="groupName" placeholder="Enter group name" />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Optional description" />
            </div>
            <div className="flex gap-2">
              <Button>Create Group</Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Groups List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <Card key={group.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5" />
                  {group.name}
                </span>
                <Badge variant={group.status === "active" ? "default" : "secondary"}>
                  {group.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">{group.description}</p>
                <div className="flex items-center gap-2 text-sm">
                  <Package className="h-4 w-4" />
                  <span>{group.itemCount} items</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  <span>Created: {group.createdDate}</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline">
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {groups.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="text-center py-12">
            <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Groups Created</h3>
            <p className="text-muted-foreground mb-4">
              Create your first project group to start organizing your work
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Group
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};