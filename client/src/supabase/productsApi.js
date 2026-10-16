/**
 * products jadvali.
 * Ustunlar: id, category_id, name, description, price, image_url,
 *           is_featured, is_active, sort_order, created_at
 */
import supabase, { unwrap } from './supabase';

const TABLE = 'products';

/** Faol mahsulotlar. categoryIds berilsa — faqat shu kategoriyalardan. */
export async function getProducts(categoryIds) {
  let query = supabase
    .from(TABLE)
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  if (Array.isArray(categoryIds) && categoryIds.length) {
    query = query.in('category_id', categoryIds);
  }
  return unwrap(await query);
}

/** Hamma mahsulotlar, faol bo'lmaganlari ham (admin uchun). */
export async function getAllProducts() {
  return unwrap(
    await supabase.from(TABLE).select('*').order('sort_order', { ascending: true })
  );
}

export async function getProductsByCategory(categoryId) {
  return unwrap(
    await supabase
      .from(TABLE)
      .select('*')
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
  );
}

export async function getFeaturedProducts() {
  return unwrap(
    await supabase
      .from(TABLE)
      .select('*')
      .eq('is_featured', true)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
  );
}

export async function getProductById(id) {
  return unwrap(await supabase.from(TABLE).select('*').eq('id', id).maybeSingle());
}

export async function searchProducts(text) {
  return unwrap(
    await supabase
      .from(TABLE)
      .select('*')
      .eq('is_active', true)
      .ilike('name', `%${text}%`)
      .order('sort_order', { ascending: true })
  );
}

/* --- yozish (Supabase'da insert/update/delete uchun RLS siyosati kerak) --- */

export async function createProduct(payload) {
  return unwrap(await supabase.from(TABLE).insert(payload).select().single());
}

export async function updateProduct(id, payload) {
  return unwrap(await supabase.from(TABLE).update(payload).eq('id', id).select().single());
}

export async function deleteProduct(id) {
  return unwrap(await supabase.from(TABLE).delete().eq('id', id));
}

const productsApi = {
  getProducts,
  getAllProducts,
  getProductsByCategory,
  getFeaturedProducts,
  getProductById,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};

export default productsApi;
