import React from 'react';
import { useStoreDB } from '../../store/StoreContext';

interface FilterPanelProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: any) => void;
  districtFilter: string;
  setDistrictFilter: (val: string) => void;
  subDistrictFilter: string;
  setSubDistrictFilter: (val: string) => void;
  districtList: string[];
  subDistrictList: string[];
  driverFilter: string;
  setDriverFilter: (val: string) => void;
  isCustomerFilter: string;
  setIsCustomerFilter: (val: string) => void;
  startDate: string;
  setStartDate: (val: string) => void;
  endDate: string;
  setEndDate: (val: string) => void;
  warehouseRadius: number;
  setWarehouseRadius: (val: number) => void;
}

export default function FilterPanel(props: FilterPanelProps) {
  const { drivers } = useStoreDB();

  return (
    <div className="bg-white/95 backdrop-blur-3xl p-5 rounded-[2.5rem] shadow-2xl border border-white/60 space-y-4 animate-in slide-in-from-right-10 duration-700 pointer-events-auto max-h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar">
      <div className="flex items-center gap-3 mb-1 px-1">
         <div className="w-9 h-9 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
            <span className="material-symbols-outlined text-[18px]">tune</span>
         </div>
         <h3 className="font-black text-[11px] uppercase tracking-[0.2em] text-slate-800">Advanced Controller</h3>
      </div>

      {/* 1. Feature Checklist: รัศมีบริการ (xx KM) */}
      <div className="space-y-2 px-1 bg-slate-900 text-white p-4 rounded-3xl shadow-xl shadow-slate-900/20 relative overflow-hidden group">
         <div className="absolute -right-4 -top-4 w-12 h-12 bg-white/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
         <div className="flex justify-between items-center relative z-10">
            <span className="text-[9px] font-black uppercase tracking-widest text-primary">รัศมีบริการ</span>
            <span className="text-lg font-black italic bg-primary text-slate-900 px-2 py-0.5 rounded-lg shadow-lg">{(props.warehouseRadius / 1000).toFixed(0)} KM</span>
         </div>
         <input 
          type="range" 
          min="1000" 
          max="50000" 
          step="1000"
          className="w-full accent-primary h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer"
          value={props.warehouseRadius}
          onChange={(e) => props.setWarehouseRadius(parseInt(e.target.value))}
         />
      </div>

      {/* 2. Feature Checklist: ค้นหาร้านค้า */}
      <div className="relative group">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">search</span>
        <input 
          type="text" 
          placeholder="ระบุชื่อร้านค้า..."
          className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-xs font-bold outline-none focus:border-primary/40 focus:bg-white transition-all"
          value={props.searchTerm}
          onChange={(e) => props.setSearchTerm(e.target.value)}
        />
      </div>

      {/* 3. Feature Checklist: เป็นลูกค้าเราไหม (Radio Segmented) */}
      <div className="space-y-2 px-1">
         <label className="text-[9px] font-black uppercase text-slate-400 ml-1 tracking-widest">สถานะลูกค้า (Segmented Control)</label>
         <div className="flex bg-slate-100 p-1.5 rounded-2xl border-2 border-slate-200/50">
            {['ALL', 'YES', 'NO'].map(val => (
              <button 
               key={val}
               onClick={() => props.setIsCustomerFilter(val)}
               className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${props.isCustomerFilter === val ? 'bg-white text-primary shadow-lg shadow-black/5 scale-[1.02]' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {val === 'ALL' ? 'ทั้งหมด' : val === 'YES' ? 'เป็นลูกค้า' : 'ไม่เป็น'}
              </button>
            ))}
         </div>
      </div>

      {/* 4. Feature Checklist: สถานะร้าน (Dropdown) */}
      <div className="grid grid-cols-1 gap-4">
         <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase text-slate-400 ml-1 tracking-widest">สถานะการสำรวจ</label>
            <select 
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-xs font-bold outline-none focus:border-primary/20 transition-all appearance-none bg-[url('https://cdn-icons-png.flaticon.com/512/25/25618.png')] bg-[length:12px] bg-[right_20px_center] bg-no-repeat"
              value={props.statusFilter}
              onChange={(e) => props.setStatusFilter(e.target.value)}
            >
              <option value="ALL">เลือกสถานะทั้งหมด</option>
              <option value="SUCCESS">สำรวจเรียบร้อยแล้ว (Done)</option>
              <option value="PENDING">รอดำเนินการ (Pending)</option>
            </select>
         </div>
      </div>

      {/* 5. Feature Checklist: อำเภอ / ตำบล (Cascading) */}
      <div className="grid grid-cols-2 gap-3">
         <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase text-slate-400 ml-1 tracking-widest">พื้นที่อำเภอ</label>
            <select 
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-[10px] font-bold outline-none"
              value={props.districtFilter}
              onChange={(e) => { props.setDistrictFilter(e.target.value); props.setSubDistrictFilter(''); }}
            >
              <option value="">ทุกพื้นที่</option>
              {props.districtList.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
         </div>
         <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase text-slate-400 ml-1 tracking-widest">ตำบล</label>
            <select 
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-[10px] font-bold outline-none"
              value={props.subDistrictFilter}
              onChange={(e) => props.setSubDistrictFilter(e.target.value)}
              disabled={!props.districtFilter}
            >
              <option value="">ทุกตำบล</option>
              {props.subDistrictList.map(sd => <option key={sd} value={sd}>{sd}</option>)}
            </select>
         </div>
      </div>

      {/* 6. Feature Checklist: รายชื่อพนักงาน */}
      <div className="space-y-1.5">
         <label className="text-[9px] font-black uppercase text-slate-400 ml-1 tracking-widest">พนักงานผู้รับผิดชอบ</label>
         <select 
          className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-xs font-bold outline-none"
          value={props.driverFilter}
          onChange={(e) => props.setDriverFilter(e.target.value)}
         >
           <option value="">พนักงานทุกคน (Everyone)</option>
           {drivers.map(d => <option key={d.id} value={d.id}>{d.name} ({d.assigned_zone})</option>)}
         </select>
      </div>

      {/* 7. Feature Checklist: ช่วงวัน (DD/MM/YY) With Logic Support */}
      <div className="space-y-2 bg-slate-50 p-4 rounded-3xl border-2 border-slate-100 italic">
         <label className="text-[9px] font-black uppercase text-primary ml-1 tracking-widest flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">calendar_month</span>
            ช่วงวันที่เริ่ม - วันจบ
         </label>
         <div className="flex items-center gap-2">
            <div className="flex-1">
               <input 
                 type="date" 
                 className="w-full bg-white border border-slate-100 rounded-lg px-2 py-1.5 text-[8px] font-black outline-none focus:border-primary/40"
                 value={props.startDate}
                 onChange={(e) => props.setStartDate(e.target.value)}
               />
            </div>
            <span className="text-slate-300 font-black text-[10px]">TO</span>
            <div className="flex-1">
               <input 
                 type="date" 
                 className="w-full bg-white border border-slate-100 rounded-lg px-2 py-1.5 text-[8px] font-black outline-none focus:border-primary/40"
                 value={props.endDate}
                 onChange={(e) => props.setEndDate(e.target.value)}
               />
            </div>
         </div>
      </div>

      <button 
        onClick={() => {
          props.setSearchTerm(''); props.setStatusFilter('ALL'); props.setDistrictFilter(''); props.setSubDistrictFilter('');
          props.setDriverFilter(''); props.setIsCustomerFilter('ALL'); props.setStartDate(''); props.setEndDate('');
          props.setWarehouseRadius(5000);
        }}
        className="w-full py-2 text-[9px] font-black uppercase tracking-[0.3em] text-slate-300 hover:text-rose-500 transition-all active:scale-95"
      >
        Reset All Filters
      </button>
    </div>
  );
}
