import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStoreDB } from '../../store/StoreContext';

export default function CloseDay() {
  const navigate = useNavigate();
  const { inventories, products, closeDay, returnStock, currentDriverId } = useStoreDB();
  const driverId = currentDriverId;
  
  const expectedStock = useMemo(() => inventories[driverId] || [], [inventories, driverId]);
  const [actualStock, setActualStock] = useState<Record<number, number>>(
    expectedStock.reduce((acc, item) => ({ ...acc, [item.product_id]: item.quantity }), {})
  );
  const [isClosing, setIsClosing] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const report = useMemo(() => {
    return expectedStock.map(exp => {
      const actual = actualStock[exp.product_id] || 0;
      return {
        product_id: exp.product_id,
        name: products.find(p => p.id === exp.product_id)?.name || 'Unknown',
        expected: exp.quantity,
        actual: actual,
        diff: actual - exp.quantity
      };
    });
  }, [expectedStock, actualStock]);

  const hasDiscrepancy = report.some(r => r.diff !== 0);

  const handleCloseDay = async () => {
    setIsClosing(true);
    // Simulate reconciliation and return
    const actualList = Object.entries(actualStock).map(([id, qty]) => ({
      product_id: parseInt(id),
      quantity: qty
    }));
    
    await closeDay(driverId, actualList);
    await returnStock(driverId);
    
    setTimeout(() => {
      setIsClosing(false);
      setIsDone(true);
    }, 1500);
  };

  if (isDone) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center text-white mb-6 shadow-xl shadow-secondary/20">
          <span className="material-symbols-outlined text-4xl">inventory</span>
        </div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tighter mb-2">ปิดยอดวันเรียบร้อย</h1>
        <p className="text-sm text-slate-500 font-medium mb-8">ข้อมูลถูกส่งเข้าคลังใหญ่และสต็อกในรถถูกล้างสำเร็จ</p>
        <button 
          onClick={() => navigate('/driver')}
          className="w-full max-w-xs bg-slate-800 text-white py-4 rounded-2xl font-black text-xs tracking-widest uppercase shadow-lg active:scale-95 transition-all"
        >
          กลับหน้าหลัก
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="sticky top-0 z-[1000] bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h1 className="text-lg font-black text-blue-900 tracking-tighter">ปิดยอดประจำวัน</h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Inventory Reconciliation</p>
        </div>
      </div>

      <main className="p-6 space-y-8">
        {/* Info Card */}
        <div className="bg-blue-900 text-white rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="font-bold mb-1 opacity-60 text-xs uppercase tracking-widest">คำแนะนำ</h3>
            <p className="text-sm font-medium leading-relaxed">
              กรุณานับจำนวนสินค้าคงเหลือในรถจริงๆ แล้วกรอกลงในช่อง <b>"จำนวนจริง"</b> ระบบจะคำนวณหาส่วนต่างอัตโนมัติ
            </p>
          </div>
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <span className="material-symbols-outlined text-[100px]">fact_check</span>
          </div>
        </div>

        {/* Stock List */}
        <div className="space-y-4">
          {report.map(item => (
            <div key={item.product_id} className={`p-6 rounded-[2rem] bg-white border-2 transition-all ${item.diff !== 0 ? 'border-error/20 bg-error/[0.02]' : 'border-slate-50'}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-slate-800">{item.name}</h4>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ในระบบควรเหลือ: {item.expected} ชิ้น</p>
                </div>
                {item.diff !== 0 && (
                  <span className="px-2 py-1 bg-error text-white text-[9px] font-black rounded-lg uppercase italic">Discrepancy</span>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">จำนวนจริงในรถ</label>
                  <input 
                    type="number"
                    className="w-full bg-slate-100 border-none rounded-2xl p-4 text-xl font-black outline-none focus:ring-4 ring-primary/10 transition-all"
                    value={actualStock[item.product_id]}
                    onChange={e => setActualStock(prev => ({ ...prev, [item.product_id]: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">ส่วนต่าง</p>
                  <p className={`text-xl font-black ${item.diff < 0 ? 'text-error' : item.diff > 0 ? 'text-secondary' : 'text-slate-300'}`}>
                    {item.diff > 0 ? `+${item.diff}` : item.diff}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t border-slate-100 z-50">
          <button 
            disabled={isClosing}
            onClick={handleCloseDay}
            className={`w-full py-5 rounded-3xl font-black text-xs tracking-widest uppercase shadow-xl transition-all flex items-center justify-center gap-3 ${
              hasDiscrepancy 
                ? 'bg-amber-500 text-white shadow-amber-500/20' 
                : 'bg-primary text-on-primary shadow-primary/20'
            }`}
          >
            {isClosing ? (
              <span className="material-symbols-outlined animate-spin">progress_activity</span>
            ) : (
              <>
                <span className="material-symbols-outlined">exit_to_app</span>
                ยืนยันการปิดยอดวันนี้
              </>
            )}
          </button>
          {hasDiscrepancy && (
            <p className="text-center text-[10px] font-bold text-amber-600 mt-3 animate-pulse">
              * ข้อมูลไม่ตรงกัน ระบบจะแจ้งยอดส่วนต่างให้ Admin ทราบ
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
