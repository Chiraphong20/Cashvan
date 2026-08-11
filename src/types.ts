export interface Store {
  id: string;
  name: string;
  address: string;
  additional_info?: string;
  lat: number;
  lng: number;
  type: string;
  sub_district_id: number;
  interested_products: StoreProduct[];
  created_at: string;
  created_by?: string;
  last_visited_at?: string;
  is_visited?: boolean;
  status: 'UNSURVEYED' | 'SUCCESS' | 'NOT_FOUND';
  sales_zone?: string;
  photo_url?: string;
  verification_status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  discrepancy_reason?: string;
  is_admin_only?: boolean;
  is_customer?: boolean;
  phone?: string;
  district_name?: string;
  sub_district_name?: string;
  assigned_driver_id?: string;
}

export interface Driver {
  id: string;
  name: string;
  vehicle_plate: string;
  vehicle_code: string;
  phone?: string;
  work_status?: 'ONLINE' | 'OFFLINE';
  assigned_zone?: string;
  avatar_url?: string;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  category_id: number;
  price: number;
  wholesale_price?: number;
  unit?: string;
  image?: string;
  barcode?: string;
  pos_product_id?: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface StoreProduct {
  product_id: number;
  interest_type: 'buy' | 'sell';
}

export interface Zone {
  id: number;
  name_th: string;
  parent_id?: number; // For districts/sub-districts
}

export interface SaleItem {
  product_id: number;
  quantity: number;
  price: number;
}

export interface Sale {
  id: string;
  store_id: string;
  driver_id: string;
  total_amount: number;
  items: SaleItem[];
  created_at: string;
}

export interface VanInventory {
  product_id: number;
  quantity: number;
}

export interface Visit {
  id: string;
  store_id: string;
  driver_id: string;
  visited_at: string;
  notes?: string;
  photo_url?: string;
  status: 'SUCCESS' | 'FAILED' | 'CLOSED';
}
