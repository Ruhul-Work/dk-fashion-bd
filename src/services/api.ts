/**
 * Service Layer for E-commerce API
 * Connected to LMS System API: http://localhost/lms_system/api
 * Includes Mock Fallback for development if API is unreachable.
 */
import { toast } from 'react-hot-toast';

// Allow overriding via localStorage for testing/demo
const BASE_URL = localStorage.getItem('essence_api_url') || 'https://admin.dkfashionbd.net/api';
export const SERVER_URL = localStorage.getItem('essence_image_base_url') || 'https://admin.dkfashionbd.net/';

export interface Size {
  id: string | number;
  name: string;
}

export interface Product {
  id: string | number;
  slug: string;
  name: string;
  description: string;
  mrp: number;
  price?: number;
  offer_price?: number;
  has_variants?: boolean;
  thumbnail_image?: string;
  category_id?: number | string;
  category?: any;
  images?: string[];
  specs?: any;
  specification?: Record<string, string>;
  isNew?: boolean;
  colors?: string;
  sizes: Size[];
  children: any[];
}

export interface Category {
  id: string | number;
  name: string;
  icon?: string;
  slug?: string;
}

export interface ProductResponse {
  products: Product[];
  pagination?: {
    current_page: number;
    last_page: number;
    total: number;
  };
}

export interface User {
  id: string | number;
  name: string;
  email?: string;
  phone?: string;
  username?: string;
  orders?: Order[];
  current_password?: string;
  password?: string;
  password_confirmation?: string;
}

export interface WebsiteSettings {
  company_name: string;
  logo: string;
  favicon: string;
  display_video?: string;
  facebook?: string;
  tiktok?: string;
  youtube?: string;
  instagram?: string;
  phone?: string;
  email?: string;
  address?: string;
  shipping_charge?: number;
  free_shipping_amount?: number;
  currency_code?: string;
  merchant_qr?: string;
}

export interface OrderItem {
  productId: string | number;
  name: string;
  quantity: number;
  price: number;
  size_id?: string | number;
  color?: string;
  image_url?: string;
  product: Product;
}

export interface Order {
  id: string | number;
  order_number?: string;
  date: string;
  total: number;
  subtotal: number;
  discount?: number;
  coupon_discount?: number;
  shipping_charge?: number;
  status: 'pending' | 'shipped' | 'delivered' | 'confirmed' | 'processing' | 'cancelled';
  payment_status?: string;
  shipping_address: string;
  user_name?: string;
  user_phone?: string;
  user_email?: string;
  items: OrderItem[];
}

const getHeaders = () => {
  const token = localStorage.getItem('essence_token');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};


// Helper for parsing JSON safely
const parseResponse = async (res: Response) => {
  try {
    const data = await res.json();
    return data;
  } catch (error) {
    return null;
  }
};

// Helper for error alerts
const showAlert = (message: string) => {
  toast.error(message);
};


