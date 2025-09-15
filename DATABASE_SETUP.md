# InviX - Database Setup & Configuration Guide

## 🗄️ **Database Architecture Overview**

InviX uses Supabase (PostgreSQL) with a comprehensive schema designed for multi-client inventory and accounting management. The database features Row Level Security (RLS) for data isolation, automated calculations via triggers, and secure admin authentication.

## 📋 **Prerequisites**

- Supabase account (free tier available)
- Basic understanding of SQL
- Access to Supabase dashboard

## 🚀 **Quick Setup Process**

### **Step 1: Create Supabase Project**
1. Visit [https://supabase.com](https://supabase.com)
2. Sign up or login to your account
3. Click **"New Project"**
4. Fill in project details:
   - **Name**: `invix-inventory-system`
   - **Database Password**: Generate a strong password
   - **Region**: Select closest to your users
5. Wait 2-3 minutes for provisioning

### **Step 2: Execute Database Schema**
1. Navigate to **SQL Editor** in your Supabase dashboard
2. Create a new query
3. Copy the complete schema from `database_schema.sql`
4. Click **"Run"** to execute
5. Wait for completion (may take 1-2 minutes)

### **Step 3: Verify Installation**
Check that all components are properly installed:

```sql
-- Verify tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check admin user was created
SELECT username, is_active, created_at 
FROM admin_users;

-- Verify RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true;
```

## 🏗️ **Detailed Schema Structure**

### **Core Tables**

#### **1. Client Management**
```sql
-- Main client accounts table
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL UNIQUE,           -- Business identifier
  username TEXT NOT NULL UNIQUE,            -- Login username
  password_hash TEXT NOT NULL,              -- Hashed password
  company_name TEXT NOT NULL,               -- Company name
  contact_person TEXT,                      -- Contact person
  email TEXT,                               -- Email address
  phone TEXT,                               -- Phone number
  subscription_status TEXT NOT NULL DEFAULT 'ACTIVE',  -- ACTIVE/INACTIVE/SUSPENDED
  subscription_start DATE NOT NULL DEFAULT CURRENT_DATE,
  subscription_end DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '1 month'),
  access_status BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login TIMESTAMPTZ
);
```

#### **2. Admin Authentication**
```sql
-- Secure admin users table
CREATE TABLE public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- Default admin account
INSERT INTO public.admin_users (username, password_hash, is_active)
VALUES ('admin', 'invixop32#*@', true);
```

#### **3. Financial Management Tables**

**Sales Tracking**
```sql
CREATE TABLE public.sales_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL REFERENCES public.clients(client_id),
  description TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT,
  payment_status TEXT DEFAULT 'paid' CHECK (payment_status IN ('paid', 'pending', 'overdue')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Purchase Management (Monthly System)**
```sql
CREATE TABLE public.purchase_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL REFERENCES public.clients(client_id),
  month_number INTEGER NOT NULL CHECK (month_number >= 1 AND month_number <= 12),
  year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  description TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Expense Tracking**
```sql
-- Monthly expenses
CREATE TABLE public.monthly_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL REFERENCES public.clients(client_id),
  month_number INTEGER NOT NULL CHECK (month_number >= 1 AND month_number <= 12),
  year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  description TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- General expenses
CREATE TABLE public.expense_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL REFERENCES public.clients(client_id),
  description TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Profit/Loss Calculations (Auto-Generated)**
```sql
CREATE TABLE public.profit_loss (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL REFERENCES public.clients(client_id),
  month_number INTEGER NOT NULL CHECK (month_number >= 1 AND month_number <= 12),
  year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  total_sales DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_expenses DECIMAL(15,2) NOT NULL DEFAULT 0,
  net_profit_loss DECIMAL(15,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(client_id, month_number, year)
);
```

#### **4. Inventory Management**
```sql
CREATE TABLE public.inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL REFERENCES public.clients(client_id),
  name TEXT NOT NULL,
  current_stock INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### **5. Document Management**
```sql
-- Generic documents storage
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL REFERENCES public.clients(client_id),
  type TEXT NOT NULL CHECK (type IN ('invoice', 'challan', 'balance_sheet')),
  document_data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Challan-specific data
CREATE TABLE public.challans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL REFERENCES public.clients(client_id),
  challan_number TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  sender_name TEXT NOT NULL,
  sender_address TEXT,
  receiver_name TEXT NOT NULL,
  receiver_address TEXT,
  goods_description TEXT NOT NULL,
  batch_number TEXT,
  quantity TEXT NOT NULL,
  weight TEXT,
  units TEXT,
  truck_number TEXT,
  driver_name TEXT,
  courier_service TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### **6. Project/Group Management**
```sql
-- Groups (projects)
CREATE TABLE public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL REFERENCES public.clients(client_id),
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

-- Items within groups
CREATE TABLE public.group_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id),
  client_id TEXT NOT NULL REFERENCES public.clients(client_id),
  container_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  quota INTEGER,
  scanned_count INTEGER NOT NULL DEFAULT 0,
  tag_id TEXT UNIQUE,
  qr_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## 🔒 **Security Configuration**

### **Row Level Security (RLS)**

All tables have RLS enabled for data isolation:

```sql
-- Enable RLS on all client-related tables
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profit_loss ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
```

### **Security Policies**

**Client Data Isolation**
```sql
-- Clients can only access their own data
CREATE POLICY "Clients can view their own data" ON public.sales_entries
FOR ALL USING (client_id = current_setting('app.current_client_id', true));

CREATE POLICY "Clients can view their own data" ON public.purchase_entries
FOR ALL USING (client_id = current_setting('app.current_client_id', true));

-- Similar policies for all client tables...
```

**Admin Access**
```sql
-- Admins have full access to all client data
CREATE POLICY "Admin can access all clients" ON public.clients
FOR ALL USING (true);

-- Admin users can manage admin accounts
CREATE POLICY "Admin users can manage admin accounts" ON public.admin_users
FOR ALL USING (true);
```

## ⚙️ **Database Functions & Triggers**

### **Automatic Profit/Loss Calculation**
```sql
CREATE OR REPLACE FUNCTION update_profit_loss()
RETURNS TRIGGER AS $$
DECLARE
  client_id_val TEXT;
  month_num INTEGER;
  year_num INTEGER;
  total_sales_val DECIMAL(15,2);
  total_expenses_val DECIMAL(15,2);
BEGIN
  -- Extract client_id and date info from the changed record
  IF TG_TABLE_NAME = 'sales_entries' THEN
    client_id_val := COALESCE(NEW.client_id, OLD.client_id);
    month_num := EXTRACT(MONTH FROM COALESCE(NEW.date, OLD.date));
    year_num := EXTRACT(YEAR FROM COALESCE(NEW.date, OLD.date));
  ELSE
    client_id_val := COALESCE(NEW.client_id, OLD.client_id);
    month_num := COALESCE(NEW.month_number, OLD.month_number);
    year_num := COALESCE(NEW.year, OLD.year);
  END IF;

  -- Calculate total sales for the month
  SELECT COALESCE(SUM(amount), 0) INTO total_sales_val
  FROM public.sales_entries 
  WHERE client_id = client_id_val 
  AND EXTRACT(MONTH FROM date) = month_num 
  AND EXTRACT(YEAR FROM date) = year_num;

  -- Calculate total expenses for the month
  SELECT COALESCE(SUM(me.amount), 0) + COALESCE(SUM(ee.amount), 0) INTO total_expenses_val
  FROM public.monthly_expenses me
  FULL OUTER JOIN public.expense_entries ee ON ee.client_id = me.client_id 
    AND EXTRACT(MONTH FROM ee.date) = me.month_number 
    AND EXTRACT(YEAR FROM ee.date) = me.year
  WHERE COALESCE(me.client_id, ee.client_id) = client_id_val 
  AND COALESCE(me.month_number, EXTRACT(MONTH FROM ee.date)) = month_num 
  AND COALESCE(me.year, EXTRACT(YEAR FROM ee.date)) = year_num;

  -- Update or insert profit/loss record
  INSERT INTO public.profit_loss (client_id, month_number, year, total_sales, total_expenses, net_profit_loss)
  VALUES (client_id_val, month_num, year_num, total_sales_val, total_expenses_val, total_sales_val - total_expenses_val)
  ON CONFLICT (client_id, month_number, year) 
  DO UPDATE SET 
    total_sales = EXCLUDED.total_sales,
    total_expenses = EXCLUDED.total_expenses,
    net_profit_loss = EXCLUDED.net_profit_loss,
    updated_at = NOW();

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
```

### **Trigger Setup**
```sql
-- Create triggers for automatic profit/loss updates
CREATE TRIGGER update_profit_loss_on_sales
  AFTER INSERT OR UPDATE OR DELETE ON public.sales_entries
  FOR EACH ROW EXECUTE FUNCTION update_profit_loss();

CREATE TRIGGER update_profit_loss_on_monthly_expenses
  AFTER INSERT OR UPDATE OR DELETE ON public.monthly_expenses
  FOR EACH ROW EXECUTE FUNCTION update_profit_loss();

CREATE TRIGGER update_profit_loss_on_expenses
  AFTER INSERT OR UPDATE OR DELETE ON public.expense_entries
  FOR EACH ROW EXECUTE FUNCTION update_profit_loss();
```

### **Admin Authentication Functions**
```sql
-- Admin user authentication
CREATE OR REPLACE FUNCTION public.authenticate_admin_user(p_username text, p_password text)
RETURNS TABLE(admin_username text, session_token text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  admin_record RECORD;
  session_token_val TEXT;
BEGIN
  -- Check if admin exists and is active
  SELECT * INTO admin_record 
  FROM public.admin_users 
  WHERE username = p_username AND is_active = true;
  
  IF admin_record.id IS NULL THEN
    RETURN;
  END IF;
  
  -- Verify password (direct comparison for specified password)
  IF admin_record.password_hash = p_password THEN
    -- Generate session token
    session_token_val := 'admin_' || extract(epoch from now()) || '_' || admin_record.id;
    
    -- Update last login
    UPDATE public.admin_users 
    SET last_login = NOW() 
    WHERE id = admin_record.id;
    
    -- Return credentials
    RETURN QUERY SELECT admin_record.username, session_token_val;
  END IF;
END;
$function$;

-- Session validation
CREATE OR REPLACE FUNCTION public.validate_admin_session(session_token text)
RETURNS TABLE(admin_username text, is_valid boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  admin_id UUID;
  admin_user TEXT;
BEGIN
  -- Extract admin ID from session token
  IF session_token LIKE 'admin_%' AND length(session_token) > 20 THEN
    admin_id := CAST(split_part(session_token, '_', 3) AS UUID);
    
    -- Get admin username
    SELECT username INTO admin_user 
    FROM public.admin_users 
    WHERE id = admin_id AND is_active = true;
    
    IF admin_user IS NOT NULL THEN
      RETURN QUERY SELECT admin_user, true;
      RETURN;
    END IF;
  END IF;
  
  RETURN QUERY SELECT NULL::text, false;
END;
$function$;
```

### **Utility Functions**
```sql
-- Auto-expire subscriptions
CREATE OR REPLACE FUNCTION auto_expire_subscriptions()
RETURNS void AS $$
BEGIN
  UPDATE public.clients 
  SET subscription_status = 'INACTIVE'
  WHERE subscription_end < CURRENT_DATE 
  AND subscription_status = 'ACTIVE';
END;
$$ LANGUAGE plpgsql;

-- Generate unique client ID
CREATE OR REPLACE FUNCTION generate_client_id()
RETURNS TEXT AS $$
DECLARE
  new_id TEXT;
BEGIN
  new_id := 'CLI_' || LPAD(EXTRACT(EPOCH FROM NOW())::TEXT, 10, '0');
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;
```

## 📊 **Performance Optimization**

### **Database Indexes**
```sql
-- Essential indexes for performance
CREATE INDEX IF NOT EXISTS idx_clients_client_id ON public.clients(client_id);
CREATE INDEX IF NOT EXISTS idx_clients_username ON public.clients(username);
CREATE INDEX IF NOT EXISTS idx_clients_subscription_end ON public.clients(subscription_end);

CREATE INDEX IF NOT EXISTS idx_sales_client_date ON public.sales_entries(client_id, date);
CREATE INDEX IF NOT EXISTS idx_purchases_client_month ON public.purchase_entries(client_id, month_number, year);
CREATE INDEX IF NOT EXISTS idx_monthly_expenses_client_month ON public.monthly_expenses(client_id, month_number, year);
CREATE INDEX IF NOT EXISTS idx_expenses_client_date ON public.expense_entries(client_id, date);

CREATE INDEX IF NOT EXISTS idx_groups_client_status ON public.groups(client_id, status);
CREATE INDEX IF NOT EXISTS idx_inventory_client ON public.inventory_items(client_id);
```

## 🔧 **Configuration & Maintenance**

### **Supabase Project Settings**

#### **Authentication Settings**
1. Go to **Authentication** → **Settings**
2. Configure:
   - **Enable email confirmations**: Disable for faster testing
   - **Email templates**: Customize as needed
   - **Password requirements**: Set minimum standards

#### **Database Settings**
1. **Connection pooling**: Enable for better performance
2. **Connection limits**: Set appropriate limits
3. **Backup schedule**: Configure daily backups

#### **API Settings**
1. **Rate limiting**: Configure appropriate limits
2. **CORS settings**: Add your domain
3. **API logging**: Enable for monitoring

### **Monitoring & Maintenance**

#### **Database Health Checks**
```sql
-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check RLS policies status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Monitor profit/loss calculations
SELECT client_id, month_number, year, net_profit_loss, updated_at
FROM profit_loss 
ORDER BY updated_at DESC 
LIMIT 10;
```

#### **Regular Maintenance Tasks**
```sql
-- Clean up old sessions (run monthly)
DELETE FROM admin_users WHERE last_login < NOW() - INTERVAL '6 months';

-- Update subscription statuses (run daily via cron)
SELECT auto_expire_subscriptions();

-- Verify data integrity
SELECT COUNT(*) FROM clients;
SELECT COUNT(*) FROM sales_entries;
SELECT COUNT(*) FROM profit_loss;
```

## 🐛 **Troubleshooting**

### **Common Issues & Solutions**

#### **RLS Policy Issues**
```sql
-- Check if RLS is properly enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Test RLS policy manually
SET app.current_client_id = 'CLI_12345';
SELECT * FROM sales_entries; -- Should only show client's data
```

#### **Admin Authentication Issues**
```sql
-- Verify admin account exists
SELECT * FROM admin_users WHERE username = 'admin';

-- Test admin authentication
SELECT * FROM authenticate_admin_user('admin', 'invixop32#*@');

-- Check session validation
SELECT * FROM validate_admin_session('admin_1234567890_uuid-here');
```

#### **Profit/Loss Calculation Issues**
```sql
-- Manually trigger profit/loss calculation
INSERT INTO sales_entries (client_id, description, amount) 
VALUES ('CLI_TEST', 'Test Sale', 100.00);

-- Check if trigger fired
SELECT * FROM profit_loss WHERE client_id = 'CLI_TEST';
```

### **Migration Issues**
If you encounter issues during schema setup:

1. **Check Supabase logs**: Go to Logs section in dashboard
2. **Verify permissions**: Ensure you have admin access
3. **Re-run schema**: Drop and recreate if necessary
4. **Contact support**: Use Supabase community or support

---

**Your database is now fully configured and ready for production use!**

**Admin Access Credentials**:
- Username: `admin`
- Password: `invixop32#*@`
- Access URL: `/secure-admin`