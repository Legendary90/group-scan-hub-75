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
  Users, 
  UserCheck, 
  Clock, 
  Calendar, 
  Plus,
  Edit,
  Trash2,
  User,
  CheckCircle,
  XCircle,
  Coffee
} from "lucide-react";
import type { Period } from "../ERPDashboard";

interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  email: string;
  phone?: string;
  hireDate: string;
  salary?: number;
  status: 'active' | 'inactive' | 'terminated';
  periodId: string;
  createdAt: string;
}

interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  clockIn?: string;
  clockOut?: string;
  status: 'present' | 'absent' | 'late' | 'half_day';
  notes?: string;
  periodId: string;
  createdAt: string;
}

interface LeaveRecord {
  id: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  type: 'vacation' | 'sick' | 'personal' | 'maternity' | 'other';
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  approvedBy?: string;
  periodId: string;
  createdAt: string;
}

interface EmployeeModuleProps {
  currentPeriod: Period | null;
}

export const EmployeeModule = ({ currentPeriod }: EmployeeModuleProps) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [activeTab, setActiveTab] = useState("employees");
  const [showForm, setShowForm] = useState<'employee' | 'attendance' | 'leave' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [employeeForm, setEmployeeForm] = useState({
    name: '',
    position: '',
    department: '',
    email: '',
    phone: '',
    hireDate: new Date().toISOString().split('T')[0],
    salary: '',
    status: 'active' as Employee['status']
  });

  const [attendanceForm, setAttendanceForm] = useState({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    clockIn: '',
    clockOut: '',
    status: 'present' as AttendanceRecord['status'],
    notes: ''
  });

  const [leaveForm, setLeaveForm] = useState({
    employeeId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    type: 'vacation' as LeaveRecord['type'],
    status: 'pending' as LeaveRecord['status'],
    reason: '',
    approvedBy: ''
  });

  // Load data for current period
  useEffect(() => {
    if (currentPeriod) {
      const savedEmployees = localStorage.getItem(`employees_${currentPeriod.id}`);
      const savedAttendance = localStorage.getItem(`attendance_${currentPeriod.id}`);
      const savedLeaves = localStorage.getItem(`leaves_${currentPeriod.id}`);
      
      if (savedEmployees) setEmployees(JSON.parse(savedEmployees));
      if (savedAttendance) setAttendance(JSON.parse(savedAttendance));
      if (savedLeaves) setLeaves(JSON.parse(savedLeaves));
    }
  }, [currentPeriod]);

  // Save data when it changes
  useEffect(() => {
    if (currentPeriod) {
      if (employees.length > 0) localStorage.setItem(`employees_${currentPeriod.id}`, JSON.stringify(employees));
      if (attendance.length > 0) localStorage.setItem(`attendance_${currentPeriod.id}`, JSON.stringify(attendance));
      if (leaves.length > 0) localStorage.setItem(`leaves_${currentPeriod.id}`, JSON.stringify(leaves));
    }
  }, [employees, attendance, leaves, currentPeriod]);

  const resetForms = () => {
    setEmployeeForm({
      name: '',
      position: '',
      department: '',
      email: '',
      phone: '',
      hireDate: new Date().toISOString().split('T')[0],
      salary: '',
      status: 'active'
    });
    setAttendanceForm({
      employeeId: '',
      date: new Date().toISOString().split('T')[0],
      clockIn: '',
      clockOut: '',
      status: 'present',
      notes: ''
    });
    setLeaveForm({
      employeeId: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      type: 'vacation',
      status: 'pending',
      reason: '',
      approvedBy: ''
    });
    setEditingId(null);
    setShowForm(null);
  };

  const handleEmployeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPeriod || !employeeForm.name || !employeeForm.email) return;

    const employee: Employee = {
      id: editingId || Date.now().toString(),
      name: employeeForm.name,
      position: employeeForm.position,
      department: employeeForm.department,
      email: employeeForm.email,
      phone: employeeForm.phone || undefined,
      hireDate: employeeForm.hireDate,
      salary: employeeForm.salary ? parseFloat(employeeForm.salary) : undefined,
      status: employeeForm.status,
      periodId: currentPeriod.id,
      createdAt: editingId ? employees.find(e => e.id === editingId)?.createdAt || new Date().toISOString() : new Date().toISOString()
    };

    if (editingId) {
      setEmployees(prev => prev.map(e => e.id === editingId ? employee : e));
    } else {
      setEmployees(prev => [...prev, employee]);
    }

    resetForms();
  };

  const handleAttendanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPeriod || !attendanceForm.employeeId) return;

    const record: AttendanceRecord = {
      id: editingId || Date.now().toString(),
      employeeId: attendanceForm.employeeId,
      date: attendanceForm.date,
      clockIn: attendanceForm.clockIn || undefined,
      clockOut: attendanceForm.clockOut || undefined,
      status: attendanceForm.status,
      notes: attendanceForm.notes || undefined,
      periodId: currentPeriod.id,
      createdAt: editingId ? attendance.find(a => a.id === editingId)?.createdAt || new Date().toISOString() : new Date().toISOString()
    };

    if (editingId) {
      setAttendance(prev => prev.map(a => a.id === editingId ? record : a));
    } else {
      setAttendance(prev => [...prev, record]);
    }

    resetForms();
  };

  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPeriod || !leaveForm.employeeId || !leaveForm.reason) return;

    const leave: LeaveRecord = {
      id: editingId || Date.now().toString(),
      employeeId: leaveForm.employeeId,
      startDate: leaveForm.startDate,
      endDate: leaveForm.endDate,
      type: leaveForm.type,
      status: leaveForm.status,
      reason: leaveForm.reason,
      approvedBy: leaveForm.approvedBy || undefined,
      periodId: currentPeriod.id,
      createdAt: editingId ? leaves.find(l => l.id === editingId)?.createdAt || new Date().toISOString() : new Date().toISOString()
    };

    if (editingId) {
      setLeaves(prev => prev.map(l => l.id === editingId ? leave : l));
    } else {
      setLeaves(prev => [...prev, leave]);
    }

    resetForms();
  };

  const getEmployeeName = (employeeId: string) => {
    return employees.find(e => e.id === employeeId)?.name || 'Unknown Employee';
  };

  const getAttendanceStats = () => {
    const totalDays = attendance.length;
    const presentDays = attendance.filter(a => a.status === 'present').length;
    const lateDays = attendance.filter(a => a.status === 'late').length;
    const absentDays = attendance.filter(a => a.status === 'absent').length;
    
    return { totalDays, presentDays, lateDays, absentDays };
  };

  const stats = getAttendanceStats();

  if (!currentPeriod) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No active period. Please create a period to start managing employees.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Employee Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 opacity-80" />
              <div>
                <p className="text-sm opacity-90">Total Employees</p>
                <p className="text-2xl font-bold">{employees.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 opacity-80" />
              <div>
                <p className="text-sm opacity-90">Present Today</p>
                <p className="text-2xl font-bold">{stats.presentDays}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 opacity-80" />
              <div>
                <p className="text-sm opacity-90">Late Arrivals</p>
                <p className="text-2xl font-bold">{stats.lateDays}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <XCircle className="h-8 w-8 opacity-80" />
              <div>
                <p className="text-sm opacity-90">Pending Leaves</p>
                <p className="text-2xl font-bold">{leaves.filter(l => l.status === 'pending').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Employee Management - {currentPeriod.name}
            </CardTitle>
            <div className="flex gap-2">
              <Button onClick={() => setShowForm('employee')} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Employee
              </Button>
              <Button onClick={() => setShowForm('attendance')} variant="outline" className="gap-2">
                <Clock className="h-4 w-4" />
                Mark Attendance
              </Button>
              <Button onClick={() => setShowForm('leave')} variant="outline" className="gap-2">
                <Coffee className="h-4 w-4" />
                Request Leave
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Forms */}
          {showForm === 'employee' && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Add New Employee</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleEmployeeSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={employeeForm.name}
                        onChange={(e) => setEmployeeForm(prev => ({...prev, name: e.target.value}))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={employeeForm.email}
                        onChange={(e) => setEmployeeForm(prev => ({...prev, email: e.target.value}))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="position">Position</Label>
                      <Input
                        id="position"
                        value={employeeForm.position}
                        onChange={(e) => setEmployeeForm(prev => ({...prev, position: e.target.value}))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="department">Department</Label>
                      <Select 
                        value={employeeForm.department} 
                        onValueChange={(value) => setEmployeeForm(prev => ({...prev, department: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hr">Human Resources</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="it">Information Technology</SelectItem>
                          <SelectItem value="sales">Sales</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="operations">Operations</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={employeeForm.phone}
                        onChange={(e) => setEmployeeForm(prev => ({...prev, phone: e.target.value}))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="hireDate">Hire Date</Label>
                      <Input
                        id="hireDate"
                        type="date"
                        value={employeeForm.hireDate}
                        onChange={(e) => setEmployeeForm(prev => ({...prev, hireDate: e.target.value}))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="salary">Salary ($)</Label>
                      <Input
                        id="salary"
                        type="number"
                        value={employeeForm.salary}
                        onChange={(e) => setEmployeeForm(prev => ({...prev, salary: e.target.value}))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select 
                        value={employeeForm.status} 
                        onValueChange={(value) => setEmployeeForm(prev => ({...prev, status: value as Employee['status']}))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="terminated">Terminated</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit">Add Employee</Button>
                    <Button type="button" variant="outline" onClick={resetForms}>Cancel</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {showForm === 'attendance' && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Mark Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAttendanceSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="employeeId">Employee</Label>
                      <Select 
                        value={attendanceForm.employeeId} 
                        onValueChange={(value) => setAttendanceForm(prev => ({...prev, employeeId: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select employee" />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map(emp => (
                            <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={attendanceForm.date}
                        onChange={(e) => setAttendanceForm(prev => ({...prev, date: e.target.value}))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="clockIn">Clock In</Label>
                      <Input
                        id="clockIn"
                        type="time"
                        value={attendanceForm.clockIn}
                        onChange={(e) => setAttendanceForm(prev => ({...prev, clockIn: e.target.value}))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="clockOut">Clock Out</Label>
                      <Input
                        id="clockOut"
                        type="time"
                        value={attendanceForm.clockOut}
                        onChange={(e) => setAttendanceForm(prev => ({...prev, clockOut: e.target.value}))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select 
                        value={attendanceForm.status} 
                        onValueChange={(value) => setAttendanceForm(prev => ({...prev, status: value as AttendanceRecord['status']}))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="present">Present</SelectItem>
                          <SelectItem value="absent">Absent</SelectItem>
                          <SelectItem value="late">Late</SelectItem>
                          <SelectItem value="half_day">Half Day</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="notes">Notes</Label>
                      <Input
                        id="notes"
                        value={attendanceForm.notes}
                        onChange={(e) => setAttendanceForm(prev => ({...prev, notes: e.target.value}))}
                        placeholder="Optional notes"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit">Mark Attendance</Button>
                    <Button type="button" variant="outline" onClick={resetForms}>Cancel</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {showForm === 'leave' && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Request Leave</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLeaveSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="employeeId">Employee</Label>
                      <Select 
                        value={leaveForm.employeeId} 
                        onValueChange={(value) => setLeaveForm(prev => ({...prev, employeeId: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select employee" />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map(emp => (
                            <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="type">Leave Type</Label>
                      <Select 
                        value={leaveForm.type} 
                        onValueChange={(value) => setLeaveForm(prev => ({...prev, type: value as LeaveRecord['type']}))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vacation">Vacation</SelectItem>
                          <SelectItem value="sick">Sick Leave</SelectItem>
                          <SelectItem value="personal">Personal</SelectItem>
                          <SelectItem value="maternity">Maternity</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={leaveForm.startDate}
                        onChange={(e) => setLeaveForm(prev => ({...prev, startDate: e.target.value}))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={leaveForm.endDate}
                        onChange={(e) => setLeaveForm(prev => ({...prev, endDate: e.target.value}))}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="reason">Reason</Label>
                    <Textarea
                      id="reason"
                      value={leaveForm.reason}
                      onChange={(e) => setLeaveForm(prev => ({...prev, reason: e.target.value}))}
                      placeholder="Enter reason for leave"
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit">Submit Leave Request</Button>
                    <Button type="button" variant="outline" onClick={resetForms}>Cancel</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Data Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="employees">Employees</TabsTrigger>
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
              <TabsTrigger value="leaves">Leave Records</TabsTrigger>
            </TabsList>

            <TabsContent value="employees" className="space-y-4">
              {employees.length === 0 ? (
                <div className="text-center py-8">
                  <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No employees added yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {employees.map((employee) => (
                    <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium">{employee.name}</h4>
                          <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                            {employee.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{employee.position}</span>
                          <span>{employee.department}</span>
                          <span>{employee.email}</span>
                          <span>Hired: {employee.hireDate}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {employee.salary && (
                          <span className="font-semibold">${employee.salary.toLocaleString()}</span>
                        )}
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

            <TabsContent value="attendance" className="space-y-4">
              {attendance.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No attendance records yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {attendance.map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium">{getEmployeeName(record.employeeId)}</h4>
                          <Badge variant={
                            record.status === 'present' ? 'default' :
                            record.status === 'late' ? 'secondary' :
                            record.status === 'absent' ? 'destructive' : 'outline'
                          }>
                            {record.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{record.date}</span>
                          {record.clockIn && <span>In: {record.clockIn}</span>}
                          {record.clockOut && <span>Out: {record.clockOut}</span>}
                          {record.notes && <span>Notes: {record.notes}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="leaves" className="space-y-4">
              {leaves.length === 0 ? (
                <div className="text-center py-8">
                  <Coffee className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No leave records yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {leaves.map((leave) => (
                    <div key={leave.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium">{getEmployeeName(leave.employeeId)}</h4>
                          <Badge variant={
                            leave.status === 'approved' ? 'default' :
                            leave.status === 'pending' ? 'secondary' : 'destructive'
                          }>
                            {leave.status}
                          </Badge>
                          <Badge variant="outline">{leave.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{leave.reason}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{leave.startDate} to {leave.endDate}</span>
                          {leave.approvedBy && <span>Approved by: {leave.approvedBy}</span>}
                        </div>
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