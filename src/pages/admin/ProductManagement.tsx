import React, { useState } from 'react';
import { useStoreDB } from '../../store/StoreContext';
import { Product } from '../../types';

export default function ProductManagement() {
  const { products, categories, addProduct, updateProduct, deleteProduct } = useStoreDB() as any;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  
  // Modal States
  const [modalOpen, setModalOpen] = useState<'add' | 'edit' | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: '', sku: '', category_id: 1, price: 0 });

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAdd = () => {
    setEditingProduct(null);
    setForm({ name: '', sku: '', category_id: 1, price: 0 });
    setModalOpen('add');
  };

  const handleEdit = (p: Product) => {
    setEditingProduct(p);
    setForm({ name: p.name, sku: p.sku, category_id: p.category_id, price: Number(p.price) });
    setModalOpen('edit');
  };

  const handleSubmit = async () => {
    if (modalOpen === 'add') {
      await addProduct(form);
    } else if (editingProduct) {
      await updateProduct(editingProduct.id, form);
    }
    setModalOpen(null);
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-on-surface tracking-tighter">Product Catalog</h1>
          <p className="text-slate-400 font-bold mt-2 uppercase tracking-widest text-xs">Manage your master product list</p>
        </div>
        <button 
          onClick={handleAdd}
          className="bg-primary text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-xl shadow-primary/20 flex items-center gap-2"
        >
          <span className="material-symbols-outlined">add</span>
          เพิ่มสินค้าใหม่
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-wrap gap-4 items-center">
        <div className="flex-1 relative min-w-[300px]">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">search</span>
          <input 
            type="text" 
            placeholder="ค้นหาด้วยชื่อ หรือ SKU..."
            className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold outline-none focus:ring-2 ring-primary/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setSelectedCategory('all')}
            className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedCategory === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
          >
            ทั้งหมด
          </button>
          {categories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedCategory === cat.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">ข้อมูลสินค้า</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">หมวดหมู่</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">ราคา</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(product => {
              const category = categories.find(c => c.id === product.category_id);
              return (
                <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6 border-b border-slate-50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                        <span className="material-symbols-outlined">shopping_bag</span>
                      </div>
                      <div>
                        <p className="font-black text-on-surface">{product.name}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">SKU: {product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 border-b border-slate-50">
                    <span className="px-4 py-2 bg-slate-100 rounded-full text-[9px] font-black text-slate-500 uppercase tracking-widest">
                      {category?.name || 'N/A'}
                    </span>
                  </td>
                  <td className="px-8 py-6 border-b border-slate-50">
                    <p className="font-black text-emerald-600">฿{Number(product.price).toFixed(2)}</p>
                  </td>
                  <td className="px-8 py-6 border-b border-slate-50 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(product)} className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all">
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                      <button onClick={() => deleteProduct(product.id)} className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:bg-rose-500 hover:text-white transition-all">
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
           <div className="bg-white rounded-[3rem] w-full max-w-lg p-10 shadow-2xl space-y-8 animate-in zoom-in-95 duration-300">
              <div>
                 <h3 className="text-3xl font-black text-slate-900 tracking-tighter">
                   {modalOpen === 'add' ? 'เพิ่มสินค้าใหม่' : 'แก้ไขข้อมูลสินค้า'}
                 </h3>
              </div>
              <div className="grid grid-cols-2 gap-6">
                 <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1">ชื่อสินค้า</label>
                    <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold outline-none focus:ring-2 ring-primary/20" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1">SKU</label>
                    <input type="text" value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold outline-none focus:ring-2 ring-primary/20" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1">ราคา (฿)</label>
                    <input type="number" value={form.price} onChange={e => setForm({...form, price: Number(e.target.value)})} className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold outline-none focus:ring-2 ring-primary/20" />
                 </div>
                 <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1">หมวดหมู่</label>
                    <select value={form.category_id} onChange={e => setForm({...form, category_id: Number(e.target.value)})} className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold outline-none focus:ring-2 ring-primary/20">
                       {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                 </div>
              </div>
              <div className="flex gap-4">
                 <button onClick={handleSubmit} className="flex-1 bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-xs shadow-xl active:scale-95 transition-all">บันทึกข้อมูล</button>
                 <button onClick={() => setModalOpen(null)} className="px-8 bg-slate-100 text-slate-400 py-5 rounded-2xl font-black uppercase text-xs">ยกเลิก</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
