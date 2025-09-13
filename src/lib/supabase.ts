import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = "https://bufbhxptciyogmggmvfa.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1ZmJoeHB0Y2l5b2dtZ2dtdmZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MTQ3MzAsImV4cCI6MjA3Mjk5MDczMH0.VB-CdJ5WALNQfyaYXpn8gvBrR2Egcx_duGWUIJ82Rqk"

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