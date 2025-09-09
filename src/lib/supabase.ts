import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!

export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey)

// Client management functions
export const createClient = async (clientData: {
  client_id: string;
  company_name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
}) => {
  const { data, error } = await supabase
    .from('clients')
    .insert([clientData])
    .select()
  
  return { data, error }
}

export const updateSubscriptionStatus = async (clientId: string, status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED') => {
  const { data, error } = await supabase
    .from('clients')
    .update({ 
      subscription_status: status,
      updated_at: new Date().toISOString()
    })
    .eq('client_id', clientId)
    .select()
  
  return { data, error }
}

export const getClientByClientId = async (clientId: string) => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('client_id', clientId)
    .single()
  
  return { data, error }
}