import React, { useState, useMemo } from 'react';
import { useStoreDB } from '../../store/StoreContext';
import { useNavigate } from 'react-router-dom';

export default function DriverStoreList() {
  const { stores, currentDriverId } = useStoreDB();
  const [searchTerm, setSearchTerm] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [subDistrictFilter, setSubDistrictFilter] = useState('');
  const [activeTab, setActiveTab] = useState<'PENDING' | 'DONE'>('PENDING');
  const navigate = useNavigate();

  // 1. Base visibility filter (Admin-only and NOT_FOUND items are hidden from drivers)
  const visibleStores = useMemo(() => {
    return stores.filter(s => !s.is_admin_only && s.status !== 'NOT_FOUND');
  }, [stores]);

  // 2. Filter by search and location (applies to both tab counts and the active list)
  const filteredBySearchAndLocation = useMemo(() => {
    return visibleStores.filter(store => {
      const matchesSearch = !searchTerm || store.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDistrict = !districtFilter || store.district_name === districtFilter;
      const matchesSubDistrict = !subDistrictFilter || store.sub_district_name === subDistrictFilter;
      return matchesSearch && matchesDistrict && matchesSubDistrict;
    });
  }, [visibleStores, searchTerm, districtFilter, subDistrictFilter]);

  // 3. Separate the lists for each tab based on status
  const pendingStores = useMemo(() => 
    filteredBySearchAndLocation.filter(s => s.status !== 'SUCCESS')
  , [filteredBySearchAndLocation]);

  const doneStores = useMemo(() => 
    filteredBySearchAndLocation.filter(s => s.status === 'SUCCESS')
  , [filteredBySearchAndLocation]);

  // 4. Final list to display based on active tab
  const filteredStores = activeTab === 'PENDING' ? pendingStores : doneStores;

  const districts = useMemo(() => [...new Set(stores.map(s => s.district_name).filter(Boolean))], [stores]);
  const subDistricts = useMemo(() => {
    if (!districtFilter) return [];
    return [...new Set(stores.filter(s => s.district_name === districtFilter).map(s => s.sub_district_name).filter(Boolean))];
  }, [stores, districtFilter]);

  return (
    <div className="min-h-screen bg-slate-50 pb-32 font-body">
      {/* Header Area */}
      <div className="bg-white px-6 pt-12 pb-6 border-b border-slate-100 shadow-sm sticky top-0 z-10">
        <div className="flex justify-between items-center mb-6">
           <div>
             <h1 className="text-2xl font-black text-on-surface tracking-tighter">รายชื่อร้านค้า</h1>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Management & Sales</p>
           </div>
           <button 
            onClick={() => navigate('/driver/check-in?new=true')}
            className="px-4 py-2 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 flex items-center gap-2 active:scale-95 transition-all"
           >
             <span className="material-symbols-outlined text-sm">add_business</span>
             เพิ่มร้านใหม่
           </button>
        </div>

        {/* Search & Tabs */}
        <div className="space-y-4">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">search</span>
            <input 
              type="text" 
              placeholder="ค้นหาชื่อร้าน..." 
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold outline-none focus:border-primary/30 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex bg-slate-100 p-1.5 rounded-2xl">
             <button 
              onClick={() => setActiveTab('PENDING')}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'PENDING' ? 'bg-white text-rose-500 shadow-sm' : 'text-slate-400'}`}
             >
               รอดำเนินการ ({pendingStores.length})
             </button>
             <button 
              onClick={() => setActiveTab('DONE')}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'DONE' ? 'bg-white text-secondary shadow-sm' : 'text-slate-400'}`}
             >
               สำรวจแล้ว ({doneStores.length})
             </button>
          </div>

          <div className="flex gap-2">
             <select 
              className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-2 text-[10px] font-bold outline-none"
              value={districtFilter}
              onChange={(e) => { setDistrictFilter(e.target.value); setSubDistrictFilter(''); }}
             >
               <option value="">ทุกอำเภอ</option>
               {districts.map(d => <option key={d} value={d!}>{d}</option>)}
             </select>
             <select 
              className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-2 text-[10px] font-bold outline-none"
              value={subDistrictFilter}
              onChange={(e) => setSubDistrictFilter(e.target.value)}
             >
               <option value="">ทุกตำบล</option>
               {subDistricts.map(sd => <option key={sd} value={sd!}>{sd}</option>)}
             </select>
          </div>
        </div>
      </div>

      {/* Main List */}
      <div className="p-6 space-y-4">
        {filteredStores.map(store => {
          const isSurveyed = store.status === 'SUCCESS';
          return (
          <div 
            key={store.id} 
            onClick={() => navigate(isSurveyed ? `/driver/sales?storeId=${store.id}` : `/driver/check-in?storeId=${store.id}`)}
            className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-4 active:scale-[0.98] transition-all cursor-pointer group"
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-105 ${activeTab === 'DONE' ? 'bg-secondary shadow-secondary/20' : 'bg-rose-500 shadow-rose-500/20'}`}>
               <span className="material-symbols-outlined text-2xl font-variation-fill">
                  {activeTab === 'DONE' ? 'verified' : 'pending_actions'}
               </span>
            </div>
            <div className="flex-1 min-w-0">
               <h3 className="font-black text-on-surface text-sm truncate">{store.name}</h3>
               <div className="flex items-center gap-2 mt-1">
                 <span className="text-[10px] font-bold text-slate-400 truncate uppercase">{store.district_name} / {store.sub_district_name}</span>
               </div>
            </div>
            <div className="bg-slate-50 w-10 h-10 rounded-full flex items-center justify-center text-slate-300">
               <span className="material-symbols-outlined text-xl">chevron_right</span>
            </div>
          </div>
          );
        })}
        
        {filteredStores.length === 0 && (
          <div className="py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-4xl text-slate-200">sentiment_dissatisfied</span>
             </div>
             <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">ไม่พบรายการร้านค้าในโหมดนี้</p>
          </div>
        )}
      </div>

      {/* Helper Text */}
      <div className="px-10 text-center pb-20">
         <p className="text-[10px] font-bold text-slate-300 leading-relaxed">
           หากท่านพบร้านค้าใหม่นอกเหนือจากรายการด้านบน <br />สามารถกดปุ่ม <span className="text-primary">"เพิ่มร้านใหม่"</span> เพื่อปักพิกัดได้ทันที
         </p>
      </div>
    </div>
  );
}
