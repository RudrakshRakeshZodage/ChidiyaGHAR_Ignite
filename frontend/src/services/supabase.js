import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://msgjuazmayoimjjaatmh.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Zp2BXwr2Fs98YJnSonG2HA_bkDiq_eh';

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Fetch top player stats or match history from Supabase
 */
export async function getLeaderboard() {
  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .order('wins', { ascending: false })
      .limit(10);

    if (error) {
      console.warn('Supabase leaderboard fetch note:', error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn('Supabase not reachable:', err.message);
    return [];
  }
}
