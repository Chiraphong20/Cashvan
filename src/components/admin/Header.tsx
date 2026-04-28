import React from 'react';

export default function Header() {
  return (
    <header className="fixed top-0 left-64 right-0 z-40 bg-white/80 backdrop-blur-xl flex justify-between items-center px-8 h-16 shadow-sm">
      <div className="flex items-center gap-4">
        <span className="text-lg font-bold text-blue-900 font-headline">ระบบจัดการ Cashvan</span>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative hidden lg:block">
          <input 
            className="bg-surface-container-low border-none rounded-full px-10 py-2 w-64 focus:ring-2 focus:ring-primary/20 text-sm outline-none font-medium" 
            placeholder="ค้นหาร้านค้าหรือพนักงาน..." 
            type="text"
          />
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
        </div>

        <div className="flex items-center gap-4">
          <button className="text-slate-600 hover:opacity-80 transition-opacity relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full border-2 border-white"></span>
          </button>
          
          <div className="flex items-center gap-3 ml-2 group cursor-pointer">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-on-surface">สรพงษ์ ใจดี</p>
              <p className="text-[10px] text-slate-500 font-medium">ผู้จัดการเขตโคราช</p>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-primary-container overflow-hidden shadow-sm">
              <img 
                alt="User Profile" 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDgpHKC0gl0V0BpE8P3tAM9EWMx1AUA0g1bR-ayVUv6bFFPcjDrKtBNUdcgZ4BcQCSF0BSqDtw8kwwPJUGbE6fZgQpqpmrd_yMdz0JZEJeidKFMFVxx99L1LUo1NYmmH9x2wjGkEtaLWrd88In5nX1fdGCEEaoXMzuLH-91aIfs2KJRrEYrecgyF6i4hZxIg6RBPPapQ6mFyXjUCrIntzNvGQv2gwNN80LND9pUMoyNMbbIJueh9m4LirrysjrNe56pBF1SegJ2mGLu"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
