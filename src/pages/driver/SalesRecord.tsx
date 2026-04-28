import React, { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useStoreDB } from '../../store/StoreContext';
import { SaleItem } from '../../types';

export default function SalesRecord() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { stores, inventories, products, recordSale, currentDriverId, currentVehicleId, fetchInventory } = useStoreDB();
  
  const storeId = searchParams.get('storeId');
  const store = stores.find(s => s.id === storeId);
  
  // Fetch inventory for the vehicle if not loaded
  React.useEffect(() => {
    if (currentVehicleId) {
      fetchInventory(currentVehicleId);
    }
  }, [currentVehicleId, fetchInventory]);

  const vanStock = useMemo(() => {
    return inventories[currentVehicleId] || [];
  }, [inventories, currentVehicleId]);
  
  // State for the "Cart"
  const [cart, setCart] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Filter products that are actually in the van
  const availableProducts = useMemo(() => {
    return vanStock.map(inv => {
      const p = products.find(prod => prod.id === inv.product_id);
      if (!p) return null;
      return { ...p, stock: inv.quantity };
    }).filter((p): p is (any & { stock: number }) => p !== null);
  }, [vanStock, products]);

  const updateQuantity = (productId: number, delta: number, max: number) => {
    setCart(prev => {
      const current = prev[productId] || 0;
      const next = Math.max(0, Math.min(max, current + delta));
      if (next === 0) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [productId]: next };
    });
  };

  const cartTotal = useMemo(() => {
    return (Object.entries(cart) as [string, number][]).reduce((sum, [id, qty]) => {
      const price = products.find(p => p.id === parseInt(id))?.price || 0;
      return sum + (price * qty);
    }, 0);
  }, [cart, products]);

  const handleConfirmSale = async () => {
    if (!storeId || Object.keys(cart).length === 0) return;
    
    setIsSubmitting(true);
    const items: SaleItem[] = (Object.entries(cart) as [string, number][]).map(([id, qty]) => ({
      product_id: parseInt(id),
      quantity: qty,
      price: products.find(p => p.id === parseInt(id))?.price || 0
    }));

    await recordSale(currentDriverId, storeId, items);
    
    setIsSubmitting(false);
    setShowSuccess(true);
    setTimeout(() => {
      navigate('/driver');
    }, 2000);
  };

  if (!store) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500 font-bold">ไม่พบข้อมูลร้านค้า กรุณาเลือกจากหน้าหลัก</p>
        <button onClick={() => navigate('/driver')} className="btn-primary mt-4 py-2 px-6">กลับหน้าหลัก</button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-44 bg-slate-50 min-h-screen">
      {/* Success Overlay */}
      {showSuccess && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-secondary/90 backdrop-blur-md animate-in fade-in duration-500"></div>
          <div className="bg-white rounded-[2.5rem] p-10 flex flex-col items-center gap-6 shadow-2xl relative z-10 animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 rounded-full bg-secondary text-white flex items-center justify-center shadow-lg shadow-secondary/20">
              <span className="material-symbols-outlined text-4xl">check_circle</span>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-black text-slate-800 tracking-tighter mb-2">บันทึกการขายสำเร็จ!</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">ระบบบันทึกยอดขายและหักสต็อกในรถเรียบร้อยแล้ว</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-[1000] bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 active:scale-90 transition-transform">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="min-w-0">
            <h1 className="text-lg font-black text-blue-900 tracking-tighter truncate">{store.name}</h1>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Recording New Sale</p>
          </div>
        </div>
      </div>

      <main className="p-6 space-y-6">
        <div className="bg-blue-900 text-white rounded-[2rem] p-6 shadow-xl relative overflow-hidden">
           <div className="relative z-10">
             <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">ยอดรวมปัจจุบัน</p>
             <h2 className="text-4xl font-black font-headline tracking-tighter">฿{cartTotal.toLocaleString()}</h2>
             <p className="text-[10px] font-bold text-white/60 mt-2 flex items-center gap-1">
               <span className="material-symbols-outlined text-xs">shopping_bag</span>
               {Object.keys(cart).length} รายการในตะกร้า
             </p>
           </div>
           <div className="absolute top-0 right-0 p-6 opacity-10">
             <span className="material-symbols-outlined text-8xl">receipt_long</span>
           </div>
        </div>

        <div className="space-y-4">
           <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">สินค้าในรถของคุณ (Van Stock)</h3>
           {availableProducts.length > 0 ? (
             availableProducts.map(product => {
               const qtyInCart = cart[product.id || 0] || 0;
               return (
                 <div key={product.id} className="precision-card p-4 flex items-center gap-4 transition-all active:scale-[0.98]">
                   <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                      <span className="material-symbols-outlined">inventory_2</span>
                   </div>
                   <div className="flex-1 min-w-0">
                     <h4 className="font-bold text-sm text-slate-800 truncate">{product.name}</h4>
                     <p className="text-[10px] font-black text-primary uppercase">สต็อก: {product.stock} ชิ้น</p>
                   </div>
                   <div className="flex items-center gap-3">
                     {qtyInCart > 0 ? (
                       <>
                          <button 
                            onClick={() => updateQuantity(product.id || 0, -1, product.stock || 0)}
                            className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold"
                          >-</button>
                          <span className="text-sm font-black w-4 text-center">{qtyInCart}</span>
                          <button 
                            onClick={() => updateQuantity(product.id || 0, 1, product.stock || 0)}
                            className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold"
                          >+</button>
                       </>
                     ) : (
                       <button 
                          onClick={() => updateQuantity(product.id || 0, 1, product.stock || 0)}
                          className="bg-primary/10 text-primary px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest"
                        >เพิ่ม</button>
                     )}
                   </div>
                 </div>
               );
             })
           ) : (
             <div className="p-10 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center text-center gap-3 bg-white">
                <span className="material-symbols-outlined text-4xl text-slate-300">inventory</span>
                <div>
                  <p className="text-sm font-bold text-slate-500">ไม่มีสินค้าบนรถหน่วยนี้</p>
                  <p className="text-[10px] text-slate-400 font-medium">กรุณาเติมสต็อกสินค้าที่เมนู "ตั้งค่าระบบ/สต็อก" ก่อนครับ</p>
                </div>
             </div>
           )}
        </div>
      </main>

      {/* Footer Confirm - Moved up to clear bottom nav */}
      <div className="fixed bottom-24 left-4 right-4 z-50">
         <button 
           disabled={Object.keys(cart).length === 0 || isSubmitting}
           onClick={handleConfirmSale}
           className={`w-full py-5 rounded-3xl font-black text-xs tracking-widest uppercase shadow-xl transition-all flex items-center justify-center gap-3 ${
             Object.keys(cart).length > 0 
               ? 'bg-secondary text-white shadow-secondary/20 active:scale-95' 
               : 'bg-slate-200 text-slate-400 cursor-not-allowed'
           }`}
         >
           {isSubmitting ? (
             <span className="material-symbols-outlined animate-spin">progress_activity</span>
           ) : (
             <>
               <span className="material-symbols-outlined">{Object.keys(cart).length > 0 ? 'point_of_sale' : 'shopping_cart_checkout'}</span>
               {Object.keys(cart).length > 0 ? 'ยืนยันการบันทึกการขาย' : 'กรุณาเลือกสินค้าก่อน'}
             </>
           )}
         </button>
      </div>
    </div>
  );
}
