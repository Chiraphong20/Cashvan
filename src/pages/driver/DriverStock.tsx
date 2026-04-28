import React, { useMemo, useState } from 'react';
import { useStoreDB } from '../../store/StoreContext';

export default function DriverStock() {
  const { inventories, products, vehicles, currentVehicleId, setVehicleId, fetchInventory } = useStoreDB();
  const [searchTerm, setSearchTerm] = useState('');

  // Auto fetch inventory when vehicle is selected
  React.useEffect(() => {
    if (currentVehicleId) {
      fetchInventory(currentVehicleId);
    }
  }, [currentVehicleId, fetchInventory]);

  const currentStock = useMemo(() => {
    if (!currentVehicleId) return [];
    return (inventories[currentVehicleId] || []).filter(inv => {
      const p = products.find(prod => prod.id === inv.product_id);
      return p?.name.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [inventories, currentVehicleId, products, searchTerm]);

  const selectedVehicle = useMemo(() => {
    return vehicles.find(v => v.id === currentVehicleId);
  }, [vehicles, currentVehicleId]);

  if (!currentVehicleId) {
    return (
      <div className="min-h-screen bg-slate-900 p-8 flex flex-col justify-center animate-in fade-in duration-500">
        <div className="text-center mb-12">
           <div className="w-24 h-24 bg-primary/20 text-primary rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-5xl">local_shipping</span>
           </div>
           <h1 className="text-3xl font-black text-white tracking-tighter">เลือกรถที่จะขับวันนี้</h1>
           <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">โปรดเลือกทะเบียนรถเพื่อโหลดสต็อกสินค้า</p>
        </div>

        <div className="space-y-4">
           {vehicles.map(v => (
             <button 
              key={v.id}
              onClick={() => setVehicleId(v.id)}
              className="w-full bg-white/5 border border-white/10 p-6 rounded-[2rem] flex justify-between items-center hover:bg-primary hover:border-primary transition-all group"
             >
                <div className="flex items-center gap-4 text-left">
                   <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white group-hover:bg-white group-hover:text-primary transition-all">
                      <span className="material-symbols-outlined">directions_car</span>
                   </div>
                   <div>
                      <p className="text-xl font-black text-white">{v.plate_number}</p>
                      <p className="text-[10px] font-black text-slate-500 group-hover:text-white/60 uppercase">Code: {v.code}</p>
                   </div>
                </div>
                <span className="material-symbols-outlined text-slate-700 group-hover:text-white">arrow_forward_ios</span>
             </button>
           ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 pb-24 animate-in slide-in-from-bottom-6 duration-700">
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <span className="material-symbols-outlined text-primary text-sm">verified</span>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">รถที่กำลังใช้งาน</p>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">{selectedVehicle?.plate_number}</h1>
        </div>
        <button 
          onClick={() => setVehicleId('')}
          className="bg-white px-4 py-2 rounded-xl text-[10px] font-black text-slate-400 uppercase border border-slate-100 shadow-sm"
        >
          เปลี่ยนรถ
        </button>
      </div>

      <div className="relative mb-6">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-300">search</span>
        <input 
          type="text" 
          placeholder="ค้นหาสต็อกในรถ..." 
          className="w-full bg-white border-none rounded-2xl p-4 pl-12 text-sm font-bold shadow-sm outline-none ring-primary/20 focus:ring-2 transition-all"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {currentStock.map(inv => {
          const p = products.find(prod => prod.id === inv.product_id);
          const isLow = inv.quantity < 20;
          return (
            <div key={inv.product_id} className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isLow ? 'bg-rose-50 text-rose-500' : 'bg-slate-50 text-slate-400'}`}>
                  <span className="material-symbols-outlined">package_2</span>
                </div>
                <div>
                  <h4 className="font-black text-slate-800 text-sm">{p?.name}</h4>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">SKU: {p?.sku}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-2xl font-black ${isLow ? 'text-rose-500' : 'text-slate-900'}`}>{inv.quantity}</p>
              </div>
            </div>
          );
        })}
        {currentStock.length === 0 && (
          <div className="py-20 text-center opacity-30">
            <span className="material-symbols-outlined text-6xl">inventory_2</span>
            <p className="font-bold text-xs mt-4 uppercase tracking-widest">ไม่มีสินค้าในรถคันนี้</p>
          </div>
        )}
      </div>
    </div>
  );
}
