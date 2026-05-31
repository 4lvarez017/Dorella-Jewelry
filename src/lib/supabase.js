// ─── SUPABASE CONFIG ─────────────────────────────────────────────────────────
// Replace these values with your actual Supabase project credentials
export const SUPABASE_URL = "https://hszxtkwalgndaovckaug.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhzenh0a3dhbGduZGFvdmNrYXVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxODU3NTksImV4cCI6MjA5NTc2MTc1OX0.Bjbk9ASl1OjtkaHbh2YsdR1LzCQP1OMSnYQ6RZmcLcs";

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
