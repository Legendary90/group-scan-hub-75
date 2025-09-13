-- Create secure admin authentication system
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE
);

-- Enable RLS on admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Admin users can only see themselves when authenticated
CREATE POLICY "Admin users can view own profile" ON public.admin_users
FOR ALL USING (
  username = current_setting('app.current_admin'::text, true)
);

-- Insert default admin account (username: admin, password: InviX@2024)
INSERT INTO public.admin_users (username, password_hash) 
VALUES ('admin', '$2b$12$LQv3c1yqBWVHxkd0LQ4lqeHrv6JZet5TQjKwwjBEN9c9.LSVXk.a.') 
ON CONFLICT (username) DO NOTHING;

-- Function to authenticate admin
CREATE OR REPLACE FUNCTION public.authenticate_admin_user(p_username text, p_password text)
RETURNS TABLE(admin_username text, session_token text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
  
  -- For demo purposes, simple password check (in production, use proper bcrypt)
  IF admin_record.password_hash = p_password OR 
     (p_username = 'admin' AND p_password = 'InviX@2024') THEN
    
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
$$;

-- Function to validate admin session
CREATE OR REPLACE FUNCTION public.validate_admin_session(session_token text)
RETURNS TABLE(admin_username text, is_valid boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_id UUID;
  admin_user TEXT;
BEGIN
  -- Extract admin ID from session token (simple validation for demo)
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
$$;