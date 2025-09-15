-- ============================================
-- INVIX ERP SYSTEM DATABASE SCHEMA
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
-- 5. PERIOD MANAGEMENT
-- ============================================

-- Periods (monthly or daily operational periods)
CREATE TABLE IF NOT EXISTS public.periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL REFERENCES public.clients(client_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('monthly', 'daily')),
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

-- ============================================
-- 6. FINANCIAL RECORDS MODULE
-- ============================================

-- Income receipts
CREATE TABLE IF NOT EXISTS public.income_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL REFERENCES public.clients(client_id) ON DELETE CASCADE,
  period_id UUID REFERENCES public.periods(id) ON DELETE CASCADE,
  receipt_number TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  source TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Expense receipts
CREATE TABLE IF NOT EXISTS public.expense_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL REFERENCES public.clients(client_id) ON DELETE CASCADE,
  period_id UUID REFERENCES public.periods(id) ON DELETE CASCADE,
  receipt_number TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  vendor TEXT NOT NULL,
  description TEXT,
  category TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Invoices
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL REFERENCES public.clients(client_id) ON DELETE CASCADE,
  period_id UUID REFERENCES public.periods(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
  due_date DATE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bills
CREATE TABLE IF NOT EXISTS public.bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL REFERENCES public.clients(client_id) ON DELETE CASCADE,
  period_id UUID REFERENCES public.periods(id) ON DELETE CASCADE,
  bill_number TEXT NOT NULL,
  vendor_name TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
  due_date DATE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Payroll records
CREATE TABLE IF NOT EXISTS public.payroll_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL REFERENCES public.clients(client_id) ON DELETE CASCADE,
  period_id UUID REFERENCES public.periods(id) ON DELETE CASCADE,
  employee_name TEXT NOT NULL,
  position TEXT,
  salary DECIMAL(15,2) NOT NULL,
  deductions DECIMAL(15,2) DEFAULT 0,
  bonuses DECIMAL(15,2) DEFAULT 0,
  net_pay DECIMAL(15,2) NOT NULL,
  pay_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tax documents
CREATE TABLE IF NOT EXISTS public.tax_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL REFERENCES public.clients(client_id) ON DELETE CASCADE,
  period_id UUID REFERENCES public.periods(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  tax_year INTEGER NOT NULL,
  amount DECIMAL(15,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'filed', 'approved')),
  file_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 7. LEGAL & COMPLIANCE MODULE
-- ============================================

-- Contracts and agreements
CREATE TABLE IF NOT EXISTS public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL REFERENCES public.clients(client_id) ON DELETE CASCADE,
  period_id UUID REFERENCES public.periods(id) ON DELETE CASCADE,
  contract_name TEXT NOT NULL,
  party_name TEXT NOT NULL,
  contract_type TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  value DECIMAL(15,2),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'terminated')),
  file_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Licenses and permits
CREATE TABLE IF NOT EXISTS public.licenses_permits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL REFERENCES public.clients(client_id) ON DELETE CASCADE,
  period_id UUID REFERENCES public.periods(id) ON DELETE CASCADE,
  license_name TEXT NOT NULL,
  license_number TEXT,
  issuing_authority TEXT,
  issue_date DATE NOT NULL,
  expiry_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'suspended')),
  file_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insurance documents
CREATE TABLE IF NOT EXISTS public.insurance_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL REFERENCES public.clients(client_id) ON DELETE CASCADE,
  period_id UUID REFERENCES public.periods(id) ON DELETE CASCADE,
  policy_name TEXT NOT NULL,
  policy_number TEXT,
  insurance_company TEXT,
  coverage_amount DECIMAL(15,2),
  premium DECIMAL(15,2),
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  file_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Regulatory filings
CREATE TABLE IF NOT EXISTS public.regulatory_filings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL REFERENCES public.clients(client_id) ON DELETE CASCADE,
  period_id UUID REFERENCES public.periods(id) ON DELETE CASCADE,
  filing_type TEXT NOT NULL,
  authority TEXT NOT NULL,
  filing_date DATE NOT NULL,
  due_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'approved', 'rejected')),
  file_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 8. EMPLOYEE MODULE
-- ============================================

