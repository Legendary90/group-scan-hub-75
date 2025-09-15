-- Fix security warnings by updating function search paths
CREATE OR REPLACE FUNCTION public.update_profit_loss()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
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
$function$;

-- Fix auto_expire_subscriptions function
CREATE OR REPLACE FUNCTION public.auto_expire_subscriptions()
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.clients 
  SET subscription_status = 'INACTIVE'
  WHERE subscription_end < CURRENT_DATE 
  AND subscription_status = 'ACTIVE';
END;
$function$;

-- Fix generate_client_id function
CREATE OR REPLACE FUNCTION public.generate_client_id()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  new_id TEXT;
BEGIN
  new_id := 'CLI_' || LPAD(EXTRACT(EPOCH FROM NOW())::TEXT, 10, '0');
  RETURN new_id;
END;
$function$;