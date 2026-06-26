import { createClient } from "@supabase/supabase-js";
import { env } from "./env.js";

/**
 * Admin Supabase client — bypasses RLS.
 * Use ONLY on the server for admin operations.
 */
export const supabaseAdmin = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
