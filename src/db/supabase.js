import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || "https://msgjuazmayoimjjaatmh.supabase.co";
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || "sb_publishable_Zp2BXwr2Fs98YJnSonG2HA_bkDiq_eh";

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Record completed game match in Supabase
 */
export async function recordGameResult(roomData) {
  try {
    const record = {
      room_code: roomData.code,
      winner: roomData.winner,
      win_reason: roomData.winReason,
      challenge_id: roomData.challenge?.id,
      player_count: Object.keys(roomData.players || {}).length,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from("game_matches")
      .insert([record]);

    if (error) {
      // Non-blocking: table might not exist in supabase yet
      console.log("ℹ️ Supabase game match note:", error.message);
    } else {
      console.log("✅ Game match recorded to Supabase:", roomData.code);
    }
  } catch (err) {
    console.log("ℹ️ Supabase match logging skipped:", err.message);
  }
}
