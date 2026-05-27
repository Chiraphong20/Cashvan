import React from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { useLineAuth } from '../store/LineAuthContext';
import { useStoreDB } from '../store/StoreContext';
import { Loader2 } from 'lucide-react';
import ProgressBarLoader from '../components/ui/ProgressBarLoader';

export default function DriverLayout() {
  const { currentDriver, isLoading } = useLineAuth();
  const { setDriverId } = useStoreDB();
  const location = useLocation();
  const isLoginPage = location.pathname === '/driver/login';

  React.useEffect(() => {
    if (currentDriver?.id) {
      setDriverId(currentDriver.id);
    }
  }, [currentDriver, setDriverId]);

  // Ping GPS every 30s while driver is logged in
  React.useEffect(() => {
    if (!currentDriver?.id || !navigator.geolocation) return;
    const ping = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          fetch('/api/driver-location', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              driver_id: currentDriver.id,
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              accuracy: pos.coords.accuracy
            })
          }).catch(() => {});
        },
        () => {},
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 15000 }
      );
    };
    ping();
    const id = setInterval(ping, 30000);
    return () => clearInterval(id);
  }, [currentDriver?.id]);

  const activeTab = location.pathname.includes('/stores') ? 'stores' : 
                    location.pathname.includes('/stock') ? 'stock' : 'map';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <ProgressBarLoader text="กำลังยืนยันตัวตน..." subtext="ระบบกำลังประมวลผลข้อมูลการเข้าสู่ระบบ" />
      </div>
    );
  }

  if (!currentDriver && !isLoginPage) {
    return <Navigate to="/driver/login" replace />;
  }

  if (currentDriver && isLoginPage) {
    return <Navigate to="/driver" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-body text-on-surface antialiased flex flex-col max-w-md mx-auto shadow-2xl relative overflow-x-hidden">
      {/* Mini Profile Header */}
      {currentDriver && !isLoginPage && (
        <div className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-3">
            {currentDriver.line_picture_url ? (
              <img src={currentDriver.line_picture_url} alt="Profile" className="w-8 h-8 rounded-lg shadow-sm" />
            ) : (
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-slate-400 text-sm">person</span>
              </div>
            )}
            <div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">พนักงานปัจจุบัน</p>
              <h4 className="text-xs font-bold text-slate-800">{currentDriver.name}</h4>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/driver/manual" className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600 rounded-full hover:bg-primary hover:text-white transition-colors shadow-sm" title="คู่มือการใช้งาน">
              <span className="material-symbols-outlined text-sm font-black">menu_book</span>
            </Link>
            <div className="px-2 py-1 bg-green-50 text-green-600 rounded-full flex items-center gap-1 shadow-sm">
               <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
               <span className="text-[8px] font-black uppercase tracking-widest">Online</span>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1">
        <Outlet />
      </main>

      {/* Persistent Bottom Navigation for Driver (The 3 Rich Menus) */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/80 backdrop-blur-xl border-t border-slate-100 flex justify-around items-center py-4 px-6 z-50">
         <Link to="/driver" className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'map' ? 'text-primary' : 'text-slate-400'}`}>
            <span className={`material-symbols-outlined text-2xl ${activeTab === 'map' ? 'font-variation-fill' : ''}`}>map</span>
            <span className="text-[10px] font-black uppercase tracking-tighter">แผนที่</span>
         </Link>
         <Link to="/driver/stores" className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'stores' ? 'text-primary' : 'text-slate-400'}`}>
            <span className={`material-symbols-outlined text-2xl ${activeTab === 'stores' ? 'font-variation-fill' : ''}`}>storefront</span>
            <span className="text-[10px] font-black uppercase tracking-tighter">ร้านค้า/ขาย</span>
         </Link>
         <Link to="/driver/stock" className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'stock' ? 'text-primary' : 'text-slate-400'}`}>
            <span className={`material-symbols-outlined text-2xl ${activeTab === 'stock' ? 'font-variation-fill' : ''}`}>inventory_2</span>
            <span className="text-[10px] font-black uppercase tracking-tighter">สต็อก</span>
         </Link>
      </div>
    </div>
  );
}
