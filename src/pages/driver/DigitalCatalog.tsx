import React from 'react';
import { useStoreDB } from '../../store/StoreContext';

export default function DigitalCatalog() {
  const { inventories, products, currentDriverId } = useStoreDB();
  const driverId = currentDriverId;
  const currentInventory = inventories[driverId] || [];

  return (
    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-on-surface font-headline leading-tight">สต๊อกสินค้าบนรถ</h1>
          <p className="text-xs text-slate-500 font-medium tracking-tight">รายการสินค้าที่คุณมีพร้อมส่งในขณะนี้</p>
        </div>
        <div className="bg-primary/5 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-primary/10">
          Van 01
        </div>
      </div>

      <div className="space-y-4">
        {currentInventory.length > 0 ? (
          currentInventory.map(inv => {
            const product = products.find(p => p.id === inv.product_id);
            const isLow = inv.quantity < 50;
            return (
              <div key={inv.product_id} className="precision-card p-4 flex items-center gap-4 group">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 ${isLow ? 'bg-error/10 text-error' : 'bg-surface-container-high text-primary'}`}>
                  <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: isLow ? "'FILL' 1" : "'FILL' 0" }}>
                    {isLow ? 'warning_amber' : 'inventory_2'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-on-surface truncate">{product?.name || `สินค้า #${inv.product_id}`}</h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">SKU: {product?.sku || 'N/A'}</p>
                </div>
                <div className="text-right">
                  <p className={`text-xl font-black ${isLow ? 'text-error' : 'text-on-surface'}`}>
                    {inv.quantity}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">ขวด/ชิ้น</p>
                </div>
                
                {isLow && (
                  <div className="absolute top-2 right-2 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-error rounded-full animate-pulse"></span>
                    <span className="text-[8px] font-black text-error uppercase tracking-widest">Low</span>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-surface-container-low rounded-full flex items-center justify-center mx-auto text-slate-300">
              <span className="material-symbols-outlined text-4xl">inventory</span>
            </div>
            <p className="text-sm text-slate-400 font-medium whitespace-pre-line leading-relaxed">
              ไม่มีสินค้าบนรถในขณะนี้{"\n"}กรุณาติดต่อคลังสินค้าเพื่อเติมของ (Refill)
            </p>
            <button className="btn-primary py-2 px-6 text-xs mt-4">
              ส่งคำขอเติมสินค้า
            </button>
          </div>
        )}
      </div>

      {/* Quick Summary Banner */}
      {currentInventory.length > 0 && (
        <div className="precision-card bg-primary text-on-primary p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <span className="material-symbols-outlined">info</span>
             <p className="text-xs font-bold leading-tight">คุณมีสินค้าพร้อมส่งรวม {currentInventory.reduce((s, i) => s + i.quantity, 0)} ชิ้น</p>
          </div>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
        </div>
      )}
    </div>
  );
}
