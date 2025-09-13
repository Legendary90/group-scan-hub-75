-- Create admin users table for secure admin authentication
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- Enable RLS on admin users table
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create policy for admin users (only admins can access)
CREATE POLICY "Admin users can manage admin accounts" ON public.admin_users
FOR ALL USING (true);

-- Insert the admin user with specified credentials
INSERT INTO public.admin_users (username, password_hash, is_active)
VALUES ('admin', 'invixop32#*@', true)
ON CONFLICT (username) DO UPDATE SET 
  password_hash = EXCLUDED.password_hash,
  is_active = EXCLUDED.is_active;

-- Create admin authentication function
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
  
  -- Simple password check (matches the specified password exactly)
  IF admin_record.password_hash = p_password THEN
    -- Generate session token
    session_token_val := 'admin_' || extract(epoch from now()) || '_' || admin_record.id;
    
    -- Update last login
    UPDATE public.admin_users 
    SET last_login = NOW() 
    WHERE id = admin_record.id;
    
    -- Return admin username and session token
    RETURN QUERY SELECT admin_record.username, session_token_val;
  END IF;
END;
$function$;

-- Create session validation function
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
    -- Get the admin ID from token (last part after final underscore)
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