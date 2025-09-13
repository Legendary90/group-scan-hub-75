# InviX - System Overview & Architecture

## 🏗️ **System Architecture**

InviX is a comprehensive inventory and accounting management system built with a modern tech stack designed for scalability, security, and multi-tenant operation.

### **Technology Stack**
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **UI Framework**: Tailwind CSS + shadcn/ui
- **State Management**: React Context + TanStack Query
- **Authentication**: Custom multi-client + Admin system

## 🔐 **Authentication System**

### **Multi-Client Architecture**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client A      │    │   Client B      │    │   Client C      │
│  (Company 1)    │    │  (Company 2)    │    │  (Company 3)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
              ┌─────────────────────────────────────┐
              │        Supabase Database            │
              │     Row Level Security (RLS)        │
              │    Data Isolation Per Client        │
              └─────────────────────────────────────┘
                                 │
              ┌─────────────────────────────────────┐
              │         Admin Panel                 │
              │    /secure-admin endpoint           │
              │   Username: admin                   │
              │   Password: invixop32#*@            │
              └─────────────────────────────────────┘
```

### **Access Control**
- **Client Access**: Company-based login with data isolation
- **Admin Access**: Secure admin panel at `/secure-admin`
- **Session Management**: Secure token-based authentication
- **Subscription Control**: Automatic access management with expiration

## 📊 **Database Schema Overview**

### **Core Tables Structure**

```sql
-- Client Management
clients
├── id (UUID)
├── client_id (TEXT - Unique identifier)
├── username (TEXT - Company name as username)
├── company_name (TEXT)
├── subscription_status (ACTIVE/INACTIVE/SUSPENDED)
├── subscription_end (DATE)
└── access_status (BOOLEAN)

-- Admin System  
admin_users
├── id (UUID)
├── username (TEXT)
├── password_hash (TEXT)
├── is_active (BOOLEAN)
└── last_login (TIMESTAMPTZ)

-- Financial Management
sales_entries
├── client_id (Foreign Key)
├── description (TEXT)
├── amount (DECIMAL)
├── date (DATE)
├── payment_status (paid/pending/overdue)
└── category (TEXT)

purchase_entries
├── client_id (Foreign Key)
├── month_number (1-12)
├── year (INTEGER)
├── description (TEXT)
├── amount (DECIMAL)
└── date (DATE)

monthly_expenses
├── client_id (Foreign Key)
├── month_number (1-12)
├── year (INTEGER)
├── description (TEXT)
├── amount (DECIMAL)
└── category (TEXT)

expense_entries
├── client_id (Foreign Key)
├── description (TEXT)
├── amount (DECIMAL)
├── date (DATE)
└── category (TEXT)

profit_loss (Auto-calculated)
├── client_id (Foreign Key)
├── month_number (1-12)
├── year (INTEGER)
├── total_sales (DECIMAL)
├── total_expenses (DECIMAL)
└── net_profit_loss (DECIMAL)

-- Inventory Management
inventory_items
├── client_id (Foreign Key)
├── name (TEXT)
├── current_stock (INTEGER)
└── updated_at (TIMESTAMPTZ)

-- Document Management
documents
├── client_id (Foreign Key)
├── type (invoice/challan/balance_sheet)
├── document_data (JSONB)
└── created_at (TIMESTAMPTZ)

challans
├── client_id (Foreign Key)
├── challan_number (TEXT)
├── sender_name (TEXT)
├── receiver_name (TEXT)
├── goods_description (TEXT)
├── transport_details (TEXT)
└── created_at (TIMESTAMPTZ)

-- Project Management
groups
├── client_id (Foreign Key)
├── name (TEXT)
├── status (active/closed)
└── created_at (TIMESTAMPTZ)

group_items
├── group_id (Foreign Key)
├── client_id (Foreign Key)
├── container_name (TEXT)
├── quantity (INTEGER)
├── quota (INTEGER)
├── scanned_count (INTEGER)
└── qr_code (TEXT)
```

## 🔒 **Security Implementation**

### **Row Level Security (RLS)**
```sql
-- Every table has RLS enabled
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_entries ENABLE ROW LEVEL SECURITY;
-- ... all tables

