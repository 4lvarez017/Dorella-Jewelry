// ─── SUPABASE CONFIG ─────────────────────────────────────────────────────────
// Replace these values with your actual Supabase project credentials
export const SUPABASE_URL = "https://hszxtkwalgndaovckaug.supabase.co";
export const SUPABASE_ANON_KEY = "sb_publishable_FOAmsWbXQtO5vU-a97eahQ_a2S-t3Px";

const supabaseHeaders = {
  "Content-Type": "application/json",
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
};

export async function supabaseFetch(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    ...options,
    headers: { ...supabaseHeaders, ...options.headers },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
