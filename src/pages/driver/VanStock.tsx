import React from 'react';
import { useStoreDB } from '../../store/StoreContext';

export default function VanStock() {
  const { inventories, loading } = useStoreDB();
  const driverId = 'd1'; // Mock driver
  const myStock = inventories[driverId] || [];

  if (loading) return <div className="p-8 text-center text-slate-500">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h1 className="text-2xl font-black text-blue-900 tracking-tighter">สต็อกสินค้าบนรถ</h1>
          <p className="text-slate-500 text-sm mt-1">สินค้าที่พร้อมจำหน่ายในวันนี้</p>
        </div>
        <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">
          {myStock.length} รายการ
        </div>
      </div>
      
      <div className="space-y-4">
        {myStock.map(item => (
          <div key={item.product_id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
             <div>
               <p className="font-bold text-slate-700">รหัสสินค้า: {item.product_id}</p>
             </div>
             <div className="text-right">
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">คงเหลือ</p>
               <p className="text-xl font-black text-secondary">{item.quantity}</p>
             </div>
          </div>
        ))}
        {myStock.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <span className="material-symbols-outlined text-4xl mb-2 opacity-50">inventory_2</span>
            <p>ยังไม่มีสินค้าในรถ</p>
          </div>
        )}
      </div>
    </div>
  );
}
