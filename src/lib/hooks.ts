import { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import type { ProductQuery } from './api';

type DataShape = { items: any[] };

export function useProducts(query: ProductQuery | null) {
  const [data, setData] = useState<DataShape>({ items: [] });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetcher = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const q = query || {};
      const res = await api.getProducts(q.category, q.page || 1, q.sort_by, q.search);
      setData({ items: res?.products || [] });
    } catch (e: any) {
      setError(e?.message || 'Failed to load');
      setData({ items: [] });
    } finally {
      setLoading(false);
    }
  }, [query?.category, query?.page, query?.sort_by, query?.search]);

  useEffect(() => {
    fetcher();
  }, [fetcher]);

  return { data, loading, error, reload: fetcher };
}

export function useDebouncedValue(value: any, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function useCategories() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const reload = async () => {
    setLoading(true); setError(null);
    try {
      const { api } = await import('../services/api');
      const cats = await api.getCategories();
      setData(cats || []);
    } catch (e: any) {
      setError(e?.message || 'Failed'); setData([]);
    } finally { setLoading(false); }
  };
  useEffect(() => { reload(); }, []);
  return { data, loading, error, reload };
}

export function useProduct(id: any) {
  const [data,setData]=useState<any>(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState<string|null>(null);
  const reload = async () => {
    setLoading(true); setError(null);
    try {
      const { api } = await import("../services/api");
      const p = await api.getProductById(id);
      if (!p) throw new Error("Not found");
      setData(p);
    } catch (e: any) { setError(e?.message || "Failed"); setData(null); }
    finally { setLoading(false); }
  };
  useEffect(() => { if (id) reload(); }, [id]);
  return { data, loading, error, reload };
}
