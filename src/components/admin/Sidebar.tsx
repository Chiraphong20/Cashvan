import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../store/AdminAuthContext';

const navItems = [
  { name: 'หน้าแรก', icon: 'dashboard', path: '/admin' },
  { name: 'Map Overview', icon: 'map', path: '/admin/map' },
  { name: 'จัดการพนักงาน', icon: 'group', path: '/admin/employees' },
  { name: 'สต็อกสินค้าและคลัง', icon: 'inventory_2', path: '/admin/inventory' },
  { name: 'รายงานยอดขาย', icon: 'analytics', path: '/admin/sales' },
  { name: 'จัดการรายการสินค้า', icon: 'category', path: '/admin/products' },
  { name: 'ร้านค้าและผลสำรวจ', icon: 'database', path: '/admin/stores' },
];

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
}

export default function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentAdmin, logout } = useAdminAuth();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <aside className={`bg-slate-50 h-screen fixed left-0 top-0 overflow-y-auto flex flex-col transition-all duration-300 border-r border-slate-200 z-[2000] ${isCollapsed ? 'w-20 p-4' : 'w-64 p-6'}`}>
      <div className={`mb-10 flex items-center justify-between ${isCollapsed ? 'flex-col gap-4' : ''}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-lg shadow-primary/20 shrink-0">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>explore</span>
          </div>
          {!isCollapsed && (
            <div className="animate-in fade-in slide-in-from-left-2">
              <h1 className="text-xl font-black tracking-tighter text-blue-900 leading-none uppercase">Wae Jer</h1>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-1">Logistic</p>
            </div>
          )}
        </div>
      </div>

      <nav className="space-y-1.5 flex-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path === '/admin' && location.pathname === '/admin/');
          return (
            <Link
              key={item.name}
              to={item.path}
              title={isCollapsed ? item.name : ''}
              className={`flex items-center gap-3 p-3 rounded-2xl transition-all duration-200 group relative ${isActive
                  ? 'text-primary font-black bg-primary/5 shadow-sm'
                  : 'text-slate-500 hover:text-primary hover:bg-primary/5'
                } ${isCollapsed ? 'justify-center' : ''}`}
            >
              <span className={`material-symbols-outlined shrink-0 ${isActive ? 'fill-1' : ''}`}
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                {item.icon}
              </span>
              {!isCollapsed && <span className="font-headline text-sm tracking-tight truncate animate-in fade-in duration-300">{item.name}</span>}

              {isActive && !isCollapsed && <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-primary" />}
            </Link>
          );
        })}
      </nav>

      <div className={`pt-6 border-t border-slate-200 space-y-4 ${isCollapsed ? 'items-center flex flex-col' : ''}`}>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`w-full py-2 bg-slate-100/50 text-slate-500 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all ${isCollapsed ? 'px-0' : 'px-4'}`}
          title={isCollapsed ? "ขยายเมนู" : "ย่อเมนู"}
        >
          <span className={`material-symbols-outlined text-sm transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}>
            menu_open
          </span>
          {!isCollapsed && <span>ย่อแทบเมนู</span>}
        </button>

        <Link to="/admin/profile" className={`flex items-center gap-3 px-2 transition-all hover:bg-slate-100 p-2 rounded-xl group ${isCollapsed ? 'justify-center w-full' : 'justify-between'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm shrink-0 font-black">
              {currentAdmin?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            {!isCollapsed && (
              <div className="text-left font-sans animate-in fade-in duration-300">
                <p className="text-xs font-black text-slate-800 leading-tight group-hover:text-primary transition-colors">{currentAdmin?.name || 'Admin'}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">System Admin</p>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors text-sm">settings</span>
          )}
        </Link>

        <button onClick={handleLogout} className={`w-full py-3 bg-slate-900 text-white rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-900/10 hover:bg-slate-800 active:scale-95 transition-all overflow-hidden ${isCollapsed ? 'px-0' : 'px-4'}`}>
          <span className="material-symbols-outlined text-sm shrink-0">logout</span>
          {!isCollapsed && <span className="animate-in fade-in duration-300">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
