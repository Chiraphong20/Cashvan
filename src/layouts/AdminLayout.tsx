import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/admin/Sidebar';
import { useStoreDB } from '../store/StoreContext';

export default function AdminLayout() {
  const { isCollapsed, setIsCollapsed } = useStoreDB();

  return (
    <div className="flex min-h-screen bg-background font-body text-on-surface antialiased overflow-x-hidden">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
        <main className="flex-1 p-8 space-y-8">
          <div className="max-w-[1600px] mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
