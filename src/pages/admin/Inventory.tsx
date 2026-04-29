import React, { useState, useMemo } from 'react';
import { useStoreDB } from '../../store/StoreContext';

export default function Inventory() {
  const { inventories, products, categories, vehicles, transferStock, fetchInventory, addProduct, updateInventory } = useStoreDB() as any;
  const [activeTab, setActiveTab] = useState<'vans' | 'master'>('vans');
  const [selectedVehicle, setSelectedVehicle] = useState('V-01');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selection States for Bulk Transfer
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [transferTargetVehicle, setTransferTargetVehicle] = useState('V-01');
  const [bulkQuantity, setBulkQuantity] = useState(100);
  const [isTransferring, setIsTransferring] = useState(false);

  // New Product Modal State
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProductForm, setNewProductForm] = useState({ name: '', sku: '', category_id: 1, price: 0 });

  // Editing Stock Modal
  const [editingInventory, setEditingInventory] = useState<{product_id: number, name: string, current: number, location: string} | null>(null);
  const [newQuantity, setNewQuantity] = useState(0);

  // Sync with Database on load or selection change
  React.useEffect(() => {
    if (activeTab === 'vans' && selectedVehicle) {
      fetchInventory(selectedVehicle);
    } else if (activeTab === 'master') {
      fetchInventory(''); // MASTER
    }
  }, [selectedVehicle, activeTab, fetchInventory]);

  const toggleProductSelection = (id: number) => {
    setSelectedProductIds(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const handleBulkTransfer = async () => {
    if (selectedProductIds.length === 0) return;
    setIsTransferring(true);
    
    const transferItems = selectedProductIds.map(id => ({
      product_id: id,
      quantity: bulkQuantity
    }));

    await transferStock(transferTargetVehicle, transferItems);
    
    setSelectedProductIds([]);
    setIsTransferring(false);
    alert(`โอนย้ายสินค้า ${transferItems.length} รายการไปยังรถ ${transferTargetVehicle} เรียบร้อยแล้ว!`);
  };

  const handleCreateProduct = async () => {
    if (!newProductForm.name || !newProductForm.sku) {
       alert('กรุณากรอกข้อมูลให้ครบถ้วน');
       return;
    }
    await addProduct(newProductForm);
    setIsAddingProduct(false);
    setNewProductForm({ name: '', sku: '', category_id: 1, price: 0 });
  };

  const handleUpdateStock = async () => {
    if (!editingInventory) return;
    await updateInventory(editingInventory.product_id, editingInventory.location, newQuantity);
    setEditingInventory(null);
  };

  const currentVanStock = useMemo(() => {
    const rawStock = inventories[selectedVehicle] || [];
    return rawStock.filter(inv => {
      const p = products.find((prod: any) => prod.id === inv.product_id);
      return p?.name.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [inventories, selectedVehicle, searchQuery, products]);

  const filteredMasterProducts = useMemo(() => {
    return products.filter((p: any) => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.sku.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700 pb-32">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-on-surface tracking-tighter">Stock Operations</h1>
          <p className="text-slate-400 font-bold mt-2 uppercase tracking-widest text-xs">Manage Distribution & Van Refills</p>
        </div>
        <div className="flex gap-2 bg-slate-100 p-1.5 rounded-[2rem]">
          <button 
            onClick={() => setActiveTab('vans')}
            className={`px-8 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'vans' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Monitor Vans
          </button>
          <button 
            onClick={() => setActiveTab('master')}
            className={`px-8 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'master' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Refill Center
          </button>
        </div>
      </div>

      {activeTab === 'vans' ? (
        <div className="space-y-6">
           <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                       <span className="material-symbols-outlined">local_shipping</span>
                    </div>
                    <div>
                       <select 
                         className="bg-transparent border-none text-xl font-black text-slate-900 outline-none cursor-pointer p-0"
                         value={selectedVehicle}
                         onChange={e => setSelectedVehicle(e.target.value)}
                       >
                          {vehicles.map((v: any) => <option key={v.id} value={v.id}>{v.plate_number} ({v.code})</option>)}
                       </select>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Stock in Vehicle</p>
                    </div>
                 </div>
                 <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Search items in van..." 
                      className="bg-white border border-slate-100 rounded-2xl py-3 pl-10 pr-4 text-xs font-bold outline-none ring-primary/20 focus:ring-2 w-64 shadow-sm"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-sm">search</span>
                 </div>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentVanStock.map((inv: any) => {
                    const p = products.find((prod: any) => prod.id === inv.product_id);
                    return (
                      <div key={inv.product_id} className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100/50 flex justify-between items-center group hover:bg-white hover:shadow-xl transition-all duration-500">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                               <span className="material-symbols-outlined">package_2</span>
                            </div>
                            <div>
                               <p className="font-black text-slate-800 text-sm leading-tight">{p?.name}</p>
                               <span className="text-[9px] font-black text-slate-400">SKU: {p?.sku}</span>
                            </div>
                         </div>
                         <div className="flex items-center gap-4">
                            <div className="text-right">
                               <p className="text-2xl font-black text-slate-900">{inv.quantity}</p>
                            </div>
                            <button 
                              onClick={() => {
                                setEditingInventory({ product_id: inv.product_id, name: p?.name || '', current: inv.quantity, location: selectedVehicle });
                                setNewQuantity(inv.quantity);
                              }}
                              className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white hover:border-primary transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                            >
                               <span className="material-symbols-outlined text-sm">edit</span>
                            </button>
                         </div>
                      </div>
                    );
                  })}
                  {currentVanStock.length === 0 && (
                    <div className="col-span-full py-20 text-center opacity-30">
                       <span className="material-symbols-outlined text-6xl">inventory_2</span>
                       <p className="font-black uppercase tracking-[0.2em] text-xs mt-4">ไม่มีสินค้าในรถคันนี้</p>
                    </div>
                  )}
              </div>
           </div>
        </div>
      ) : (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-wrap gap-4 items-center">
               <div className="flex-1 relative min-w-[300px]">
                 <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">search</span>
                 <input 
                   type="text" 
                   placeholder="ค้นหาแคตตาล็อกสินค้า..."
                   className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold outline-none focus:ring-2 ring-primary/20"
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                 />
               </div>
               <button 
                 onClick={() => setIsAddingProduct(true)}
                 className="bg-primary text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2"
               >
                 <span className="material-symbols-outlined text-sm">add_circle</span>
                 เพิ่มสินค้าใหม่
               </button>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden transition-all duration-500">
               <table className="w-full text-left">
                  <thead>
                     <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="px-8 py-6 w-16">
                           <input 
                             type="checkbox" 
                             className="w-5 h-5 rounded-lg accent-primary" 
                             checked={selectedProductIds.length === filteredMasterProducts.length && filteredMasterProducts.length > 0}
                             onChange={() => {
                               if (selectedProductIds.length === filteredMasterProducts.length) {
                                 setSelectedProductIds([]);
                               } else {
                                 setSelectedProductIds(filteredMasterProducts.map((p: any) => p.id));
                               }
                             }}
                           />
                        </th>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Info</th>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Master Stock</th>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                     </tr>
                  </thead>
                  <tbody>
                     {filteredMasterProducts.map((p: any) => {
                        const cat = categories.find((c: any) => c.id === p.category_id);
                        const isSelected = selectedProductIds.includes(p.id);
                        const masterStock = inventories['MASTER']?.find((inv: any) => inv.product_id === p.id)?.quantity || 0;
                        return (
                           <tr key={p.id} className={`border-b border-slate-50 transition-all ${isSelected ? 'bg-primary/5' : 'hover:bg-slate-50/50'}`}>
                              <td className="px-8 py-6">
                                 <input 
                                   type="checkbox" 
                                   className="w-5 h-5 rounded-lg accent-primary" 
                                   checked={isSelected}
                                   onChange={() => toggleProductSelection(p.id)}
                                 />
                              </td>
                              <td className="px-8 py-6 uppercase">
                                 <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isSelected ? 'bg-primary text-white scale-110 shadow-lg' : 'bg-slate-100 text-slate-300'}`}>
                                       <span className="material-symbols-outlined text-sm">inventory</span>
                                    </div>
                                    <div>
                                       <p className="font-black text-slate-800 text-sm leading-tight">{p.name}</p>
                                       <p className="text-[9px] font-black text-slate-400">ID: {p.sku}</p>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-8 py-6">
                                 <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-colors ${isSelected ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-500'}`}>
                                    {cat?.name || 'Uncategorized'}
                                 </span>
                              </td>
                              <td className="px-8 py-6">
                                 <p className="font-black text-slate-800">{masterStock} <small className="text-slate-400">ชิ้น</small></p>
                              </td>
                              <td className="px-8 py-6">
                                 <button 
                                   onClick={() => {
                                     setEditingInventory({ product_id: p.id, name: p.name, current: masterStock, location: '' });
                                     setNewQuantity(masterStock);
                                   }}
                                   className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase shadow-lg shadow-slate-900/10 hover:-translate-y-0.5 transition-all"
                                 >
                                   <span className="material-symbols-outlined text-sm">add</span>
                                   เติมสต็อกหลัก
                                 </button>
                              </td>
                           </tr>
                        );
                     })}
                  </tbody>
               </table>
            </div>
        </div>
      )}

      {/* New Product Modal */}
      {isAddingProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[4000] flex items-center justify-center p-4">
           <div className="bg-white rounded-[3rem] w-full max-w-lg p-10 shadow-2xl space-y-8 animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center">
                 <h3 className="text-3xl font-black text-slate-900 tracking-tighter">เพิ่มสินค้าใหม่</h3>
                 <button onClick={() => setIsAddingProduct(false)} className="w-10 h-10 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors">
                    <span className="material-symbols-outlined">close</span>
                 </button>
              </div>
              <div className="grid grid-cols-2 gap-6">
                 <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1">ชื่อสินค้า</label>
                    <input type="text" placeholder="เช่น น้ำดื่มสิงห์ 600ml" value={newProductForm.name} onChange={e => setNewProductForm({...newProductForm, name: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold outline-none focus:ring-2 ring-primary/20" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1">SKU / รหัสสินค้า</label>
                    <input type="text" placeholder="เช่น DR-001" value={newProductForm.sku} onChange={e => setNewProductForm({...newProductForm, sku: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold outline-none focus:ring-2 ring-primary/20" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1">ราคาขาย (฿)</label>
                    <input type="number" placeholder="0.00" value={newProductForm.price} onChange={e => setNewProductForm({...newProductForm, price: Number(e.target.value)})} className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold outline-none focus:ring-2 ring-primary/20" />
                 </div>
                 <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1">หมวดหมู่</label>
                    <select value={newProductForm.category_id} onChange={e => setNewProductForm({...newProductForm, category_id: Number(e.target.value)})} className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold outline-none focus:ring-2 ring-primary/20">
                       {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                 </div>
              </div>
              <div className="flex gap-4">
                 <button onClick={handleCreateProduct} className="flex-1 bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-xs shadow-xl active:scale-95 transition-all">สร้างสินค้า</button>
                 <button onClick={() => setIsAddingProduct(false)} className="px-8 bg-slate-100 text-slate-400 py-5 rounded-2xl font-black uppercase text-xs">ยกเลิก</button>
              </div>
           </div>
        </div>
      )}

      {/* Editing Stock Modal */}
      {editingInventory && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[3000] flex items-center justify-center p-4">
           <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center mb-6">
                 <div>
                    <h3 className="text-xl font-black text-slate-800 leading-none">ปรับปรุงจำนวนสต็อก</h3>
                    <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">
                       {editingInventory.location ? `รถทะเบียน: ${vehicles.find((v: any) => v.id === editingInventory.location)?.plate_number}` : 'สต็อกส่วนกลาง (MASTER)'}
                    </p>
                 </div>
                 <button onClick={() => setEditingInventory(null)} className="w-10 h-10 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors">
                    <span className="material-symbols-outlined">close</span>
                 </button>
              </div>

              <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 mb-6">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">สินค้า</p>
                 <p className="text-lg font-black text-slate-800">{editingInventory.name}</p>
                 <div className="flex justify-between items-center mt-4 pt-4 border-t border-dashed border-slate-200">
                    <span className="text-xs font-bold text-slate-500">จำนวนปัจจุบัน</span>
                    <span className="text-xl font-black text-slate-900">{editingInventory.current} ชิ้น</span>
                 </div>
              </div>

              <div className="space-y-2 mb-8">
                 <label className="text-[10px] font-black uppercase text-slate-400 ml-1">ระบุจำนวนใหม่</label>
                 <div className="relative">
                    <input 
                      type="number" 
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-6 text-3xl font-black outline-none focus:border-primary/30 transition-all"
                      value={newQuantity}
                      onChange={e => setNewQuantity(parseInt(e.target.value) || 0)}
                      autoFocus
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 flex gap-2">
                       <button onClick={() => setNewQuantity(q => q + 10)} className="w-8 h-8 bg-white border border-slate-200 rounded-lg text-xs font-black hover:bg-slate-50 active:scale-95">+</button>
                       <button onClick={() => setNewQuantity(q => Math.max(0, q - 10))} className="w-8 h-8 bg-white border border-slate-200 rounded-lg text-xs font-black hover:bg-slate-50 active:scale-95">-</button>
                    </div>
                 </div>
              </div>

              <button 
                onClick={handleUpdateStock}
                className="w-full bg-primary text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all active:scale-95"
              >
                 ยืนยันการแก้ไขสต็อก
              </button>
           </div>
        </div>
      )}

      {/* Floating Refill Control Bar */}
      {selectedProductIds.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[2000] w-[90%] max-w-5xl animate-in slide-in-from-bottom-10 h-24">
           <div className="bg-slate-900 border border-white/10 rounded-[2.5rem] p-4 pr-6 flex items-center shadow-2xl h-full backdrop-blur-xl">
              <div className="flex items-center gap-6 px-4 border-r border-white/10">
                 <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white font-black text-lg">
                    {selectedProductIds.length}
                 </div>
                 <div>
                    <p className="text-white font-black text-sm">รายการที่เลือก</p>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Multi-Refill Mode</p>
                 </div>
              </div>

              <div className="flex-1 flex px-8 gap-8 items-center">
                 <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase ml-1">โอนลงรถทะเบียน</label>
                    <select 
                      className="bg-white/5 border-none text-white font-black text-xs outline-none cursor-pointer focus:ring-1 ring-primary/30 p-2 rounded-xl min-w-[200px]"
                      value={transferTargetVehicle}
                      onChange={e => setTransferTargetVehicle(e.target.value)}
                    >
                       {vehicles.map((v: any) => <option key={v.id} value={v.id} className="text-on-surface">{v.plate_number} ({v.code})</option>)}
                    </select>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase ml-1">จำนวนต่อรายการ</label>
                    <div className="flex items-center gap-3">
                       <input 
                        type="number" 
                        className="bg-white/5 border-none text-white font-black text-xl outline-none w-24 p-2 rounded-xl focus:ring-1 ring-primary/30"
                        value={bulkQuantity}
                        onChange={e => setBulkQuantity(parseInt(e.target.value) || 0)}
                       />
                       <div className="flex gap-1">
                          <button onClick={() => setBulkQuantity(q => q + 50)} className="text-[9px] p-2 bg-white/5 rounded-lg text-slate-400 hover:text-white">+</button>
                          <button onClick={() => setBulkQuantity(q => Math.max(0, q - 50))} className="text-[9px] p-2 bg-white/5 rounded-lg text-slate-400 hover:text-white">-</button>
                       </div>
                    </div>
                 </div>
              </div>

              <button 
                onClick={handleBulkTransfer}
                disabled={isTransferring}
                className="bg-primary hover:bg-primary-hover text-white px-10 py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] shadow-xl shadow-primary/20 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                 {isTransferring ? 'กำลังโอนย้าย...' : 'ยืนยันการเติมสินค้าลงรถ'}
                 <span className="material-symbols-outlined text-sm">local_shipping</span>
              </button>
           </div>
        </div>
      )}
    </div>
  );
}
