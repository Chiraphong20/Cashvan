import React from 'react';
import { Link, useLocation } from 'react-router-dom';

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

  return (
    <aside className={`bg-slate-50 h-screen fixed left-0 top-0 overflow-y-auto flex flex-col transition-all duration-300 border-r border-slate-200 z-[2000] ${isCollapsed ? 'w-20 p-4' : 'w-64 p-6'}`}>
      <div className={`mb-10 flex items-center justify-between ${isCollapsed ? 'flex-col gap-4' : ''}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-lg shadow-primary/20 shrink-0">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>explore</span>
          </div>
          {!isCollapsed && (
            <div className="animate-in fade-in slide-in-from-left-2">
              <h1 className="text-xl font-black tracking-tighter text-blue-900 leading-none uppercase">Precision</h1>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-1">Nakhon Ratchasima</p>
            </div>
          )}
        </div>
        
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-400 flex items-center justify-center hover:bg-slate-100 transition-all ${isCollapsed ? '' : ''}`}
        >
          <span className={`material-symbols-outlined transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}>
            menu_open
          </span>
        </button>
      </div>

      <nav className="space-y-1.5 flex-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path === '/admin' && location.pathname === '/admin/');
          return (
            <Link
              key={item.name}
              to={item.path}
              title={isCollapsed ? item.name : ''}
              className={`flex items-center gap-3 p-3 rounded-2xl transition-all duration-200 group relative ${
                isActive 
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

      <div className={`pt-6 border-t border-slate-200 space-y-4 ${isCollapsed ? 'items-center' : ''}`}>
        <div className={`flex items-center gap-3 px-2 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl border-2 border-primary/20 overflow-hidden shadow-sm shrink-0">
              <img 
                alt="User Profile" 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDgpHKC0gl0V0BpE8P3tAM9EWMx1AUA0g1bR-ayVUv6bFFPcjDrKtBNUdcgZ4BcQCSF0BSqDtw8kwwPJUGbE6fZgQpqpmrd_yMdz0JZEJeidKFMFVxx99L1LUo1NYmmH9x2wjGkEtaLWrd88In5nX1fdGCEEaoXMzuLH-91aIfs2KJRrEYrecgyF6i4hZxIg6RBPPapQ6mFyXjUCrIntzNvGQv2gwNN80LND9pUMoyNMbbIJueh9m4LirrysjrNe56pBF1SegJ2mGLu"
              />
            </div>
            {!isCollapsed && (
              <div className="text-left font-sans animate-in fade-in duration-300">
                <p className="text-xs font-black text-slate-800 leading-tight">สรพงษ์ ใจดี</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Manager</p>
              </div>
            )}
          </div>
          
          {!isCollapsed && (
            <button className="text-slate-400 hover:text-primary transition-colors relative">
              <span className="material-symbols-outlined text-lg">notifications</span>
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
          )}
        </div>

        <button className={`w-full py-3 bg-slate-900 text-white rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-900/10 hover:bg-slate-800 active:scale-95 transition-all overflow-hidden ${isCollapsed ? 'px-0' : 'px-4'}`}>
          <span className="material-symbols-outlined text-sm shrink-0">logout</span>
          {!isCollapsed && <span className="animate-in fade-in duration-300">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
