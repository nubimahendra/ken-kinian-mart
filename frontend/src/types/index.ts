// =============================================
// API Response
// =============================================
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedData<T> {
  current_page: number;
  data: T[];
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

// =============================================
// Auth
// =============================================
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface AuthData {
  user: User;
  token: string;
  token_type: string;
  expires_in: number;
}

// =============================================
// Product & Category
// =============================================
export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  description: string | null;
  price: string;
  cost_price: string;
  stock: number;
  weight: number;
  length: number | null;
  width: number | null;
  height: number | null;
  image: string | null;
  created_at: string;
  updated_at: string;
  category?: Category;
}

// =============================================
// Cart
// =============================================
export interface CartItem {
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  weight: number;
  image: string | null;
  slug: string;
  stock: number;
}

// =============================================
// Order
// =============================================
export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: string;
  product?: Product;
}

export interface Order {
  id: number;
  user_id: number;
  invoice_number: string;
  total_price: string;
  shipping_cost: string;
  shipping_zone: string;
  status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';
  payment_status: 'unpaid' | 'paid';
  snap_token: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

// =============================================
// Shipping
// =============================================
export interface ShippingZone {
  id: number;
  name: string;
  price_per_kg: string;
  created_at: string;
  updated_at: string;
}
