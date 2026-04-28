import React, { useState, useMemo } from 'react';
import { useStoreDB } from '../../store/StoreContext';

export default function SurveyAudit() {
  const { stores, updateStore } = useStoreDB();
  const [filter, setFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');

  // Filter stores that have been surveyed but need audit
  const auditList = useMemo(() => {
    return stores.filter(s => s.status === 'SUCCESS' && (s.verification_status || 'PENDING') === filter);
  }, [stores, filter]);

  const stats = useMemo(() => {
    return {
      pending: stores.filter(s => s.status === 'SUCCESS' && (s.verification_status || 'PENDING') === 'PENDING').length,
      approved: stores.filter(s => (s.verification_status === 'APPROVED')).length,
      rejected: stores.filter(s => (s.verification_status === 'REJECTED')).length,
    };
  }, [stores]);

  const handleAudit = async (storeId: string, status: 'APPROVED' | 'REJECTED') => {
    // In production, this would call a specific /api/audit endpoint
    // For now, we update the local/context state
    await updateStore(storeId, {
      status: status === 'APPROVED' ? 'SUCCESS' : 'UNSURVEYED',
      verification_status: status
    });
  };

  const getPhotosArr = (data: string | undefined): string[] => {
    if (!data) return [];
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
      return [data];
    } catch {
      return [data];
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-on-surface font-headline tracking-tighter">อนุมัติผลการสำรวจ</h1>
          <p className="text-sm text-slate-500 font-medium">ตรวจสอบความถูกต้องของพิกัดและรูปภาพพนักงานภาคสนาม</p>
        </div>
      </div>

      {/* Stats Mini Banner */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'รอดำเนินการ', value: stats.pending, color: 'bg-primary', type: 'PENDING' },
          { label: 'อนุมัติแล้ว', value: stats.approved, color: 'bg-secondary', type: 'APPROVED' },
          { label: 'ไม่ผ่าน', value: stats.rejected, color: 'bg-error', type: 'REJECTED' }
        ].map(item => (
          <button 
            key={item.type}
            onClick={() => setFilter(item.type as any)}
            className={`precision-card p-6 border-b-4 transition-all text-left ${filter === item.type ? `border-${item.type === 'PENDING' ? 'primary' : item.type === 'APPROVED' ? 'secondary' : 'error'} scale-[1.02] shadow-lg` : 'border-transparent opacity-60'}`}
          >
            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">{item.label}</p>
            <div className="flex items-center gap-3">
              <p className="text-2xl font-black text-on-surface">{item.value}</p>
              <span className={`w-2 h-2 rounded-full ${item.type === 'PENDING' ? 'bg-primary' : item.type === 'APPROVED' ? 'bg-secondary' : 'bg-error'}`}></span>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {auditList.map(store => (
          <div key={store.id} className="precision-card overflow-hidden group hover:shadow-2xl transition-all duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              {/* Photo Preview Section */}
              <div className="lg:col-span-4 bg-slate-100 relative min-h-[240px]">
                {(() => {
                   const photos = getPhotosArr(store.photo_url);
                   return (
                     <>
                        {photos.length > 0 ? (
                           <img src={photos[0]} alt="Store" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                            <span className="material-symbols-outlined text-4xl">no_photography</span>
                            <p className="text-[10px] font-black uppercase mt-2">ไม่มีรูปภาพ</p>
                          </div>
                        )}
                        {photos.length > 0 && (
                          <div className="absolute top-4 left-4 flex gap-2">
                             <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-white text-[9px] font-black rounded-full uppercase tracking-widest border border-white/20">
                               {photos.length} {photos.length === 1 ? 'Photo' : 'Photos'} Attached
                             </span>
                          </div>
                        )}
                     </>
                   );
                })()}
              </div>

              {/* Data Section */}
              <div className="lg:col-span-8 p-8 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-black text-on-surface tracking-tight mb-1">{store.name}</h3>
                      <div className="flex items-center gap-2 text-slate-400">
                        <span className="material-symbols-outlined text-sm">location_on</span>
                        <p className="text-xs font-medium">{store.address}</p>
                      </div>
                    </div>
                    {store.discrepancy_reason && (
                       <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3 max-w-[240px]">
                          <p className="text-[9px] font-black text-amber-600 uppercase mb-1 flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">warning</span> เหตุผลพิกัดไม่ตรง
                          </p>
                          <p className="text-[11px] font-bold text-amber-800 leading-tight italic">"{store.discrepancy_reason}"</p>
                       </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
                     <div className="bg-slate-50 p-3 rounded-2xl">
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">ประเภท</p>
                        <p className="text-xs font-bold text-slate-800">{store.type}</p>
                     </div>
                     <div className="bg-slate-50 p-3 rounded-2xl">
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">พนักงาน</p>
                        <p className="text-xs font-bold text-slate-800">{store.created_by}</p>
                     </div>
                     <div className="bg-slate-50 p-3 rounded-2xl">
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">วันที่สำรวจ</p>
                        <p className="text-xs font-bold text-slate-800">{new Date(store.created_at || '').toLocaleDateString('th-TH')}</p>
                     </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-8">
                   <button 
                     onClick={() => handleAudit(store.id, 'APPROVED')}
                     className="flex-1 bg-secondary text-white py-4 rounded-2xl font-black text-xs tracking-widest uppercase shadow-lg shadow-secondary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                   >
                     <span className="material-symbols-outlined text-sm">check_circle</span>
                     ผ่านการตรวจสอบ
                   </button>
                   <button 
                     onClick={() => handleAudit(store.id, 'REJECTED')}
                     className="flex-1 bg-white text-error border-2 border-error/20 py-4 rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-error/5 transition-all flex items-center justify-center gap-2"
                   >
                     <span className="material-symbols-outlined text-sm">cancel</span>
                     ไม่ผ่านสินค้า
                   </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {auditList.length === 0 && (
          <div className="py-24 flex flex-col items-center justify-center text-slate-300 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
            <span className="material-symbols-outlined text-6xl mb-4 opacity-20">verified</span>
            <p className="font-bold uppercase tracking-widest text-xs">ไม่มีรายการที่ต้องตรวจสอบในขณะนี้</p>
          </div>
        )}
      </div>
    </div>
  );
}
