import { supabase } from './supabase';

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
    if (data.subscription_status !== 'ACTIVE' || data.access_status !== 'ACTIVE') {
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
      access_status: data.access_status
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
    // Generate client ID
    const client_id = 'CLI_' + Date.now().toString().slice(-8);
    
    // In production, hash the password
    const password_hash = userData.password; // Should use bcrypt or similar

    const { data, error } = await supabase
      .from('clients')
      .insert([{
        client_id,
        username: userData.username,
        password_hash,
        company_name: userData.company_name,
        contact_person: userData.contact_person,
        email: userData.email,
        phone: userData.phone,
        subscription_status: 'ACTIVE',
        subscription_start: new Date().toISOString().split('T')[0],
        subscription_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      }])
      .select()
      .single();

    if (error) {
      return { client_id: null, error: 'Registration failed. Username might already exist.' };
    }

    return { client_id: data.client_id, error: null };
  } catch (error) {
    return { client_id: null, error: 'Registration failed' };
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

    const active = data.subscription_status === 'ACTIVE' && data.access_status === 'ACTIVE';
    return { active, error: active ? null : 'Access denied' };
  } catch (error) {
    return { active: false, error: 'Subscription check failed' };
  }
};