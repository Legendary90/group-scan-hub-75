import { supabase } from '@/integrations/supabase/client';

export interface AuthUser {
  client_id: string;
  username: string;
  company_name: string;
  subscription_status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  access_status: 'ACTIVE' | 'STOPPED';
}

// Client authentication
export const authenticateClient = async (username: string, password: string): Promise<{ user: AuthUser | null; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('username', username)
      .single();

    if (error) {
      return { user: null, error: 'Invalid username or password' };
    }

    // In production, you should hash the password and compare with password_hash
    // For now, we'll do a simple comparison (NOT SECURE - FOR DEMO ONLY)
    if (data.password_hash !== password) {
      return { user: null, error: 'Invalid username or password' };
    }

    // Check subscription status
    if (data.subscription_status !== 'ACTIVE' || !data.access_status) {
      return { user: null, error: 'Your subscription has expired or access has been suspended. Please contact administrator.' };
    }

    // Update last login
    await supabase
      .from('clients')
      .update({ last_login: new Date().toISOString() })
      .eq('client_id', data.client_id);

    const user: AuthUser = {
      client_id: data.client_id,
      username: data.username,
      company_name: data.company_name,
      subscription_status: data.subscription_status,
      access_status: data.access_status ? 'ACTIVE' : 'STOPPED'
    };

    return { user, error: null };
  } catch (error) {
    return { user: null, error: 'Authentication failed' };
  }
};

// Register new client
export const registerClient = async (userData: {
  username: string;
  password: string;
  company_name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
}): Promise<{ client_id: string | null; error: string | null }> => {
  try {
    // First check if username already exists
    const { data: existingUser } = await supabase
      .from('clients')
      .select('username')
      .eq('username', userData.username)
      .maybeSingle();

    if (existingUser) {
      return { client_id: null, error: 'Username already exists. Please choose a different username.' };
    }

    // Generate unique client ID
    const client_id = 'CLI_' + Date.now().toString() + Math.random().toString(36).substr(2, 9);
    
    // In production, hash the password properly
    const password_hash = userData.password; // Should use bcrypt in production

    const { data, error } = await supabase
      .from('clients')
      .insert([{
        client_id,
        username: userData.username,
        password_hash,
        company_name: userData.company_name,
        contact_person: userData.contact_person || null,
        email: userData.email || null,
        phone: userData.phone || null,
        subscription_status: 'ACTIVE',
        subscription_start: new Date().toISOString().split('T')[0],
        subscription_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        access_status: true
      }])
      .select()
      .single();

    if (error) {
      console.error('Registration error:', error);
      if (error.code === '23505') { // Unique constraint violation
        return { client_id: null, error: 'Username already exists. Please choose a different username.' };
      }
      return { client_id: null, error: 'Registration failed. Please try again.' };
    }

    return { client_id: data.client_id, error: null };
  } catch (error) {
    console.error('Registration catch error:', error);
    return { client_id: null, error: 'Registration failed. Please try again.' };
  }
};

// Check subscription status
export const checkSubscriptionStatus = async (client_id: string): Promise<{ active: boolean; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('subscription_status, subscription_end, access_status')
      .eq('client_id', client_id)
      .single();

    if (error) {
      return { active: false, error: 'Client not found' };
    }

    const now = new Date();
    const endDate = new Date(data.subscription_end);
    
    // Auto-expire if subscription end date has passed
    if (endDate < now && data.subscription_status === 'ACTIVE') {
      await supabase
        .from('clients')
        .update({ subscription_status: 'INACTIVE' })
        .eq('client_id', client_id);
      
      return { active: false, error: 'Subscription expired' };
    }

    const active = data.subscription_status === 'ACTIVE' && data.access_status;
    return { active, error: active ? null : 'Access denied' };
  } catch (error) {
    return { active: false, error: 'Subscription check failed' };
  }
};