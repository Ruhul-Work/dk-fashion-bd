import type { Product } from '../services/api';
import { SERVER_URL } from '../services/api';

export function productCover(p: any): string | undefined {
  let img = p?.thumbnail_image || p?.image_url;
  if (!img && Array.isArray(p?.images) && p.images.length) img = p.images[0];
  if (!img && typeof p?.images === 'string') {
    try {
      const parsed = JSON.parse(p.images);
      if (Array.isArray(parsed) && parsed.length) img = parsed[0];
    } catch {}
  }
  if (!img) return undefined;
  const value = typeof img === 'string' ? img : (img?.url || img?.image || img?.thumbnail_image || img?.path || img?.full_url);
  if (!value) return undefined;
  return String(value).startsWith('http') ? value : `${SERVER_URL}${String(value).replace(/^\/+/, '')}`;
}

export function productTag(p: any): string | undefined {
  return p?.category?.name || (typeof p?.category === 'string' ? p.category : undefined);
}

export function subcategoryImage(p: any): string | undefined {
  return productCover(p);
}
