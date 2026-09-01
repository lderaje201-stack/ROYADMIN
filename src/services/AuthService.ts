import { supabase } from '../lib/supabase';
import { AdminProfile } from '../types';

export async function getAuthenticatedAdminUser(): Promise<{
  session: any;
  profile: AdminProfile | null;
  isAdmin: boolean;
  error?: string;
}> {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session || !session.user) {
      return { session: null, profile: null, isAdmin: false };
    }

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profileError || !profileData) {
      return { session: null, profile: null, isAdmin: false, error: 'User profile not found.' };
    }

    if (!['admin', 'staff', 'doctor'].includes(profileData.role)) {
      return { session: null, profile: null, isAdmin: false, error: 'Unauthorized access. Staff role required.' };
    }

    const profile: AdminProfile = {
      id: profileData.id,
      email: session.user.email || profileData.email || '',
      full_name: profileData.full_name || 'Administrator',
      avatar_url: profileData.avatar_url || '',
      role: profileData.role,
      phone: profileData.phone || ''
    };

    return { session, profile, isAdmin: true };
  } catch (err: any) {
    console.error('[AUTH] getAuthenticatedAdminUser exception:', err);
    return { session: null, profile: null, isAdmin: false, error: err?.message || 'Auth check failed.' };
  }
}

export async function signInAdmin(email: string, password: string): Promise<{
  success: boolean;
  user?: any;
  profile?: AdminProfile;
  error?: string;
}> {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: password
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data || !data.user) {
      return { success: false, error: 'Authentication failed. No user profile returned.' };
    }

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError || !profileData || !['admin', 'staff', 'doctor'].includes(profileData.role)) {
      await supabase.auth.signOut();
      return { success: false, error: 'Unauthorized access. Staff role required.' };
    }

    const profile: AdminProfile = {
      id: profileData.id,
      email: data.user.email || cleanEmail,
      full_name: profileData.full_name || 'Administrator',
      avatar_url: profileData.avatar_url || '',
      role: profileData.role,
      phone: profileData.phone || ''
    };

    return { success: true, user: data.user, profile };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Authentication request failed.' };
  }
}

export async function signOutAdmin(): Promise<void> {
  await supabase.auth.signOut();
}
