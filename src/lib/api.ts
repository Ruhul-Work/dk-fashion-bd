import { SERVER_URL } from '../services/api';

export interface ProductQuery {
  search?: string;
  category?: string | number;
  per_page?: number;
  page?: number;
  sort_by?: string;
}

export function assetUrl(value: any): string | undefined {
  if (!value) return undefined;
  const s = String(value);
  if (s.startsWith('http')) return s;
  return `${SERVER_URL}${s.replace(/^\/+/, '')}`;
}