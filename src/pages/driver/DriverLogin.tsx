import React, { useState } from 'react';
import { useLineAuth } from '../../store/LineAuthContext';
import { useStoreDB } from '../../store/StoreContext';
import { Loader2, Link2, UserCheck } from 'lucide-react';
import ProgressBarLoader from '../../components/ui/ProgressBarLoader';

export default function DriverLogin() {
  const { liffProfile, currentDriver, isLoading, bindDriver } = useLineAuth();
  const { drivers } = useStoreDB();
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [isBinding, setIsBinding] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <ProgressBarLoader text="กำลังตรวจสอบข้อมูล LINE..." subtext="กรุณารอสักครู่ขณะระบบกำลังเชื่อมต่อ" />
      </div>
    );
  }

  const handleBind = async () => {
    if (!selectedDriverId) return;
    setIsBinding(true);
    await bindDriver(selectedDriverId);
    setIsBinding(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col p-6 font-body">
      <div className="max-w-md mx-auto w-full space-y-8 mt-10">
        <div className="text-center">
          <div className="w-24 h-24 bg-primary text-white rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-primary/20 mb-6">
            <span className="material-symbols-outlined text-5xl">person_pin</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">ยืนยันตัวตนพนักงาน</h1>
          <p className="text-slate-500 mt-2 font-medium">ผูกบัญชี LINE เพื่อเข้าใช้งานระบบ Driver</p>
        </div>

        {liffProfile && (
          <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {liffProfile.pictureUrl ? (
              <img src={liffProfile.pictureUrl} alt="LINE Profile" className="w-16 h-16 rounded-2xl object-cover shadow-md" />
            ) : (
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
                <span className="material-symbols-outlined text-slate-400">person</span>
              </div>
            )}
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">บัญชี LINE ปัจจุบัน</p>
              <h3 className="text-lg font-bold text-slate-800 leading-tight">{liffProfile.displayName}</h3>
            </div>
          </div>
        )}

        <div className="bg-white p-8 rounded-[3rem] shadow-2xl shadow-slate-200/60 border border-slate-100 space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">เลือกรายชื่อพนักงานของคุณ</label>
            <select 
              value={selectedDriverId}
              onChange={(e) => setSelectedDriverId(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-slate-800 font-bold focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
            >
              <option value="">-- กรุณาเลือกชื่อ --</option>
              {drivers.filter(d => !d.line_user_id).map(driver => (
                <option key={driver.id} value={driver.id}>{driver.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleBind}
            disabled={!selectedDriverId || isBinding}
            className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl shadow-slate-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100"
          >
            {isBinding ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Link2 className="w-5 h-5" />
                ผูกบัญชีและเข้าสู่ระบบ
              </>
            )}
          </button>
        </div>

        <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          หากไม่พบรายชื่อ กรุณาติดต่อฝ่ายจัดการ (Admin)
        </p>
      </div>
    </div>
  );
}
