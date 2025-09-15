import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Calendar, Clock } from "lucide-react";
import type { Period } from "./ERPDashboard";

interface PeriodManagerProps {
  onCreatePeriod: (period: Omit<Period, 'id' | 'createdAt'>) => void;
  onClose: () => void;
  currentPeriod: Period | null;
}

export const PeriodManager = ({ onCreatePeriod, onClose, currentPeriod }: PeriodManagerProps) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'monthly' as 'daily' | 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: ''
  });

  const handleTypeChange = (type: 'daily' | 'monthly') => {
    setFormData(prev => {
      const start = new Date(prev.startDate);
      let end: Date;
      
      if (type === 'daily') {
        end = new Date(start);
        end.setDate(start.getDate() + 1);
      } else {
        end = new Date(start);
        end.setMonth(start.getMonth() + 1);
      }
      
      return {
        ...prev,
        type,
        endDate: end.toISOString().split('T')[0]
      };
    });
  };

  const handleStartDateChange = (startDate: string) => {
    const start = new Date(startDate);
    let end: Date;
    
    if (formData.type === 'daily') {
      end = new Date(start);
      end.setDate(start.getDate() + 1);
    } else {
      end = new Date(start);
      end.setMonth(start.getMonth() + 1);
    }
    
    setFormData(prev => ({
      ...prev,
      startDate,
      endDate: end.toISOString().split('T')[0]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    onCreatePeriod({
      name: formData.name,
      type: formData.type,
      startDate: formData.startDate,
      endDate: formData.endDate,
      status: 'active'
    });
  };

  const generateSuggestedName = () => {
    const start = new Date(formData.startDate);
    if (formData.type === 'monthly') {
      return start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else {
      return start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Create New Period
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {currentPeriod && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Current period "{currentPeriod.name}" will be closed and moved to history.
                </p>
              </div>
            )}
            
            <div>
              <Label htmlFor="type">Period Type</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value: 'daily' | 'monthly') => handleTypeChange(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Daily Period
                    </div>
                  </SelectItem>
                  <SelectItem value="monthly">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Monthly Period
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({...prev, endDate: e.target.value}))}
                required
              />
            </div>

            <div>
              <Label htmlFor="name">Period Name</Label>
              <div className="flex gap-2">
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                  placeholder="Enter period name"
                  required
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setFormData(prev => ({...prev, name: generateSuggestedName()}))}
                >
                  Auto
                </Button>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                Create Period
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};