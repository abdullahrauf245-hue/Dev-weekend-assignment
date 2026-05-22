// ── Supabase Client Initialization ──────────────────────────────
// Uses the global `supabase` object loaded from the CDN in index.html

const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
