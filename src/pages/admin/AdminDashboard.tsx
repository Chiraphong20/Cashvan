import React, { useState, useMemo } from 'react';
import { useStoreDB } from '../../store/StoreContext';
import { KORAT_DISTRICTS } from '../../constants/locations';

export default function AdminDashboard() {
  const { stores, visits, sales, drivers } = useStoreDB();
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month'>('today');
  const [districtSearch, setDistrictSearch] = useState('');

  // 1. Progress Stats Calculation
  const stats = useMemo(() => {
    const totalStores = stores.length;

    const now = new Date();
    const filterDate = new Date();
    if (dateFilter === 'today') {
      filterDate.setHours(0,0,0,0);
    } else if (dateFilter === 'week') {
      filterDate.setDate(now.getDate() - now.getDay());
      filterDate.setHours(0,0,0,0);
    } else {
      filterDate.setDate(1);
      filterDate.setHours(0,0,0,0);
    }

    const isWithinFilter = (dateString?: string) => {
      if (!dateString) return false;
      const d = new Date(dateString);
      return d >= filterDate && d <= now;
    };

    const surveyedInPeriod = stores.filter(s => s.status === 'SUCCESS' && isWithinFilter(s.last_visited_at)).length;
    const billedCount = [...new Set(sales.map(s => s.store_id))].length;
    
    const salesInPeriod = sales.filter(s => isWithinFilter(s.created_at));
    const totalRevenue = salesInPeriod.reduce((sum, sale) => sum + Number(sale.total_amount || 0), 0);

    return {
      totalStores,
      surveyedInPeriod,
      billedCount,
      totalRevenue
    };
  }, [stores, sales, dateFilter]);

  // 2. District Summary Logic
  const districtSummary = useMemo(() => {
    return KORAT_DISTRICTS.map(dist => {
      const storesInDist = stores.filter(s => s.district_name === dist);
      const surveyedInDist = storesInDist.filter(s => s.status === 'SUCCESS').length;
      return {
        name: dist,
        total: storesInDist.length,
        surveyed: surveyedInDist,
        pending: storesInDist.length - surveyedInDist,
        progress: storesInDist.length > 0 ? (surveyedInDist / storesInDist.length) * 100 : 0
      };
    })
    .filter(d => d.name.toLowerCase().includes(districtSearch.toLowerCase()))
    .sort((a, b) => b.progress - a.progress);
  }, [stores, districtSearch]);

  // 3. Top Customers
  const topCustomers = useMemo(() => {
    const storeSales: Record<string, number> = {};
    sales.forEach(s => {
      storeSales[s.store_id] = (storeSales[s.store_id] || 0) + Number(s.total_amount || 0);
    });
    return Object.entries(storeSales)
      .map(([id, total]) => ({
        name: stores.find(st => st.id === id)?.name || 'Unknown',
        total
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [sales, stores]);

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 font-body">
      {/* Header & Date Filter */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-on-surface tracking-tighter">ภาพรวมการดำเนินงาน</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Cashvan & Survey Management Analytics</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-200">
           {['today', 'week', 'month'].map(period => (
             <button 
              key={period}
              onClick={() => setDateFilter(period as any)}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${dateFilter === period ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
             >
               {period === 'today' ? 'วันนี้' : period === 'week' ? 'สัปดาห์นี้' : 'เดือนนี้'}
             </button>
           ))}
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <StatCard label="ร้านทั้งหมด" value={stats.totalStores} icon="storefront" color="bg-slate-900" />
         <StatCard label={`พบ${dateFilter === 'today' ? 'วันนี้' : dateFilter === 'week' ? 'สัปดาห์นี้' : 'เดือนนี้'}`} value={stats.surveyedInPeriod} icon="verified" color="bg-secondary" />
         <StatCard label="ร้านที่เปิดบิล" value={stats.billedCount} icon="receipt_long" color="bg-emerald-600" />
         <StatCard label={`ยอดรวม${dateFilter === 'today' ? 'วันนี้' : dateFilter === 'week' ? 'สัปดาห์นี้' : 'เดือนนี้'}`} value={stats.totalRevenue} prefix="฿" icon="payments" color="bg-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* District Summary Table */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-black text-lg text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">analytics</span>
              สรุปภาพรวมรายอำเภอ ({KORAT_DISTRICTS.length})
            </h3>
            <div className="relative w-64">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-sm">search</span>
              <input 
                type="text" 
                placeholder="ค้นหาชื่ออำเภอ..."
                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-bold outline-none focus:border-primary"
                value={districtSearch}
                onChange={(e) => setDistrictSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-x-auto max-h-[500px] custom-scrollbar">
            <table className="w-full">
              <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest sticky top-0 z-10">
                <tr>
                  <th className="px-8 py-4 text-left">ชื่ออำเภอ</th>
                  <th className="px-4 py-4 text-center">รวม (ร้าน)</th>
                  <th className="px-4 py-4 text-center">สำรวจแล้ว</th>
                  <th className="px-4 py-4 text-center">ยังไม่ได้สำรวจ</th>
                  <th className="px-8 py-4 text-right">ความคืบหน้า</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {districtSummary.map(row => (
                  <tr key={row.name} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-4 font-bold text-slate-700">อ.{row.name}</td>
                    <td className="px-4 py-4 text-center font-black">{row.total}</td>
                    <td className="px-4 py-4 text-center text-secondary font-black">{row.surveyed}</td>
                    <td className="px-4 py-4 text-center text-rose-500 font-black">{row.pending}</td>
                    <td className="px-8 py-4">
                      <div className="flex items-center justify-end gap-3">
                        <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full transition-all duration-1000 ${row.progress > 80 ? 'bg-secondary' : 'bg-primary'}`} style={{ width: `${row.progress}%` }}></div>
                        </div>
                        <span className="text-[10px] font-black text-slate-400">{row.progress.toFixed(0)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side Panels */}
        <div className="space-y-8">
           {/* Top Customers */}
           <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-xl">
              <h3 className="font-black text-lg mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500">military_tech</span>
                ร้านค้าท็อปเซลล์
              </h3>
              <div className="space-y-4">
                 {topCustomers.map((cust, i) => (
                   <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/10">
                      <div className="flex items-center gap-3">
                         <span className="w-6 h-6 rounded-lg bg-amber-500 text-slate-900 flex items-center justify-center font-black text-[10px]">{i+1}</span>
                         <span className="font-bold text-sm truncate max-w-[120px]">{cust.name}</span>
                      </div>
                      <span className="font-black text-amber-500 text-sm">฿{cust.total.toLocaleString()}</span>
                   </div>
                 ))}
              </div>
           </div>

           {/* Drivers Overview */}
           <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
              <h3 className="font-black text-lg text-on-surface mb-6">พนักงาน (Cashvan)</h3>
              <div className="space-y-4">
                 {drivers.map(d => (
                   <div key={d.id} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-2xl transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-xs">
                        {d.name.slice(0, 1)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 text-sm truncate">{d.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{d.assigned_zone}</p>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, subValue, icon, color, prefix }: any) {
  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
      <div className={`absolute top-0 right-0 w-16 h-16 ${color} opacity-0 group-hover:opacity-5 transition-opacity rounded-bl-[2rem]`}></div>
      <div className={`w-10 h-10 ${color} text-white rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-black/5`}>
        <span className="material-symbols-outlined text-xl">{icon}</span>
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <h4 className="text-2xl font-black text-on-surface tracking-tighter">{prefix}{value.toLocaleString()}</h4>
        {subValue && <span className="text-[10px] font-black text-secondary">{subValue}</span>}
      </div>
    </div>
  );
}
