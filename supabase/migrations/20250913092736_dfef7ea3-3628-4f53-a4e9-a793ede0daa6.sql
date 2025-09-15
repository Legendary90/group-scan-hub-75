-- Add admin role system and RLS policies for secure access control

-- Create admin table to track admin users
CREATE TABLE IF NOT EXISTS public.admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  last_login timestamp with time zone
);

-- Enable RLS on admins table
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Admin can only view their own record
CREATE POLICY "Admins can view their own record" ON public.admins
  FOR SELECT USING (username = current_setting('app.current_admin'::text, true));

-- Only allow admin access to clients table
DROP POLICY IF EXISTS "Admin can access all clients" ON public.clients;
CREATE POLICY "Only admins can access clients" ON public.clients
  FOR ALL USING (current_setting('app.current_admin'::text, true) IS NOT NULL);

-- Insert default admin user (username: admin, password: admin123)
INSERT INTO public.admins (username, password_hash) 
VALUES ('admin', 'admin123') 
ON CONFLICT (username) DO NOTHING;

-- Create function to authenticate admin
CREATE OR REPLACE FUNCTION public.authenticate_admin(p_username text, p_password text)
RETURNS TABLE(admin_username text) AS $$
BEGIN
  -- Check if admin exists and password matches
  IF EXISTS (
    SELECT 1 FROM public.admins 
    WHERE username = p_username AND password_hash = p_password
  ) THEN
    -- Update last login
    UPDATE public.admins 
    SET last_login = now() 
    WHERE username = p_username;
    
    -- Return admin username
    RETURN QUERY SELECT p_username;
  ELSE
    -- Return empty result if authentication fails
    RETURN;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;