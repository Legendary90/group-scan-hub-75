import { supabase } from './supabase';

export interface MonthlyData {
  month: number;
  year: number;
  client_id: string;
  purchases_data: any[];
  expenses_data: any[];
  created_at: string;
}

export const getCurrentMonth = () => {
  const now = new Date();
  return {
    month: now.getMonth() + 1, // 1-12
    year: now.getFullYear()
  };
};

export const getNextMonth = (month: number, year: number) => {
  if (month === 12) {
    return { month: 1, year: year + 1 };
  }
  return { month: month + 1, year };
};

export const adjustLeftoverPurchases = async (clientId: string) => {
  try {
    const { month, year } = getCurrentMonth();
    const nextMonth = getNextMonth(month, year);
    
    // Get current month's leftover purchases
    const { data: currentMonthData } = await supabase
      .from('purchase_entries')
      .select('*')
      .eq('client_id', clientId)
      .eq('month', month)
      .eq('year', year);
    
    if (currentMonthData && currentMonthData.length > 0) {
      // Move leftover purchases to next month
      const leftoverPurchases = currentMonthData.map(purchase => ({
        ...purchase,
        id: undefined, // Let database generate new ID
        month: nextMonth.month,
        year: nextMonth.year,
        created_at: new Date().toISOString()
      }));
      
      // Insert into next month
      await supabase
        .from('purchase_entries')
        .insert(leftoverPurchases);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error adjusting leftover purchases:', error);
    return { success: false, error };
  }
};

export const archiveYearData = async (clientId: string, year: number) => {
  try {
    // Get all data for the year
    const { data: yearData } = await supabase
      .from('purchase_entries')
      .select('*')
      .eq('client_id', clientId)
      .eq('year', year);
    
    if (yearData && yearData.length > 0) {
      // Archive to history table
      await supabase
        .from('archived_data')
        .insert([{
          client_id: clientId,
          year: year,
          data: yearData,
          archived_at: new Date().toISOString()
        }]);
      
      // Clear current year data
      await supabase
        .from('purchase_entries')
        .delete()
        .eq('client_id', clientId)
        .eq('year', year);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error archiving year data:', error);
    return { success: false, error };
  }
};

export const checkAndHandleMonthTransition = async (clientId: string) => {
  const { month, year } = getCurrentMonth();
  
  // Check if it's a new year (January)
  if (month === 1) {
    // Archive previous year data
    await archiveYearData(clientId, year - 1);
  }
  
  // Always adjust leftover purchases for month transition
  await adjustLeftoverPurchases(clientId);
};