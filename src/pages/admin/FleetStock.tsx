import React, { useState, useMemo } from 'react';
import { useStoreDB } from '../../store/StoreContext';

export default function FleetStock() {
  const { inventories, drivers, products, transferStock } = useStoreDB();
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [isAddingStock, setIsAddingStock] = useState(false);
  const [newItem, setNewItem] = useState({ product_id: 0, quantity: 0 });

  const selectedDriver = drivers.find(d => d.id === selectedDriverId);
  const driverStock = useMemo(() => {
    if (!selectedDriverId) return [];
    return inventories[selectedDriverId] || [];
  }, [inventories, selectedDriverId]);

  const handleAddStock = async () => {
    if (!selectedDriverId || newItem.product_id === 0 || newItem.quantity <= 0) return;
    
    // In a real system, you'd send an array, but here we'll just transfer one item for simplicity
    await transferStock(selectedDriverId, [
      { product_id: newItem.product_id, quantity: newItem.quantity, location_id: selectedDriverId, location_type: 'VAN' }
    ]);
    setIsAddingStock(false);
    setNewItem({ product_id: 0, quantity: 0 });
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 font-body outline-none">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-on-surface tracking-tighter">สต็อกสินค้าในรถ (Fleet)</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Manage unit inventory and re-stocking operations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left: Driver/Van List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">เลือกหน่วยรถที่ต้องการดู</h3>
          {drivers.map(driver => (
            <button
              key={driver.id}
              onClick={() => setSelectedDriverId(driver.id)}
              className={`w-full p-6 rounded-[2rem] border transition-all text-left group relative overflow-hidden ${
                selectedDriverId === driver.id 
                  ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-900/20' 
                  : 'bg-white border-slate-100 text-slate-600 hover:border-primary/30'
              }`}
            >
              <div className="flex items-center gap-4 relative z-10">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs ${
                  selectedDriverId === driver.id ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'
                }`}>
                  {driver.name.slice(0, 1)}
                </div>
                <div>
                  <p className="font-black text-sm">{driver.name}</p>
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${selectedDriverId === driver.id ? 'text-white/40' : 'text-slate-400'}`}>
                    {driver.assigned_zone}
                  </p>
                </div>
              </div>
              <div className={`absolute top-0 right-0 p-4 material-symbols-outlined text-4xl opacity-10 ${selectedDriverId === driver.id ? 'text-white' : 'text-slate-200'}`}>
                local_shipping
              </div>
            </button>
          ))}
        </div>

        {/* Right: Stock Detail & Actions */}
        <div className="lg:col-span-3">
          {selectedDriver ? (
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col min-h-[600px]">
              <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center shrink-0">
                 <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-3xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                       <span className="material-symbols-outlined text-3xl">inventory_2</span>
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-on-surface tracking-tight leading-none">สินค้าบนรถ - {selectedDriver.name}</h3>
                       <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest">Active Inventory Management</p>
                    </div>
                 </div>
                 <button 
                  onClick={() => setIsAddingStock(true)}
                  className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-black/10 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
                 >
                   <span className="material-symbols-outlined text-base">add_box</span>
                   เติมสต็อกเข้ารองเท้า
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {driverStock.map(item => {
                      const product = products.find(p => p.id === item.product_id);
                      return (
                        <div key={item.id} className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem] flex justify-between items-center group hover:bg-white hover:shadow-md transition-all">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-slate-400 font-black text-xs shadow-sm border border-slate-100 transition-colors group-hover:text-primary">
                                 {product?.sku.slice(0, 2) || 'SK'}
                              </div>
                              <div>
                                 <h4 className="font-bold text-sm text-slate-800">{product?.name || 'Unknown'}</h4>
                                 <p className="text-[10px] font-bold text-slate-400">{product?.sku}</p>
                              </div>
                           </div>
                           <div className="text-right">
                              <p className="text-xl font-black text-primary">{item.quantity.toLocaleString()}</p>
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">ชิ้นบนรถ</p>
                           </div>
                        </div>
                      );
                    })}

                    {driverStock.length === 0 && (
                      <div className="col-span-full py-32 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-100">
                         <span className="material-symbols-outlined text-5xl text-slate-200 mb-2">inventory</span>
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">ยังไม่มีรายการสินค้าบนรถคันนี้</p>
                      </div>
                    )}
                 </div>
              </div>

              <div className="p-8 bg-slate-50 border-t border-slate-100 shrink-0">
                 <div className="bg-white p-4 rounded-2xl border border-slate-200 flex justify-between items-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">สรุปรายการสต็อกรวม</p>
                    <p className="font-black text-on-surface">{driverStock.reduce((acc, curr) => acc + curr.quantity, 0)} ชิ้น</p>
                 </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[2.5rem] border border-slate-100 h-full min-h-[600px] flex flex-col items-center justify-center text-center p-12">
               <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-6xl text-slate-200 animate-pulse">local_shipping</span>
               </div>
               <h3 className="text-xl font-black text-on-surface tracking-tight mb-2">กรุณาเลือกหน่วยรถ</h3>
               <p className="text-sm text-slate-400 font-medium max-w-xs leading-relaxed">เลือกพนักงานจากรายการด้านซ้ายเพื่อตรวจสอบ และจัดการสต็อกสินค้าที่อยู่บนรถในปัจจุบัน</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Stock Modal */}
      {isAddingStock && selectedDriver && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[10000] flex items-center justify-center p-4 animate-in fade-in duration-300">
           <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden flex flex-col shadow-2xl scale-in-center">
              <div className="p-8 border-b bg-primary flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-2xl">add_box</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white tracking-tight leading-none">เติมสต็อกสินค้า</h3>
                    <p className="text-[10px] text-white/60 font-bold uppercase mt-1 tracking-widest">หน่วยรถ: {selectedDriver.name}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-8 space-y-6">
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">เลือกตัวเลือกสินค้า</label>
                    <select 
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold focus:border-primary outline-none transition-all appearance-none"
                      value={newItem.product_id}
                      onChange={(e) => setNewItem({...newItem, product_id: parseInt(e.target.value)})}
                    >
                      <option value="0">เลือกสินค้า...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                      ))}
                    </select>
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">จำนวนสต็อกที่จะโอนเข้า (ชิ้น)</label>
                    <input 
                      type="number" 
                      placeholder="เช่น 100" 
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold focus:border-primary outline-none transition-all"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value) || 0})}
                    />
                 </div>
              </div>

              <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-3">
                 <button 
                  onClick={handleAddStock}
                  className="flex-1 bg-primary text-white font-black py-4 rounded-2xl shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all text-xs uppercase tracking-widest"
                 >
                   ยืนยันรายการเติมสต็อก
                 </button>
                 <button 
                  onClick={() => setIsAddingStock(false)}
                  className="px-8 bg-white text-slate-400 font-bold py-4 rounded-2xl border border-slate-200 hover:bg-slate-100 transition-all text-xs uppercase"
                 >
                   ยกเลิก
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