export const api = {
  // --- AUTH ---
  register: async (data: any) => {
    try {
      const res = await fetch(`${BASE_URL}/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      const result = await parseResponse(res);
      if (!res.ok) {
        showAlert(result?.message || `Registration failed! Email or phone number already taken.`);
        return null;
      }
      return result;
    } catch (error: any) {
      if (error.name !== 'AbortError') showAlert('Connection Error');
      return null;
    }
  },

  login: async (data: any) => {
    try {
      const res = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      const result = await parseResponse(res);
      if (!res.ok) {
        showAlert(result?.message || `Login failed: ${res.status}`);
        return null;
      }
      if (result.access_token) {
        localStorage.setItem('essence_token', result.access_token);
      }
      return result;
    } catch (error: any) {
      if (error.name !== 'AbortError') showAlert('Connection Error');
      return null;
    }
  },

  logout: async () => {
    try {
      await fetch(`${BASE_URL}/logout`, {
        method: 'POST',
        headers: getHeaders(),
      });
    } finally {
      localStorage.removeItem('essence_token');
    }
    return { status: 'logged out' };
  },

  // --- CATALOG ---
  getCategories: async (): Promise<Category[]> => {
    try {
      const res = await fetch(`${BASE_URL}/categories`, { headers: getHeaders() });
      const data = await parseResponse(res);
      if (!res.ok) return [];
      return data.data || data || [];
    } catch (error) {
      return [];
    }
  },

  getProducts: async (category_slug?: string | number, page: number = 1, sort_by?: string, search?: string): Promise<ProductResponse> => {
    try {
      const url = new URL(`${BASE_URL}/products`);
      if (category_slug) url.searchParams.append('category', category_slug.toString());
      if (page) url.searchParams.append('page', page.toString());
      if (sort_by) url.searchParams.append('sort_by', sort_by);
      if (search) url.searchParams.append('search', search);

      const res = await fetch(url.toString(), { headers: getHeaders() });
      const data = await parseResponse(res);

      if (!res.ok) return { products: [] };

      const productsData = data.data?.data || data.data || data;
      const products = Array.isArray(productsData) ? productsData : [];

      const result = products.map((p: any) => ({
        ...p,
        images: p.images || [p.image_url || 'https://picsum.photos/seed/furniture/800/600'],
        specs: p.specs || {},
        category: p.category?.name || p.category || 'Uncategorized'
      }));

      const pagination = data.data?.current_page ? {
        current_page: data.data.current_page,
        last_page: data.data.last_page,
        total: data.data.total
      } : (data.current_page ? {
        current_page: data.current_page,
        last_page: data.last_page,
        total: data.total
      } : undefined);

      return {
        products: result,
        pagination
      };
    } catch (error) {
      return { products: [] };
    }
  },

  getProductById: async (id: string | number): Promise<Product | null> => {
    try {
      const res = await fetch(`${BASE_URL}/products/${id}`, { headers: getHeaders() });
      const data = await parseResponse(res);
      if (!res.ok) return null;
      return data.data;
    } catch (error) {
      return null;
    }
  },

  getCoupon: async (code: string) => {
    try {
      const res = await fetch(`${BASE_URL}/get-coupon`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ code }),
      });
      const result = await parseResponse(res);
      if (!res.ok) {
        showAlert(result?.message || 'Invalid coupon');
        return null;
      }
      return result;
    } catch (error) {
      return null;
    }
  },

  // --- ORDERS ---
  placeOrder: async (orderData: any) => {
    try {
      const res = await fetch(`${BASE_URL}/orders`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(orderData),
      });
      const result = await parseResponse(res);
      if (!res.ok) {
        showAlert(result?.message || 'Failed to place order');
        return null;
      }
      let order = {
        'success': true,
        'order_number': result.order.invoice_no,
        'order_id': result.order.id,
        'order_total': result.order.order_total
      };
      return order;
    } catch (error: any) {
      if (error.name !== 'AbortError') showAlert('Connection Error');
      return null;
    }
  },

  getUserOrders: async (): Promise<Order[]> => {
    try {
      const res = await fetch(`${BASE_URL}/user/orders`, { headers: getHeaders() });
      const data = await parseResponse(res);
      if (!res.ok || !data) return [];

      const result = data.data?.data || data.data || [];
      const orders = Array.isArray(result) ? result : [];

      return orders.map((o: any) => ({
        id: o.id,
        order_number: o.invoice_no,
        date: o.created_at ? new Date(o.created_at).toLocaleDateString() : (o.date || '—'),
        subtotal: parseFloat(o.subtotal || 0),
        total: parseFloat(o.total_amount || o.total || 0),
        status: o.order_status || o.status || 'pending',
        payment_status: o.payment_status || 'Pending',
        shipping_address: o.shipping_address,
        items: o.items || o.order_details || []
      }));
    } catch (error) {
      return [];
    }
  },

  getOrderById: async (id: string | number): Promise<Order | null> => {
    try {
      const res = await fetch(`${BASE_URL}/user/orders/${id}`, { headers: getHeaders() });
      const data = await parseResponse(res);
      if (!res.ok || !data) return null;

      const o = data.data || data;
      return {
        id: o.id,
        order_number: o.invoice_no,
        date: o.created_at ? new Date(o.created_at).toLocaleDateString() : (o.date || '—'),
        subtotal: parseFloat(o.subtotal || 0),
        discount: parseFloat(o.discount || 0),
        coupon_discount: parseFloat(o.coupon_discount || 0),
        shipping_charge: parseFloat(o.shipping_charge || 0),
        total: parseFloat(o.total_amount || o.total || 0),
        status: o.order_status || o.status || 'pending',
        payment_status: o.payment_status || 'Pending',
        shipping_address: o.shipping_address,
        user_name: o.user_name || o.name || o.user?.name,
        user_phone: o.user_phone || o.phone || o.user?.phone,
        user_email: o.user_email || o.email || o.user?.email,
        items: (o.items || o.order_details || []).map((item: any) => ({
          productId: item.product_id || item.productId,
          name: item.product?.name || item.name || 'Unknown Product',
          image_url: item.product?.image_url || item.image_url,
          quantity: item.quantity,
          price: parseFloat(item.unit_price),
          color: item.product.color?.name || 'N/A',
          size: item.product.size?.name || item.size || 'N/A',
          product: item.product,
        }))
      };
    } catch (error) {
      console.log(error);
      return null;
    }
  },

  trackOrder: async (id: string | number): Promise<Order | null> => {
    try {
      const res = await fetch(`${BASE_URL}/orders/track-order/${id}`, { headers: getHeaders() });
      const data = await parseResponse(res);
      if (!res.ok || !data) return null;

      const o = data.order || data;
      return {
        id: o.id,
        order_number: o.invoice_no,
        date: o.created_at ? new Date(o.created_at).toLocaleDateString() : (o.date || '—'),
        subtotal: parseFloat(o.subtotal || 0),
        coupon_discount: parseFloat(o.coupon_discount || 0),
        shipping_charge: parseFloat(o.shipping_charge || 0),
        total: parseFloat(o.total_amount || o.total || 0),
        status: o.order_status || o.status || 'pending',
        payment_status: o.payment_status || 'Pending',
        shipping_address: o.shipping_address,
        user_name: o.user_name || o.name || o.user?.name,
        user_phone: o.user_phone || o.phone || o.user?.phone,
        user_email: o.user_email || o.email || o.user?.email,
        items: (o.items || o.order_details || []).map((item: any) => ({
          productId: item.product_id || item.productId,
          name: item.product?.name || item.name || 'Unknown Product',
          image_url: item.product?.image_url || item.image_url,
          quantity: item.quantity,
          price: parseFloat(item.unit_price || item.price),
          color: item.color,
          size: item.size?.name || item.size || 'N/A'
        }))
      };
    } catch (error) {
      return null;
    }
  },

  // --- PROFILE ---
  getUserProfile: async (): Promise<User | null> => {
    try {
      const res = await fetch(`${BASE_URL}/profile`, { headers: getHeaders() });
      const data = await parseResponse(res);
      if (!res.ok) return null;
      return data.data || data;
    } catch (error) {
      return null;
    }
  },

  updateProfile: async (data: any): Promise<User | null> => {
    try {
      const res = await fetch(`${BASE_URL}/profile`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      const result = await parseResponse(res);
      if (!res.ok) {
        showAlert(result?.message || 'Update failed');
        return null;
      }
      return result.data || result;
    } catch (error) {
      return null;
    }
  },

  // --- SETTINGS ---
  getWebsiteSettings: async (): Promise<WebsiteSettings | null> => {
    try {
      const res = await fetch(`${BASE_URL}/website-settings`, { headers: getHeaders() });
      const data = await parseResponse(res);
      if (!res.ok) return null;
      return data.data || data;
    } catch (error) {
      return null;
    }
  },

  // --- OFFERS ---
  getOffers: async (): Promise<any[]> => {
    try {
      const res = await fetch(`${BASE_URL}/offers`, { headers: getHeaders() });
      const data = await parseResponse(res);
      if (!res.ok) return [];
      return data.data || [];
    } catch (error) {
      return [];
    }
  },

  getOfferProducts: async (slug: string): Promise<any[]> => {
    try {
      const res = await fetch(`${BASE_URL}/offers/${slug}/products`, { headers: getHeaders() });
      const data = await parseResponse(res);
      if (!res.ok) return [];
      return data.data || [];
    } catch (error) {
      return [];
    }
  },
  checkOffer: async (slug: string): Promise<any[]> => {
    try {
      const res = await fetch(`${BASE_URL}/offers/check-offer/${slug}`, { headers: getHeaders() });
      const data = await parseResponse(res);
      if (!res.ok) return [];
      return data.data || [];
    } catch (error) {
      return [];
    }
  }
};
