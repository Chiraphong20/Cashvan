import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { name: 'หน้าแรก', icon: 'home', path: '/driver' },
  { name: 'ร้านค้า', icon: 'storefront', path: '/driver/stores' },
  { name: 'แคตตาล็อก', icon: 'menu_book', path: '/driver/catalog' },
  { name: 'สต็อกรถ', icon: 'inventory_2', path: '/driver/van-stock' },
  { name: 'ปิดยอด', icon: 'exit_to_app', path: '/driver/close-day' },
];

export default function BottomNav() {
  const location = useLocation();

  // Hide BottomNav on transactional pages to avoid overlapping with action buttons
  const isTransactionalPage = location.pathname.includes('/sales') || location.pathname.includes('/check-in');
  
  if (isTransactionalPage) return null;

  return (
    <nav className="fixed bottom-0 left-0 w-full flex justify-around items-end px-4 pb-6 pt-2 bg-white/90 backdrop-blur-2xl border-t border-slate-100 z-50 shadow-[0_-8px_24px_rgba(18,28,40,0.06)] rounded-t-[2.5rem]">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.name}
            to={item.path}
            className={`flex flex-col items-center justify-center transition-all duration-300 font-body ${
              isActive 
                ? 'bg-primary text-white rounded-2xl px-6 py-2.5 scale-110 -translate-y-4 shadow-lg shadow-primary/30' 
                : 'text-slate-400 px-4 py-2 hover:text-primary'
            }`}
          >
            <span className={`material-symbols-outlined`} style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
              {item.icon}
            </span>
            <span className="text-[11px] font-medium tracking-wide mt-0.5">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
