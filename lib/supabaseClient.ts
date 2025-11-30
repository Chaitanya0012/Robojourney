import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn("Supabase credentials are not set. Falling back to anon mode.");
}

export const supabaseClient = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseKey || "public-anon-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  },
);

export type ProfileRow = {
  id: string;
  display_name: string | null;
  created_at: string;
};

export type UserPreferencesRow = {
  id: string;
  user_id: string;
  experience_level: "beginner" | "intermediate" | "advanced";
  goal: string | null;
  preferred_pace: "slow" | "normal" | "fast";
  updated_at: string;
};
