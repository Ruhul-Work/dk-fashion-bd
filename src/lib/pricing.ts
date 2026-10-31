import { useWebsite } from '../context/WebsiteContext';

export function money(value: any): string {
  const n = Number(value ?? 0);
  return n.toLocaleString();
}

export function discountPercent(price: any, mrp: any): number {
  const p = Number(price ?? 0);
  const m = Number(mrp ?? 0);
  if (!m || m <= p) return 0;
  return Math.round(((m - p) / m) * 100);
}
