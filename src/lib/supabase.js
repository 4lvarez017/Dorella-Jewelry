// ─── SUPABASE CONFIG ─────────────────────────────────────────────────────────
// Replace these values with your actual Supabase project credentials
export const SUPABASE_URL = "https://goeopbirzodlxomxprnm.supabase.co";
export const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvZW9wYmlyem9kbHhvbXhwcm5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5MjgyOTIsImV4cCI6MjA5NTUwNDI5Mn0.JzJoeQtwERznqbiLmBqnalSp1TzIIi934pZ5FAQGeSw";

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
