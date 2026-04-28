import React, { useState } from 'react';
import { mockDrivers } from '../../store/mockData';

export default function FleetTracking() {
  const [drivers, setDrivers] = useState(mockDrivers);

  const toggleStatus = (id: string) => {
    setDrivers(prev => prev.map(d => {
      if (d.id === id) {
        return { ...d, work_status: d.work_status === 'ONLINE' ? 'OFFLINE' : 'ONLINE' };
      }
      return d;
    }));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-on-surface font-headline tracking-tighter">สถานะการทำงาน & มอบหมายพื้นที่</h1>
          <p className="text-sm text-slate-500 font-medium">ภาพรวมการเริ่มงานของพนักงาน และพื้นที่รับผิดชอบประจำวัน</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-primary py-2 px-4 text-xs">
            <span className="material-symbols-outlined text-sm mr-2">add_location_alt</span>
            มอบหมายพื้นที่ใหม่
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* KPI Cards */}
        <div className="precision-card p-6 flex flex-col justify-center border-l-4 border-secondary">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">พนักงานเริ่มงานแล้ว (Online)</p>
          <h2 className="text-4xl font-black text-on-surface mt-2">{drivers.filter(d => d.work_status === 'ONLINE').length} <span className="text-lg text-slate-400 font-medium tracking-normal">/ {drivers.length}</span></h2>
        </div>
        
        <div className="precision-card p-6 flex flex-col justify-center border-l-4 border-primary">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">พื้นที่ครอบคลุมวันนี้</p>
          <h2 className="text-4xl font-black text-on-surface mt-2">2 <span className="text-lg text-slate-400 font-medium tracking-normal">เขตโซน</span></h2>
        </div>
      </div>

      <div className="precision-card overflow-hidden bg-white shadow-xl shadow-slate-200/40">
        <div className="p-6 bg-surface-container-low/50 border-b border-surface-container flex justify-between items-center">
            <h3 className="font-bold text-slate-800">รายชื่อพนักงานและพื้นที่</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/30 border-b border-surface-container text-[11px] uppercase tracking-widest font-black text-slate-400">
                <th className="px-6 py-4">พนักงาน</th>
                <th className="px-6 py-4">รถขนส่ง</th>
                <th className="px-6 py-4">พื้นที่เป้าหมาย (Assigned Zone)</th>
                <th className="px-6 py-4">สถานะวันนี้</th>
                <th className="px-6 py-4 text-right">จัดการพื้นที่</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {drivers.map(driver => (
                <tr key={driver.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border border-slate-200">
                         <img src={`https://i.pravatar.cc/100?u=${driver.id}`} alt="driver" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-700">{driver.name}</p>
                        <p className="text-[10px] text-slate-400">{driver.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                     <p className="text-xs font-bold text-slate-600">{driver.vehicle_code}</p>
                     <p className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded inline-block mt-1">{driver.vehicle_plate}</p>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex items-center gap-1.5">
                       <span className="material-symbols-outlined text-[#4285F4] text-[16px]">location_on</span>
                       <span className="text-sm font-bold text-slate-700">{driver.assigned_zone || 'ยังไม่กำหนด'}</span>
                     </div>
                  </td>
                  <td className="px-6 py-4">
                     <button onClick={() => toggleStatus(driver.id)} className={`px-3 py-1 flex items-center gap-1.5 text-[10px] font-black rounded-full uppercase tracking-wider transition-colors ${
                        driver.work_status === 'ONLINE' ? 'bg-[#10b981]/10 text-[#10b981] hover:bg-[#10b981]/20' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${driver.work_status === 'ONLINE' ? 'bg-[#10b981] animate-pulse' : 'bg-slate-400'}`}></span>
                        {driver.work_status === 'ONLINE' ? 'เริ่มงานแล้ว' : 'ยังไม่เริ่มงาน'}
                      </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-primary hover:text-white p-2 text-[11px] font-bold rounded-lg transition-colors bg-primary/5 hover:bg-primary border border-transparent hover:border-primary/20">
                      ปรับโซน
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
