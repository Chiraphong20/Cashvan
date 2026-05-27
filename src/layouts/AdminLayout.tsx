import React, { useEffect, useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/admin/Sidebar';
import { useStoreDB } from '../store/StoreContext';
import { useAdminAuth } from '../store/AdminAuthContext';

const LOAD_STEPS = [
  { label: 'เชื่อมต่อฐานข้อมูล...', pct: 12 },
  { label: 'โหลดข้อมูลร้านค้า...', pct: 28 },
  { label: 'โหลดข้อมูลพนักงาน...', pct: 44 },
  { label: 'โหลดสินค้าและสต็อก...', pct: 58 },
  { label: 'โหลดประวัติการขาย...', pct: 72 },
  { label: 'โหลดข้อมูลแผนที่...', pct: 84 },
];

function AdminLoadingScreen({ dataReady }: { dataReady: boolean }) {
  const [progress, setProgress] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (dataReady) {
      setProgress(100);
      setStepIdx(LOAD_STEPS.length - 1);
      const t = setTimeout(() => setDone(true), 600);
      return () => clearTimeout(t);
    }

    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + (Math.random() * 3 + 1);
        const cap = LOAD_STEPS[LOAD_STEPS.length - 1].pct;
        return Math.min(next, cap);
      });
    }, 120);

    return () => clearInterval(interval);
  }, [dataReady]);

  useEffect(() => {
    let idx = 0;
    for (let i = 0; i < LOAD_STEPS.length; i++) {
      if (progress >= LOAD_STEPS[i].pct - 1) idx = i;
    }
    setStepIdx(Math.max(0, idx));
  }, [progress]);

  if (done) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col items-center justify-center font-body"
      style={{ opacity: done ? 0 : 1, transition: 'opacity 0.4s ease' }}>

      {/* Logo / Brand */}
      <div className="mb-12 flex flex-col items-center gap-4">
        <div className="w-20 h-20 bg-gradient-to-br from-primary to-blue-700 rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/30">
          <span className="material-symbols-outlined text-white text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>local_shipping</span>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-black text-white tracking-tight">Cashvan Admin</h1>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1">Wae Jer Logistic</p>
        </div>
      </div>

      {/* Progress Container */}
      <div className="w-80 space-y-4">
        {/* Bar */}
        <div className="relative h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-blue-400 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
          {/* Shimmer */}
          <div
            className="absolute inset-y-0 rounded-full opacity-60"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
              animation: 'shimmer 1.2s infinite',
            }}
          />
        </div>

        {/* Percentage + Step Label */}
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold text-slate-400 animate-pulse">
            {LOAD_STEPS[stepIdx]?.label}
          </p>
          <span className="text-[11px] font-black text-primary tabular-nums">
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
}

export default function AdminLayout() {
  const { isCollapsed, setIsCollapsed, loading: dataLoading } = useStoreDB();
  const { currentAdmin, loading: authLoading } = useAdminAuth();
  const location = useLocation();
  const [showContent, setShowContent] = useState(false);

  const dataReady = !authLoading && !dataLoading;

  useEffect(() => {
    if (dataReady) {
      const t = setTimeout(() => setShowContent(true), 700);
      return () => clearTimeout(t);
    }
  }, [dataReady]);

  if (!authLoading && !currentAdmin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return (
    <>
      <AdminLoadingScreen dataReady={dataReady} />
      <div
        className="flex min-h-screen bg-background font-body text-on-surface antialiased overflow-x-hidden"
        style={{ opacity: showContent ? 1 : 0, transition: 'opacity 0.4s ease' }}
      >
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
          <main className="flex-1 p-8 space-y-8">
            <div className="max-w-[1600px] mx-auto w-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
