import { supabase } from './supabaseClient';
import { v4 as uuidv4 } from 'uuid';

export async function upsertProfile(profile: { nickname?: string; avatar_url?: string; birthdate?: string; location_city?: string; location_country?: string; favorite_color?: string; }) {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) throw new Error('Not authenticated');
  const payload: any = { id: user.id, email: user.email, created_at: new Date().toISOString(), ...profile };
  const { data, error } = await supabase.from('users').upsert(payload, { onConflict: 'id' }).select().single();
  if (error) throw error;
  return data;
}

export async function createFriendship() {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) throw new Error('Not authenticated');
  const pairing_code = uuidv4().split('-')[0];
  const payload = { user_1_id: user.id, pairing_code, status: 'pending' };
  const { data, error } = await supabase.from('friendships').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function joinFriendshipByCode(code: string) {
  // Calls the RPC function created in the DB migration
  const { data, error } = await supabase.rpc('join_friendship', { p_code: code });
  if (error) throw error;
  return data;
}
