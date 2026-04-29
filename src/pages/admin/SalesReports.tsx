import React, { useState, useMemo } from 'react';
import { useStoreDB } from '../../store/StoreContext';

export default function SalesReports() {
  const { sales, stores, drivers, products, deleteSale } = useStoreDB();
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month'>('today');
  const [selectedBill, setSelectedBill] = useState<any | null>(null);

  // Detailed Sales List Logic
  const detailedSales = useMemo(() => {
    return sales.map(sale => {
      const store = stores.find(s => s.id === sale.store_id);
      const driver = drivers.find(d => String(d.id).trim() === String(sale.driver_id).trim() || (d as any).line_user_id === sale.driver_id);
      return {
        ...sale,
        storeName: store?.name || 'Unknown Store',
        address: store?.address || 'N/A',
        lat: store?.lat,
        lng: store?.lng,
        area: `${store?.district_name || '-'} / ${store?.sub_district_name || '-'}`,
        driverName: driver?.name || (driver as any)?.line_display_name || `Unknown (${sale.driver_id})`,
        itemsCount: sale.items?.length || 0
      };
    }).sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
  }, [sales, stores, drivers]);

  // Driver Comparison Logic
  const driverPerformance = useMemo(() => {
    const perf: Record<string, { name: string, total: number, stores: Set<string> }> = {};
    sales.forEach(s => {
      if (!perf[s.driver_id]) {
        const d = drivers.find(d => String(d.id).trim() === String(s.driver_id).trim() || (d as any).line_user_id === s.driver_id);
        perf[s.driver_id] = { 
          name: d?.name || (d as any)?.line_display_name || `Unknown (${s.driver_id})`, 
          total: 0, 
          stores: new Set() 
        };
      }
      perf[s.driver_id].total += Number(s.total_amount || 0);
      perf[s.driver_id].stores.add(s.store_id);
    });
    return Object.values(perf).sort((a, b) => b.total - a.total);
  }, [sales, drivers]);

  const exportCSV = () => {
    const headers = ['Date', 'Store Name', 'Address', 'Area', 'Salesman', 'Total Amount'];
    const rows = detailedSales.map(s => [
      new Date(s.created_at || '').toLocaleDateString(),
      s.storeName,
      s.address.replace(/,/g, ' '),
      s.area,
      s.driverName,
      s.total_amount
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sales_report_${dateFilter}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 font-body">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-black text-on-surface tracking-tighter">รายงานยอดขายและวิเคราะห์</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Transaction History & Performance Battle</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="flex bg-slate-100 p-1 rounded-xl">
              {['today', 'week', 'month'].map(p => (
                <button 
                 key={p}
                 onClick={() => setDateFilter(p as any)}
                 className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${dateFilter === p ? 'bg-white text-primary shadow-sm' : 'text-slate-400'}`}
                >
                  {p === 'today' ? 'วันนี้' : p === 'week' ? 'สัปดาห์' : 'เดือน'}
                </button>
              ))}
           </div>
           <button 
            onClick={exportCSV}
            className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20 hover:brightness-110 transition-all active:scale-95"
           >
             <span className="material-symbols-outlined text-sm">download</span>
             CSV Export
           </button>
           <button className="flex items-center gap-2 bg-rose-500 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-500/20 hover:brightness-110 transition-all active:scale-95">
             <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
             PDF
           </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
               <span className="material-symbols-outlined">payments</span>
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ยอดรวมทั้งหมด</p>
               <p className="text-xl font-black italic">฿{sales.reduce((a, b) => a + Number(b.total_amount || 0), 0).toLocaleString()}</p>
            </div>
         </div>
         <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary">
               <span className="material-symbols-outlined">receipt_long</span>
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">จำนวนบิลที่เปิด</p>
               <p className="text-xl font-black">{sales.length} บิล</p>
            </div>
         </div>
         <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
               <span className="material-symbols-outlined">storefront</span>
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">จำนวนร้านที่ครอบคลุม</p>
               <p className="text-xl font-black">{[...new Set(sales.map(s => s.store_id))].length} ร้าน</p>
            </div>
         </div>
         <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-900/10 rounded-2xl flex items-center justify-center text-slate-900 overflow-hidden">
               <span className="material-symbols-outlined">calculate</span>
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">เฉลี่ยต่อบิล</p>
               <p className="text-xl font-black">฿{(sales.reduce((a, b) => a + Number(b.total_amount || 0), 0) / (sales.length || 1)).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sales List Table */}
        <div className="lg:col-span-3 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
             <h3 className="font-black text-lg text-on-surface">รายการธุรกรรมล่าสุด</h3>
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-slate-200">History Log (Drivers: {drivers.length})</span>
          </div>
          <div className="overflow-x-auto max-h-[600px] custom-scrollbar">
            <table className="w-full">
              <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest sticky top-0 z-10">
                <tr>
                  <th className="px-8 py-4 text-left">วันที่/เวลา</th>
                  <th className="px-4 py-4 text-left">ชื่อร้านค้า</th>
                  <th className="px-4 py-4 text-left">พื้นที่ (อำเภอ/ตำบล)</th>
                  <th className="px-4 py-4 text-left">ผู้ขาย (Sales)</th>
                  <th className="px-8 py-4 text-right">ยอดสุทธิ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {detailedSales.map((item, i) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5 text-xs text-slate-400 font-bold whitespace-nowrap">
                       {new Date(item.created_at || '').toLocaleString('th-TH', { 
                         day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' 
                       })}
                    </td>
                    <td className="px-4 py-5 min-w-[200px]">
                       <div className="font-black text-on-surface text-sm">{item.storeName}</div>
                       <div className="text-[9px] text-slate-400 font-bold truncate max-w-[200px] mt-0.5">{item.address}</div>
                       {item.lat && item.lng && (
                         <div className="text-[9px] text-primary font-bold mt-0.5 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[10px]">location_on</span>
                            {item.lat.toFixed(6)}, {item.lng.toFixed(6)}
                         </div>
                       )}
                    </td>
                    <td className="px-4 py-5 font-bold text-slate-600 text-xs">{item.area}</td>
                    <td className="px-4 py-5">
                       <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[9px] font-black uppercase">{item.driverName}</span>
                    </td>
                    <td className="px-8 py-5 text-right font-black text-primary text-sm flex items-center justify-end gap-3">
                      ฿{Number(item.total_amount || 0).toLocaleString()}
                      <button 
                        onClick={() => setSelectedBill(item)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-1.5 rounded-lg transition-colors"
                        title="ดูบิล"
                      >
                        <span className="material-symbols-outlined text-sm">receipt_long</span>
                      </button>
                      <button 
                        onClick={() => deleteSale(item.id)}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-600 p-1.5 rounded-lg transition-colors"
                        title="ลบบิล (คืนสต็อก)"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Driver Comparison (Battle) */}
        <div className="space-y-6">
           <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-xl overflow-hidden relative group">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-all"></div>
              <h3 className="font-black text-lg mb-8 flex items-center gap-2 relative z-10">
                <span className="material-symbols-outlined text-amber-500">leaderboard</span>
                Battle: Sales Performance
              </h3>
              <div className="space-y-8 relative z-10">
                 {driverPerformance.map((driver, i) => (
                   <div key={i} className="space-y-2">
                      <div className="flex justify-between items-end">
                         <div>
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none mb-1">Rank #{i+1}</p>
                            <span className="font-black text-sm">{driver.name}</span>
                         </div>
                         <span className="font-black text-primary text-sm">฿{driver.total.toLocaleString()}</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                         <div 
                           className={`h-full transition-all duration-1000 ${i === 0 ? 'bg-primary' : 'bg-slate-400'}`} 
                           style={{ width: `${(driver.total / (driverPerformance[0]?.total || 1)) * 100}%` }}
                         ></div>
                      </div>
                      <div className="flex justify-between text-[8px] font-black text-white/30 uppercase tracking-widest pt-1">
                         <span>Active Stores: {driver.stores.size}</span>
                         <span>Coverage: {((driver.stores.size / (stores.length || 1)) * 100).toFixed(1)}%</span>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                    <span className="material-symbols-outlined">receipt</span>
                 </div>
                 <h3 className="font-black text-sm text-on-surface uppercase tracking-widest">ข้อมูลบิลยอดขาย</h3>
              </div>
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                รายงานนี้จะแสดงเฉพาะร้านที่มีการเปิดบิลสำเร็จเท่านั้น หากร้านค้ายังอยู่ในขั้นตอน "สำรวจพิกัด" จะไม่ปรากฏในรายงานยอดขายนี้
              </p>
              <div className="mt-6 pt-6 border-t border-dashed border-slate-100 space-y-4">
                 <div className="flex justify-between items-center text-[11px] font-bold">
                    <span className="text-slate-400 uppercase">ยอดสูงสุดสัปดาห์นี้</span>
                    <span className="text-on-surface">฿{Math.max(...sales.map(s => Number(s.total_amount || 0)), 0).toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between items-center text-[11px] font-bold">
                    <span className="text-slate-400 uppercase">ร้านค้าเปิดบิลใหม่</span>
                    <span className="text-secondary">+2 ร้าน</span>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Bill Modal */}
      {selectedBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">receipt_long</span>
                </div>
                <div>
                  <h3 className="font-black text-on-surface">รายละเอียดบิล</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{selectedBill.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedBill(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-400 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-black text-on-surface">{selectedBill.storeName}</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-1">{selectedBill.address}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedBill.driverName}</p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {new Date(selectedBill.created_at || '').toLocaleString('th-TH')}
                  </p>
                </div>
              </div>

              <div className="border border-slate-100 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <tr>
                      <th className="px-4 py-2 text-left">รายการ</th>
                      <th className="px-4 py-2 text-center">จำนวน</th>
                      <th className="px-4 py-2 text-right">รวม</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedBill.items?.map((item: any, idx: number) => {
                      const prod = products.find(p => p.id === item.product_id);
                      return (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-medium text-slate-600">{prod?.name || 'Unknown Product'}</td>
                          <td className="px-4 py-3 text-center text-slate-500 font-bold">{item.quantity}</td>
                          <td className="px-4 py-3 text-right font-black text-on-surface">฿{(item.quantity * item.price).toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-dashed border-slate-200">
                <span className="font-black text-slate-400 uppercase tracking-widest text-xs">ยอดรวมทั้งสิ้น</span>
                <span className="text-2xl font-black text-primary">฿{Number(selectedBill.total_amount || 0).toLocaleString()}</span>
              </div>
            </div>
            
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setSelectedBill(null)}
                className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-800 transition-colors"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
