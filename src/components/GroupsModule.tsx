import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Scan, 
  QrCode, 
  Package, 
  Clock,
  AlertCircle
} from "lucide-react";

export const GroupsModule = () => {
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-primary text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Projects & Groups</h2>
              <p className="opacity-90">Manage scanning groups and projects</p>
            </div>
            <Package className="h-8 w-8 opacity-80" />
          </div>
        </CardContent>
      </Card>

      {/* Scanner Features - Coming Soon */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="opacity-60 border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Create Groups
              <Badge variant="outline">Coming Soon</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Create and manage scanning groups for different projects. Name groups, 
              add products, and track progress in real-time.
            </p>
            <Button className="w-full mt-4" disabled>
              <Package className="h-4 w-4 mr-2" />
              Create New Group
            </Button>
          </CardContent>
        </Card>

        <Card className="opacity-60 border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Generate QR Tags
              <Badge variant="outline">Coming Soon</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Generate QR code tags for products with special IDs. 
              Print multiple copies and attach to products for easy scanning.
            </p>
            <Button className="w-full mt-4" disabled>
              <QrCode className="h-4 w-4 mr-2" />
              Generate Tags
            </Button>
          </CardContent>
        </Card>

        <Card className="opacity-60 border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scan className="h-5 w-5" />
              Scanner Interface
              <Badge variant="outline">Coming Soon</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Connect ESP32 scanner to scan products and automatically 
              update group data. Real-time inventory tracking.
            </p>
            <Button className="w-full mt-4" disabled>
              <Scan className="h-4 w-4 mr-2" />
              Connect Scanner
            </Button>
          </CardContent>
        </Card>

        <Card className="opacity-60 border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Real-time Tracking
              <Badge variant="outline">Coming Soon</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Track scanning progress in real-time. Monitor quota completion, 
              stock levels, and worker productivity.
            </p>
          </CardContent>
        </Card>

        <Card className="opacity-60 border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Group Management
              <Badge variant="outline">Coming Soon</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Rename groups (F2), close completed groups, 
              and manage multiple active groups simultaneously.
            </p>
          </CardContent>
        </Card>

        <Card className="opacity-60 border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Stock Confirmation
              <Badge variant="outline">Coming Soon</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Automatic "Confirmed" notifications after scanning. 
              Choose between Stock In or Export modes for each scan.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Scanner Status */}
      <Card className="border-muted bg-muted/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-muted-foreground">
            <Scan className="h-5 w-5" />
            Scanner Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">
              Scanner Not Connected
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              The ESP32 scanner hardware is not yet integrated. All scanner-dependent 
              features will be available once the hardware component is ready.
            </p>
            <Badge variant="outline" className="mt-4">
              Hardware Development in Progress
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};