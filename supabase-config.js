/* ==========================================================================
   M-MKULIMA NYANDARUA PRO - SUPABASE CLOUD DATABASE INTEGRATION
   ========================================================================== */

const SUPABASE_URL = "https://vggyemyygayyraffopri.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_4SOynrt6QE1RceWoL_36-g_k8YJKpYQ";

let db = null;

if (typeof supabase !== "undefined") {
  db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log("⚡ Supabase Cloud Connected: https://vggyemyygayyraffopri.supabase.co");
} else {
  console.warn("⚠️ Supabase SDK library not loaded.");
}
