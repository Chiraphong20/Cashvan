import React from 'react';
import { useStoreDB } from '../../store/StoreContext';

export default function VisitHistory() {
  const { visits, stores } = useStoreDB();

  return (
    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-on-surface font-headline">ประวัติการเยี่ยมชม</h1>
          <p className="text-xs text-slate-500 font-medium">รายการที่คุณเช็คอินในวันนี้</p>
        </div>
        <div className="bg-primary/5 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-primary/10">
          {visits.length} รายการ
        </div>
      </div>

      <div className="space-y-4">
        {visits.length > 0 ? (
          visits.map((visit) => {
            const store = stores.find(s => s.id === visit.store_id);
            return (
              <div key={visit.id} className="precision-card p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                    check_circle
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-on-surface truncate">{store?.name || 'ร้านค้าทั่วไป'}</h3>
                  <p className="text-[10px] text-slate-500 font-medium truncate italic">{visit.notes}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-black text-primary bg-primary/5 px-2 py-0.5 rounded">
                    {new Date(visit.visited_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
              <span className="material-symbols-outlined text-4xl">history</span>
            </div>
            <p className="text-sm text-slate-400 font-medium whitespace-pre-line">
              ยังไม่มีประวัติการเช็คอินในวันนี้{"\n"}เริ่มงานโดยการเลือกรายชื่อร้านค้าในแผนที่
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
