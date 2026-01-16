import { createClient } from "@supabase/supabase-js";

// Pega aquí la URL que copiaste de la captura 194
const supabaseUrl = "https://ehgwofvfabiixwpbkxns.supabase.co";

// Pega aquí la clave larga que empieza por sb_publicable_
const supabaseAnonKey = "sb_publishable_FoYHJPpcSYii1eq16EtrXA_B4G4CjtS";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
