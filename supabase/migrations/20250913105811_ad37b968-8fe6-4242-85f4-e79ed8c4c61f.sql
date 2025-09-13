-- Fix remaining security warning by updating authenticate_admin function
CREATE OR REPLACE FUNCTION public.authenticate_admin(p_username text, p_password text)
 RETURNS TABLE(admin_username text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;