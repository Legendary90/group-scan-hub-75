-- ============================================
-- INVENTORY MANAGEMENT SYSTEM DATABASE SCHEMA
-- ============================================

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.settings.jwt_secret" TO 'your-jwt-secret-here';

-- ============================================
-- 1. AUTHENTICATION & CLIENT MANAGEMENT
-- ============================================

-- Clients table with authentication
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  company_name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  subscription_status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (subscription_status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
  subscription_start DATE NOT NULL DEFAULT CURRENT_DATE,
  subscription_end DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '1 month'),
  access_status BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- ============================================
-- 2. ACCOUNTS MANAGEMENT
-- ============================================

-- Sales entries
CREATE TABLE IF NOT EXISTS public.sales_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL REFERENCES public.clients(client_id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT,
  payment_status TEXT DEFAULT 'paid' CHECK (payment_status IN ('paid', 'pending', 'overdue')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Monthly purchases (by month number 1-12)
CREATE TABLE IF NOT EXISTS public.purchase_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL REFERENCES public.clients(client_id) ON DELETE CASCADE,
  month_number INTEGER NOT NULL CHECK (month_number >= 1 AND month_number <= 12),
  year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  description TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Monthly expenses (by month number 1-12)
CREATE TABLE IF NOT EXISTS public.monthly_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL REFERENCES public.clients(client_id) ON DELETE CASCADE,
  month_number INTEGER NOT NULL CHECK (month_number >= 1 AND month_number <= 12),
  year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  description TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- General expense entries
CREATE TABLE IF NOT EXISTS public.expense_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL REFERENCES public.clients(client_id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Profit/Loss tracking
CREATE TABLE IF NOT EXISTS public.profit_loss (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL REFERENCES public.clients(client_id) ON DELETE CASCADE,
  month_number INTEGER NOT NULL CHECK (month_number >= 1 AND month_number <= 12),
  year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  total_sales DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_expenses DECIMAL(15,2) NOT NULL DEFAULT 0,
  net_profit_loss DECIMAL(15,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(client_id, month_number, year)
);

-- ============================================
-- 3. INVENTORY MANAGEMENT
-- ============================================

-- Inventory items (without low stock alerts)
CREATE TABLE IF NOT EXISTS public.inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL REFERENCES public.clients(client_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  current_stock INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 4. GROUPS/PROJECTS MANAGEMENT
-- ============================================

-- Groups (projects)
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL REFERENCES public.clients(client_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

-- Group items
CREATE TABLE IF NOT EXISTS public.group_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  client_id TEXT NOT NULL REFERENCES public.clients(client_id) ON DELETE CASCADE,
  container_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  quota INTEGER,
  scanned_count INTEGER NOT NULL DEFAULT 0,
  tag_id TEXT UNIQUE,
  qr_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 5. DOCUMENTS & HISTORY
-- ============================================

-- Documents (invoices, challans, balance sheets)
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL REFERENCES public.clients(client_id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('invoice', 'challan', 'balance_sheet')),
  document_data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Challan specific fields
CREATE TABLE IF NOT EXISTS public.challans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL REFERENCES public.clients(client_id) ON DELETE CASCADE,
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

-- ============================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
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

-- RLS Policies for clients (admin can access all, clients can access their own)
CREATE POLICY "Admin can access all clients" ON public.clients
FOR ALL USING (true);

CREATE POLICY "Clients can view their own data" ON public.sales_entries
FOR ALL USING (client_id = current_setting('app.current_client_id', true));

CREATE POLICY "Clients can view their own data" ON public.purchase_entries
FOR ALL USING (client_id = current_setting('app.current_client_id', true));

CREATE POLICY "Clients can view their own data" ON public.monthly_expenses
FOR ALL USING (client_id = current_setting('app.current_client_id', true));

CREATE POLICY "Clients can view their own data" ON public.expense_entries
FOR ALL USING (client_id = current_setting('app.current_client_id', true));

CREATE POLICY "Clients can view their own data" ON public.profit_loss
FOR ALL USING (client_id = current_setting('app.current_client_id', true));

CREATE POLICY "Clients can view their own data" ON public.inventory_items
FOR ALL USING (client_id = current_setting('app.current_client_id', true));

CREATE POLICY "Clients can view their own data" ON public.groups
FOR ALL USING (client_id = current_setting('app.current_client_id', true));

CREATE POLICY "Clients can view their own data" ON public.group_items
FOR ALL USING (client_id = current_setting('app.current_client_id', true));

CREATE POLICY "Clients can view their own data" ON public.documents
FOR ALL USING (client_id = current_setting('app.current_client_id', true));

CREATE POLICY "Clients can view their own data" ON public.challans
FOR ALL USING (client_id = current_setting('app.current_client_id', true));

-- ============================================
-- 7. FUNCTIONS & TRIGGERS
-- ============================================

-- Function to auto-update profit/loss
CREATE OR REPLACE FUNCTION update_profit_loss()
RETURNS TRIGGER AS $$
DECLARE
  client_id_val TEXT;
  month_num INTEGER;
  year_num INTEGER;
  total_sales_val DECIMAL(15,2);
  total_expenses_val DECIMAL(15,2);
BEGIN
  -- Get client_id from the record
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

  -- Upsert profit/loss record
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

-- Create triggers
DROP TRIGGER IF EXISTS update_profit_loss_on_sales ON public.sales_entries;
CREATE TRIGGER update_profit_loss_on_sales
  AFTER INSERT OR UPDATE OR DELETE ON public.sales_entries
  FOR EACH ROW EXECUTE FUNCTION update_profit_loss();

DROP TRIGGER IF EXISTS update_profit_loss_on_monthly_expenses ON public.monthly_expenses;
CREATE TRIGGER update_profit_loss_on_monthly_expenses
  AFTER INSERT OR UPDATE OR DELETE ON public.monthly_expenses
  FOR EACH ROW EXECUTE FUNCTION update_profit_loss();

DROP TRIGGER IF EXISTS update_profit_loss_on_expenses ON public.expense_entries;
CREATE TRIGGER update_profit_loss_on_expenses
  AFTER INSERT OR UPDATE OR DELETE ON public.expense_entries
  FOR EACH ROW EXECUTE FUNCTION update_profit_loss();

-- Function to auto-expire subscriptions
CREATE OR REPLACE FUNCTION auto_expire_subscriptions()
RETURNS void AS $$
BEGIN
  UPDATE public.clients 
  SET subscription_status = 'INACTIVE'
  WHERE subscription_end < CURRENT_DATE 
  AND subscription_status = 'ACTIVE';
END;
$$ LANGUAGE plpgsql;

-- Function to generate client ID
CREATE OR REPLACE FUNCTION generate_client_id()
RETURNS TEXT AS $$
DECLARE
  new_id TEXT;
BEGIN
  new_id := 'CLI_' || LPAD(EXTRACT(EPOCH FROM NOW())::TEXT, 10, '0');
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 8. INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_clients_client_id ON public.clients(client_id);
CREATE INDEX IF NOT EXISTS idx_clients_username ON public.clients(username);
CREATE INDEX IF NOT EXISTS idx_clients_subscription_end ON public.clients(subscription_end);

CREATE INDEX IF NOT EXISTS idx_sales_client_date ON public.sales_entries(client_id, date);
CREATE INDEX IF NOT EXISTS idx_purchases_client_month ON public.purchase_entries(client_id, month_number, year);
CREATE INDEX IF NOT EXISTS idx_monthly_expenses_client_month ON public.monthly_expenses(client_id, month_number, year);
CREATE INDEX IF NOT EXISTS idx_expenses_client_date ON public.expense_entries(client_id, date);

CREATE INDEX IF NOT EXISTS idx_groups_client_status ON public.groups(client_id, status);
CREATE INDEX IF NOT EXISTS idx_inventory_client ON public.inventory_items(client_id);

-- ============================================
-- 9. SAMPLE DATA (OPTIONAL)
-- ============================================

-- Insert sample admin user (password should be hashed in production)
INSERT INTO public.clients (client_id, username, password_hash, company_name, subscription_status, subscription_end)
VALUES ('CLI_ADMIN', 'admin', '$2b$10$sample_hash_here', 'Admin Account', 'ACTIVE', '2099-12-31')
ON CONFLICT (client_id) DO NOTHING;

-- ============================================
-- SETUP COMPLETE
-- ============================================

-- Run this command to set up periodic subscription checks:
-- SELECT cron.schedule('expire-subscriptions', '0 0 * * *', 'SELECT auto_expire_subscriptions();');