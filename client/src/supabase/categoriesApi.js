/**
 * categories jadvali.
 * Ustunlar: id, restaurant_id, name, slug, menu_type, note, sort_order,
 *           is_active, created_at
 */
import supabase, { unwrap } from './supabase';

const TABLE = 'categories';

/** Faol kategoriyalar (mehmon uchun menyu). */
export async function getCategories(restaurantId) {
  let query = supabase
    .from(TABLE)
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  if (restaurantId) query = query.eq('restaurant_id', restaurantId);
  return unwrap(await query);
}

/** Hamma kategoriyalar, faol bo'lmaganlari ham (admin uchun). */
export async function getAllCategories(restaurantId) {
  let query = supabase.from(TABLE).select('*').order('sort_order', { ascending: true });
  if (restaurantId) query = query.eq('restaurant_id', restaurantId);
  return unwrap(await query);
}

export async function getCategoryBySlug(slug) {
  return unwrap(await supabase.from(TABLE).select('*').eq('slug', slug).maybeSingle());
}

export async function getCategoriesByMenuType(menuType, restaurantId) {
  let query = supabase
    .from(TABLE)
    .select('*')
    .eq('menu_type', menuType)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  if (restaurantId) query = query.eq('restaurant_id', restaurantId);
  return unwrap(await query);
}

/* --- yozish (Supabase'da insert/update/delete uchun RLS siyosati kerak) --- */

export async function createCategory(payload) {
  return unwrap(await supabase.from(TABLE).insert(payload).select().single());
}

export async function updateCategory(id, payload) {
  return unwrap(await supabase.from(TABLE).update(payload).eq('id', id).select().single());
}

export async function deleteCategory(id) {
  return unwrap(await supabase.from(TABLE).delete().eq('id', id));
}

const categoriesApi = {
  getCategories,
  getAllCategories,
  getCategoryBySlug,
  getCategoriesByMenuType,
  createCategory,
  updateCategory,
  deleteCategory,
};

export default categoriesApi;
