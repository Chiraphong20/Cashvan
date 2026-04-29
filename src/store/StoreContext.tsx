import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Store, Sale, VanInventory, Visit, SaleItem, Driver, Zone, Product, Category } from '../types';

export interface SurveyTarget {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radius: number;
  color: string;
  assigned_driver_id?: string;
  status: string;
  created_at: string;
}

interface StoreContextType {
  stores: Store[];
  sales: Sale[];
  inventories: Record<string, VanInventory[]>;
  visits: Visit[];
  zones: Zone[];
  products: Product[];
  categories: Category[];
  drivers: Driver[];
  loading: boolean;
  currentDriverId: string;
  currentVehicleId: string;
  setDriverId: (id: string) => void;
  setVehicleId: (id: string) => void;
  vehicles: any[];
  addStore: (store: Store) => void;
  updateStore: (storeId: string, updates: Partial<Store>) => Promise<void>;
  deleteStore: (id: string) => Promise<void>;
  addDriver: (driver: Driver) => Promise<void>;
  updateDriver: (id: string, updates: Partial<Driver>) => Promise<void>;
  deleteDriver: (id: string) => Promise<void>;
  deleteSale: (id: string) => Promise<void>;
  recordSale: (driverId: string, storeId: string, items: SaleItem[]) => Promise<void>;
  addVisit: (visit: Partial<Visit>) => Promise<void>;
  transferStock: (locationId: string, items: VanInventory[]) => Promise<void>;
  closeDay: (driverId: string, actualStock: VanInventory[]) => Promise<any[]>;
  returnStock: (driverId: string) => Promise<void>;
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
  surveyTargets: SurveyTarget[];
  addSurveyTarget: (target: Partial<SurveyTarget>) => Promise<void>;
  deleteSurveyTarget: (id: string) => Promise<void>;
  addProduct: (product: any) => Promise<void>;
  updateProduct: (id: number, updates: any) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  fetchInventory: (locationId: string) => Promise<void>;
  fetchProductsAndCategories: () => Promise<void>;
  fetchStoreById: (id: string) => Promise<Store | null>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stores, setStores] = useState<Store[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [inventories, setInventories] = useState<Record<string, VanInventory[]>>({});
  const [visits, setVisits] = useState<Visit[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [surveyTargets, setSurveyTargets] = useState<SurveyTarget[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDriverId, setDriverId] = useState<string>(localStorage.getItem('driver_id') || 'd1');
  const [currentVehicleId, setVehicleId] = useState<string>(localStorage.getItem('vehicle_id') || '');
  const [isCollapsed, setIsCollapsed] = useState<boolean>(localStorage.getItem('sidebar_collapsed') === 'true');

  useEffect(() => {
    localStorage.setItem('vehicle_id', currentVehicleId);
  }, [currentVehicleId]);

  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', String(isCollapsed));
  }, [isCollapsed]);

  useEffect(() => {
    localStorage.setItem('driver_id', currentDriverId);
  }, [currentDriverId]);

  // Core Data Fetching Functions (using useCallback to prevent infinite loops)
  const fetchInventory = useCallback(async (locationId: string) => {
    try {
      // If no locationId, fetch MASTER inventory
      const queryParam = locationId ? `?vehicle_id=${locationId}` : '';
      const response = await fetch(`/api/inventory${queryParam}`);
      if (response.ok) {
        const data = await response.json();
        setInventories(prev => ({ ...prev, [locationId || 'MASTER']: data }));
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  }, []);

  const fetchStores = async () => {
    try {
      const response = await fetch('/api/stores');
      if (response.ok) {
        const data = await response.json();
        setStores(data);
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
    }
  };

  const fetchStoreById = async (id: string): Promise<Store | null> => {
    try {
      const response = await fetch(`/api/stores/${id}`);
      if (response.ok) {
        const fullStore = await response.json();
        // Update the store in the local state to have its photo_url
        setStores(prev => prev.map(s => s.id === id ? { ...s, photo_url: fullStore.photo_url } : s));
        return fullStore;
      }
    } catch (error) {
      console.error('Error fetching store by id:', error);
    }
    return null;
  };

  const fetchSales = async () => {
    try {
      const response = await fetch('/api/sales');
      if (response.ok) setSales(await response.json());
    } catch (error) {
      console.error('Error fetching sales:', error);
    }
  };

  const fetchProductsAndCategories = async () => {
    try {
      const [pRes, cRes] = await Promise.all([fetch('/api/products'), fetch('/api/categories')]);
      if (pRes.ok) setProducts(await pRes.json());
      if (cRes.ok) setCategories(await cRes.json());
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await fetch('/api/vehicles');
      if (response.ok) setVehicles(await response.json());
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await fetch('/api/drivers');
      if (response.ok) setDrivers(await response.json());
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  const fetchZones = async () => {
    try {
      const response = await fetch('/api/zones');
      if (response.ok) setZones(await response.json());
    } catch (error) {
      console.error('Error fetching zones:', error);
    }
  };

  const fetchVisits = async () => {
    try {
      const response = await fetch('/api/visits');
      if (response.ok) setVisits(await response.json());
    } catch (error) {
      console.error('Error fetching visits:', error);
    }
  };

  const fetchSurveyTargets = async () => {
    try {
      const response = await fetch('/api/survey-targets');
      if (response.ok) setSurveyTargets(await response.json());
    } catch (error) {
      console.error('Error fetching targets:', error);
    }
  };

  // Initial Load
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([
        fetchStores(), fetchSales(), fetchInventory(''), fetchZones(), 
        fetchProductsAndCategories(), fetchDrivers(), fetchVehicles(), fetchSurveyTargets(), fetchVisits()
      ]);
      setLoading(false);
    };
    init();
  }, [fetchInventory]);

  // Actions
  const addStore = async (store: Store) => {
    try {
      const response = await fetch('/api/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(store)
      });
      if (response.ok) await fetchStores();
    } catch (error) {
      console.error('Error adding store:', error);
    }
  };

  const updateStore = async (id: string, updates: Partial<Store>) => {
    try {
      const response = await fetch('/api/stores', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      });
      if (response.ok) await fetchStores();
    } catch (error) {
      console.error('Error updating store:', error);
    }
  };

  const deleteStore = async (id: string) => {
    try {
      await fetch(`/api/stores/${id}`, { method: 'DELETE' });
      await fetchStores();
    } catch (error) {
      console.error('Error deleting store:', error);
    }
  };

  const transferStock = async (location_id: string, items: VanInventory[]) => {
    try {
      const response = await fetch('/api/inventory/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location_id, location_type: 'VEHICLE', items })
      });
      if (response.ok) {
        await Promise.all([fetchInventory(location_id), fetchInventory('')]);
      }
    } catch (error) {
      console.error('Error transferring stock:', error);
    }
  };

  const recordSale = async (driver_id: string, store_id: string, items: SaleItem[]) => {
    try {
      const total_amount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ store_id, driver_id, vehicle_id: currentVehicleId, total_amount, items })
      });
      if (response.ok) {
        await Promise.all([fetchInventory(currentVehicleId), fetchSales(), fetchVisits()]);
      }
    } catch (error) {
      console.error('Error recording sale:', error);
    }
  };

  const deleteSale = async (id: string) => {
    if (!confirm('ยืนยันการลบบิลขายสินค้านี้? (สินค้าจะถูกคืนกลับสต็อกรถ)')) return;
    try {
      const response = await fetch(`/api/sales/${id}`, { method: 'DELETE' });
      if (response.ok) {
        await Promise.all([fetchInventory(''), fetchSales()]);
      } else {
        const err = await response.json();
        alert('เกิดข้อผิดพลาด: ' + err.error);
      }
    } catch (error) {
      console.error('Error deleting sale:', error);
    }
  };

  const addVisit = async (visit: Partial<Visit>) => {
    try {
      await fetch('/api/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...visit, driver_id: currentDriverId })
      });
      await fetchVisits();
    } catch (error) {
      console.error('Error adding visit:', error);
    }
  };

  const addSurveyTarget = async (target: Partial<SurveyTarget>) => {
    try {
      await fetch('/api/survey-targets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(target)
      });
      await fetchSurveyTargets();
    } catch (error) {
      console.error('Error adding target:', error);
    }
  };

  const deleteSurveyTarget = async (id: string) => {
    try {
      await fetch(`/api/survey-targets/${id}`, { method: 'DELETE' });
      await fetchSurveyTargets();
    } catch (error) {
      console.error('Error deleting target:', error);
    }
  };

  const addProduct = async (product: any) => {
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      if (response.ok) await fetchProductsAndCategories();
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const updateProduct = async (id: number, updates: any) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (response.ok) await fetchProductsAndCategories();
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const deleteProduct = async (id: number) => {
    if (!confirm('ยืนยันยันการลบสินค้า?')) return;
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      await fetchProductsAndCategories();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const addDriver = async (driver: Driver) => {
    try {
      await fetch('/api/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(driver)
      });
      await fetchDrivers();
    } catch (error) {
      console.error('Error adding driver:', error);
    }
  };

  const updateDriver = async (id: string, updates: Partial<Driver>) => {
    try {
      await fetch(`/api/drivers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      await fetchDrivers();
    } catch (error) {
      console.error('Error updating driver:', error);
    }
  };

  const deleteDriver = async (id: string) => {
    try {
      await fetch(`/api/drivers/${id}`, { method: 'DELETE' });
      await fetchDrivers();
    } catch (error) {
      console.error('Error deleting driver:', error);
    }
  };

  const closeDay = async (driverId: string, actualStock: VanInventory[]) => {
    // Logic for close day...
    return [];
  };

  const returnStock = async (driverId: string) => {
    await fetch('/api/inventory/return', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ driver_id: driverId })
    });
  };

  return (
    <StoreContext.Provider value={{
      stores, sales, inventories, visits, zones, products, categories, drivers, surveyTargets,
      loading, currentDriverId, currentVehicleId, setDriverId, setVehicleId, vehicles,
      addStore, updateStore, deleteStore, addDriver, updateDriver, deleteDriver,
      recordSale, deleteSale, addVisit, transferStock, closeDay, returnStock,
      isCollapsed, setIsCollapsed, addSurveyTarget, deleteSurveyTarget,
      addProduct, updateProduct, deleteProduct, fetchInventory, fetchProductsAndCategories,
      fetchStoreById
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) throw new Error('useStore must be used within a StoreProvider');
  return context;
};

export const useStoreDB = useStore;
