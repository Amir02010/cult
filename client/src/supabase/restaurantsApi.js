/**
 * restaurants jadvali.
 */
import supabase, { unwrap } from './supabase';

const TABLE = 'restaurants';

export async function getRestaurants() {
  return unwrap(await supabase.from(TABLE).select('*'));
}

export async function getRestaurantById(id) {
  return unwrap(await supabase.from(TABLE).select('*').eq('id', id).maybeSingle());
}

/** id berilsa — shu restoran, aks holda jadvaldagi birinchisi. */
export async function getRestaurant(id) {
  if (id) return getRestaurantById(id);
  const rows = unwrap(await supabase.from(TABLE).select('*').limit(1));
  return rows && rows.length ? rows[0] : null;
}

export async function updateRestaurant(id, payload) {
  return unwrap(await supabase.from(TABLE).update(payload).eq('id', id).select().single());
}

const restaurantsApi = {
  getRestaurants,
  getRestaurantById,
  getRestaurant,
  updateRestaurant,
};

export default restaurantsApi;