-- Client data isolation policy
CREATE POLICY "Clients can view their own data" ON public.sales_entries
FOR ALL USING (client_id = current_setting('app.current_client_id', true));

-- Admin access policy
CREATE POLICY "Admin can access all clients" ON public.clients
FOR ALL USING (true);
```

### **Authentication Functions**
```sql
-- Client authentication
authenticate_client(username, password) → Returns client data

-- Admin authentication  
authenticate_admin_user(username, password) → Returns session token

-- Session validation
validate_admin_session(token) → Returns validation status
```

## 📈 **Business Logic & Features**

### **Financial Management Flow**
```
Sales Entry → Automatic Profit/Loss Calculation ← Expense Entry
     ↓                       ↓                           ↑
Balance Sheet ← Monthly Reports → Tax Calculations
     ↓                       ↓                           ↑
Document Generation → Invoice/Challan Creation
```

### **Inventory Management**
- Real-time stock tracking
- Multi-client inventory isolation
- Scanner integration framework (ESP32 ready)
- QR code generation system

### **Document Generation System**
- **Invoices**: Professional formatting with tax calculations
- **Challans**: Transport and goods documentation
- **Balance Sheets**: Auto-generated from financial data
- **Export Options**: Print-ready PDF generation

## 🔄 **Data Flow Architecture**

### **Client Session Flow**
```
1. Client Registration/Login
2. Session Creation + Client ID Assignment
3. RLS Policy Activation (client_id context)
4. Data Access (Filtered by RLS)
5. Business Operations (CRUD with isolation)
6. Session Management (Auto-refresh/expire)
```

### **Admin Session Flow**
```
1. Admin Login (/secure-admin)
2. Credential Validation (admin_users table)
3. Session Token Generation
4. Full System Access (All clients)
5. Client Management Operations
6. System Administration
```

## 🎯 **Module Breakdown**

### **Dashboard Module**
- Overview statistics
- Quick access navigation
- System status indicators
- Client information display

### **Accounts Module**
- Sales tracking and management
- Purchase recording (monthly system)
- Expense management (monthly + general)
- Profit/Loss calculations
- Tax management
- Banking and cash flow

### **Inventory Module**
- Product management
- Stock level tracking
- Search and filtering
- Stock movement history

### **Documents Module**
- Invoice generation
- Challan creation
- Balance sheet auto-generation
- Export functionality

### **Groups Module (Scanner Ready)**
- Project/group creation
- QR code generation
- ESP32 scanner integration framework
- Real-time tracking system

### **History Module**
- Completed project archives
- Export functionality
- Statistical analysis
- Historical reporting

### **Admin Panel**
- Client account management
- Subscription control
- System monitoring
- Access management

## 🚀 **Scalability & Performance**

### **Database Optimization**
- Indexed foreign keys
- Optimized RLS policies
- Efficient trigger functions
- Automatic cleanup procedures

### **Frontend Performance**
- Code splitting with React.lazy
- Optimistic UI updates
- Efficient state management
- Cached query results

### **Security Measures**
- Input sanitization
- SQL injection prevention
- Session timeout management
- Audit trail logging

## 🔧 **Integration Points**

### **Scanner Integration (ESP32)**
- QR code scanning endpoint
- Real-time data updates
- Inventory synchronization
- Group management integration

### **Document Export**
- PDF generation system
- Excel/CSV export
- Print formatting
- Email integration ready

### **Financial Integrations**
- Tax calculation system
- Banking data import ready
- Accounting software export
- Financial reporting APIs

## 📋 **System Requirements**

### **Production Environment**
- **Database**: PostgreSQL 14+ (Supabase)
- **Memory**: 2GB RAM minimum
- **Storage**: 10GB minimum
- **Network**: HTTPS required

### **Development Environment**
- **Node.js**: v18+
- **NPM/Yarn**: Latest version
- **Git**: Version control
- **Browser**: Modern browser with ES6 support

---

This system architecture provides a robust, scalable, and secure foundation for multi-client inventory and accounting management with room for future enhancements and integrations.