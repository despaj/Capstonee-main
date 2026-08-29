import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log("SUPABASE URL:", supabaseUrl);

if (!supabaseUrl) {
  throw new Error("Missing REACT_APP_SUPABASE_URL");
}

if (!supabaseKey) {
  throw new Error("Missing REACT_APP_SUPABASE_ANON_KEY");
}

export const supabase = createClient(supabaseUrl, supabaseKey);