import { supabase } from '../lib/supabase';
import { ClinicService, ServiceCategory } from '../types';

export async function getAllServices(): Promise<ClinicService[]> {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error || !data) {
      console.error('Error fetching services:', error);
      return [];
    }

    return data as ClinicService[];
  } catch (err) {
    console.error('Error in getAllServices:', err);
    return [];
  }
}

export async function getAllCategories(): Promise<ServiceCategory[]> {
  try {
    const { data, error } = await supabase
      .from('service_categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error || !data) {
      console.error('Error fetching service categories:', error);
      return [];
    }

    return data as ServiceCategory[];
  } catch (err) {
    console.error('Error in getAllCategories:', err);
    return [];
  }
}