-- Employee records
CREATE TABLE IF NOT EXISTS public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL REFERENCES public.clients(client_id) ON DELETE CASCADE,
  employee_id TEXT NOT NULL,
  name TEXT NOT NULL,
  position TEXT,
  department TEXT,
  email TEXT,
  phone TEXT,
  hire_date DATE NOT NULL,
  salary DECIMAL(15,2),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Attendance records
CREATE TABLE IF NOT EXISTS public.attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL REFERENCES public.clients(client_id) ON DELETE CASCADE,
  period_id UUID REFERENCES public.periods(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  check_in_time TIME,
  check_out_time TIME,
  hours_worked DECIMAL(5,2),
  status TEXT DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'half_day')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Leave records
CREATE TABLE IF NOT EXISTS public.leave_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL REFERENCES public.clients(client_id) ON DELETE CASCADE,
  period_id UUID REFERENCES public.periods(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  leave_type TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_count INTEGER NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 9. CUSTOMER & SALES MODULE
-- ============================================

-- Customer records
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL REFERENCES public.clients(client_id) ON DELETE CASCADE,
  customer_id TEXT NOT NULL,
  name TEXT NOT NULL,
  company TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sales invoices (enhanced)
CREATE TABLE IF NOT EXISTS public.sales_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL REFERENCES public.clients(client_id) ON DELETE CASCADE,
  period_id UUID REFERENCES public.periods(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  tax_amount DECIMAL(15,2) DEFAULT 0,
  total_amount DECIMAL(15,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  due_date DATE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Customer feedback/complaints
CREATE TABLE IF NOT EXISTS public.customer_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL REFERENCES public.clients(client_id) ON DELETE CASCADE,
  period_id UUID REFERENCES public.periods(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('feedback', 'complaint', 'suggestion')),
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  assigned_to TEXT,
  resolution TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 10. DOCUMENTS & HISTORY
-- ============================================

-- Documents (general file storage)
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL REFERENCES public.clients(client_id) ON DELETE CASCADE,
  period_id UUID REFERENCES public.periods(id) ON DELETE CASCADE,
  module TEXT NOT NULL,
  document_type TEXT NOT NULL,
  name TEXT NOT NULL,
  file_path TEXT,
  file_size INTEGER,
  mime_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profit_loss ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Financial Records
ALTER TABLE public.income_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_documents ENABLE ROW LEVEL SECURITY;

-- Legal & Compliance
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licenses_permits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regulatory_filings ENABLE ROW LEVEL SECURITY;

-- Employee Management
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_records ENABLE ROW LEVEL SECURITY;

-- Customer & Sales
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies for clients (admin can access all, clients can access their own)
CREATE POLICY "Admin can access all clients" ON public.clients
FOR ALL USING (true);

-- Core modules
CREATE POLICY "Clients can view their own data" ON public.periods
FOR ALL USING (client_id = current_setting('app.current_client_id', true));

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

-- Financial Records policies
CREATE POLICY "Clients can view their own data" ON public.income_receipts
FOR ALL USING (client_id = current_setting('app.current_client_id', true));

CREATE POLICY "Clients can view their own data" ON public.expense_receipts
FOR ALL USING (client_id = current_setting('app.current_client_id', true));

CREATE POLICY "Clients can view their own data" ON public.invoices
FOR ALL USING (client_id = current_setting('app.current_client_id', true));

CREATE POLICY "Clients can view their own data" ON public.bills
FOR ALL USING (client_id = current_setting('app.current_client_id', true));

CREATE POLICY "Clients can view their own data" ON public.payroll_records
FOR ALL USING (client_id = current_setting('app.current_client_id', true));

CREATE POLICY "Clients can view their own data" ON public.tax_documents
FOR ALL USING (client_id = current_setting('app.current_client_id', true));

-- Legal & Compliance policies
CREATE POLICY "Clients can view their own data" ON public.contracts
FOR ALL USING (client_id = current_setting('app.current_client_id', true));

CREATE POLICY "Clients can view their own data" ON public.licenses_permits
FOR ALL USING (client_id = current_setting('app.current_client_id', true));

CREATE POLICY "Clients can view their own data" ON public.insurance_documents
FOR ALL USING (client_id = current_setting('app.current_client_id', true));

CREATE POLICY "Clients can view their own data" ON public.regulatory_filings
FOR ALL USING (client_id = current_setting('app.current_client_id', true));

-- Employee Management policies
CREATE POLICY "Clients can view their own data" ON public.employees
FOR ALL USING (client_id = current_setting('app.current_client_id', true));

CREATE POLICY "Clients can view their own data" ON public.attendance_records
FOR ALL USING (client_id = current_setting('app.current_client_id', true));

CREATE POLICY "Clients can view their own data" ON public.leave_records
FOR ALL USING (client_id = current_setting('app.current_client_id', true));

-- Customer & Sales policies
CREATE POLICY "Clients can view their own data" ON public.customers
FOR ALL USING (client_id = current_setting('app.current_client_id', true));

CREATE POLICY "Clients can view their own data" ON public.sales_invoices
FOR ALL USING (client_id = current_setting('app.current_client_id', true));

CREATE POLICY "Clients can view their own data" ON public.customer_feedback
FOR ALL USING (client_id = current_setting('app.current_client_id', true));

-- ============================================
-- 12. FUNCTIONS & TRIGGERS
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
-- 13. INDEXES FOR PERFORMANCE
-- ============================================

-- Core indexes
CREATE INDEX IF NOT EXISTS idx_clients_client_id ON public.clients(client_id);
CREATE INDEX IF NOT EXISTS idx_clients_username ON public.clients(username);
CREATE INDEX IF NOT EXISTS idx_clients_subscription_end ON public.clients(subscription_end);

CREATE INDEX IF NOT EXISTS idx_periods_client_status ON public.periods(client_id, status);
CREATE INDEX IF NOT EXISTS idx_sales_client_date ON public.sales_entries(client_id, date);
CREATE INDEX IF NOT EXISTS idx_purchases_client_month ON public.purchase_entries(client_id, month_number, year);
CREATE INDEX IF NOT EXISTS idx_monthly_expenses_client_month ON public.monthly_expenses(client_id, month_number, year);
CREATE INDEX IF NOT EXISTS idx_expenses_client_date ON public.expense_entries(client_id, date);

CREATE INDEX IF NOT EXISTS idx_groups_client_status ON public.groups(client_id, status);
CREATE INDEX IF NOT EXISTS idx_inventory_client ON public.inventory_items(client_id);

-- Financial Records indexes
CREATE INDEX IF NOT EXISTS idx_income_receipts_client_period ON public.income_receipts(client_id, period_id);
CREATE INDEX IF NOT EXISTS idx_expense_receipts_client_period ON public.expense_receipts(client_id, period_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client_period ON public.invoices(client_id, period_id);
CREATE INDEX IF NOT EXISTS idx_bills_client_period ON public.bills(client_id, period_id);
CREATE INDEX IF NOT EXISTS idx_payroll_client_period ON public.payroll_records(client_id, period_id);
CREATE INDEX IF NOT EXISTS idx_tax_documents_client_period ON public.tax_documents(client_id, period_id);

-- Legal & Compliance indexes
CREATE INDEX IF NOT EXISTS idx_contracts_client_period ON public.contracts(client_id, period_id);
CREATE INDEX IF NOT EXISTS idx_licenses_client_period ON public.licenses_permits(client_id, period_id);
CREATE INDEX IF NOT EXISTS idx_insurance_client_period ON public.insurance_documents(client_id, period_id);
CREATE INDEX IF NOT EXISTS idx_regulatory_client_period ON public.regulatory_filings(client_id, period_id);

-- Employee Management indexes
CREATE INDEX IF NOT EXISTS idx_employees_client ON public.employees(client_id);
CREATE INDEX IF NOT EXISTS idx_attendance_client_period ON public.attendance_records(client_id, period_id);
CREATE INDEX IF NOT EXISTS idx_leave_client_period ON public.leave_records(client_id, period_id);

-- Customer & Sales indexes
CREATE INDEX IF NOT EXISTS idx_customers_client ON public.customers(client_id);
CREATE INDEX IF NOT EXISTS idx_sales_invoices_client_period ON public.sales_invoices(client_id, period_id);
CREATE INDEX IF NOT EXISTS idx_customer_feedback_client_period ON public.customer_feedback(client_id, period_id);

-- Documents indexes
CREATE INDEX IF NOT EXISTS idx_documents_client_module ON public.documents(client_id, module);

-- ============================================
-- 14. SAMPLE DATA (OPTIONAL)
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