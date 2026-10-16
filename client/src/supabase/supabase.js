/**
 * Supabase ulanishi.
 *
 * Loyiha: uiabklrymmgfxpxnvjjn (CULT).
 * URL va anon kalit client/.env.development va client/.env.production
 * fayllaridan olinadi. Anon (public) kalitni brauzerda ochiq saqlash
 * xavfsiz — ma'lumotlarni RLS siyosatlari himoya qiladi.
 */
import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = (
  process.env.REACT_APP_SUPABASE_URL || 'https://uiabklrymmgfxpxnvjjn.supabase.co'
).replace(/\/+$/, '');

export const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

/* Agar kerak bo'lsa, aniq bitta restoranni tanlash uchun (restaurants.id). */
export const RESTAURANT_ID = process.env.REACT_APP_RESTAURANT_ID || '';

export const isSupabaseConfigured =
  !!SUPABASE_URL && !!SUPABASE_ANON_KEY && !SUPABASE_ANON_KEY.startsWith('SIZNING');

if (!isSupabaseConfigured) {
  // eslint-disable-next-line no-console
  console.error(
    '[supabase] REACT_APP_SUPABASE_ANON_KEY berilmagan. ' +
      'Supabase → Project Settings → API Keys → anon public kalitni ' +
      'client/.env.development va client/.env.production ga qo\'ying.'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY || 'missing-key', {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

/** Supabase xatosini bitta ko'rinishga keltiradi. */
export function unwrap({ data, error }) {
  if (error) {
    const err = new Error(error.message || 'supabase_error');
    err.code = error.code;
    err.details = error.details;
    throw err;
  }
  return data;
}

export default supabase;
