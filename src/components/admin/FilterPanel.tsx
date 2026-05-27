import React from 'react';
import { useStoreDB } from '../../store/StoreContext';

interface LayerToggles {
  layerStores: boolean; setLayerStores: (v: boolean) => void;
  layerZones: boolean; setLayerZones: (v: boolean) => void;
  layerDriverDots: boolean; setLayerDriverDots: (v: boolean) => void;
  layerDistricts: boolean; setLayerDistricts: (v: boolean) => void;
  layerRadius: boolean; setLayerRadius: (v: boolean) => void;
}

interface FilterPanelProps extends LayerToggles {
  searchTerm: string; setSearchTerm: (val: string) => void;
  statusFilter: string; setStatusFilter: (val: any) => void;
  districtFilter: string; setDistrictFilter: (val: string) => void;
  subDistrictFilter: string; setSubDistrictFilter: (val: string) => void;
  districtList: string[]; subDistrictList: string[];
  driverFilter: string; setDriverFilter: (val: string) => void;
  isCustomerFilter: string; setIsCustomerFilter: (val: string) => void;
  startDate: string; setStartDate: (val: string) => void;
  endDate: string; setEndDate: (val: string) => void;
  warehouseRadius: number; setWarehouseRadius: (val: number) => void;
}

const LAYERS = [
  { key: 'layerStores',     icon: 'storefront',     label: 'ร้านค้า' },
  { key: 'layerZones',      icon: 'track_changes',  label: 'โซน' },
  { key: 'layerDriverDots', icon: 'directions_car', label: 'รถสด' },
  { key: 'layerDistricts',  icon: 'map',            label: 'อำเภอ' },
  { key: 'layerRadius',     icon: 'radar',          label: 'รัศมี' },
] as const;

export default function FilterPanel(props: FilterPanelProps) {
  const { drivers } = useStoreDB();
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const panelRef = React.useRef<HTMLDivElement>(null);

  const layerValues: Record<string, boolean> = {
    layerStores: props.layerStores, layerZones: props.layerZones,
    layerDriverDots: props.layerDriverDots, layerDistricts: props.layerDistricts,
    layerRadius: props.layerRadius,
  };
  const layerSetters: Record<string, (v: boolean) => void> = {
    layerStores: props.setLayerStores, layerZones: props.setLayerZones,
    layerDriverDots: props.setLayerDriverDots, layerDistricts: props.setLayerDistricts,
    layerRadius: props.setLayerRadius,
  };

  const activeFiltersCount = [
    props.searchTerm, props.districtFilter, props.subDistrictFilter,
    props.driverFilter, props.startDate, props.endDate,
    props.statusFilter !== 'ALL' ? props.statusFilter : '',
    props.isCustomerFilter !== 'ALL' ? props.isCustomerFilter : '',
  ].filter(Boolean).length;

  const resetFilters = () => {
    props.setSearchTerm(''); props.setStatusFilter('ALL'); props.setDistrictFilter('');
    props.setSubDistrictFilter(''); props.setDriverFilter(''); props.setIsCustomerFilter('ALL');
    props.setStartDate(''); props.setEndDate('');
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setFiltersOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={panelRef} className="pointer-events-auto">
      {/* ── Top Bar ── */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-white/95 backdrop-blur-xl shadow-lg border-b border-slate-100/80">

        {/* Layer toggles */}
        <div className="flex items-center gap-1 pr-3 border-r border-slate-200">
          {LAYERS.map(({ key, icon, label }) => {
            const isOn = layerValues[key];
            return (
              <button
                key={key}
                title={label}
                onClick={() => layerSetters[key](!isOn)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${
                  isOn
                    ? 'bg-primary text-white shadow-sm shadow-primary/30'
                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]"
                  style={{ fontVariationSettings: isOn ? "'FILL' 1" : "'FILL' 0" }}>
                  {icon}
                </span>
                <span className="hidden lg:inline">{label}</span>
              </button>
            );
          })}
        </div>

        {/* Radius slider (compact) */}
        {props.layerRadius && (
          <div className="flex items-center gap-2 px-3 border-r border-slate-200">
            <span className="material-symbols-outlined text-slate-400 text-[16px]">radar</span>
            <input
              type="range" min="1000" max="50000" step="1000"
              className="w-24 accent-primary h-1 cursor-pointer"
              value={props.warehouseRadius}
              onChange={(e) => props.setWarehouseRadius(parseInt(e.target.value))}
            />
            <span className="text-[10px] font-black text-slate-600 w-8">{(props.warehouseRadius / 1000).toFixed(0)}km</span>
          </div>
        )}

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[16px]">search</span>
          <input
            type="text"
            placeholder="ค้นหาร้านค้า..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-1.5 text-[11px] font-bold outline-none focus:border-primary/50 focus:bg-white transition-all"
            value={props.searchTerm}
            onChange={(e) => props.setSearchTerm(e.target.value)}
          />
          {props.searchTerm && (
            <button onClick={() => props.setSearchTerm('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          )}
        </div>

        {/* Filter dropdown button */}
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className={`relative flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${
            filtersOpen || activeFiltersCount > 0
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <span className="material-symbols-outlined text-[15px]">filter_list</span>
          <span className="hidden sm:inline">ตัวกรอง</span>
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-500 text-white text-[8px] font-black rounded-full flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {/* Reset (show when filters active) */}
        {activeFiltersCount > 0 && (
          <button onClick={resetFilters} title="ล้างตัวกรอง"
            className="flex items-center justify-center w-8 h-8 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 transition-colors">
            <span className="material-symbols-outlined text-[16px]">restart_alt</span>
          </button>
        )}
      </div>

      {/* ── Dropdown Filter Panel ── */}
      {filtersOpen && (
        <div className="absolute top-full left-0 right-0 bg-white/97 backdrop-blur-xl shadow-2xl border-b border-slate-100 z-50 animate-in slide-in-from-top-2 duration-200">
          <div className="px-6 py-4 flex flex-wrap gap-4 items-end">

            {/* Status */}
            <div className="space-y-1">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">สถานะ</p>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                {[['ALL','ทั้งหมด'],['SUCCESS','สำรวจแล้ว'],['PENDING','รอดำเนินการ']].map(([val, label]) => (
                  <button key={val} onClick={() => props.setStatusFilter(val)}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all whitespace-nowrap ${props.statusFilter === val ? 'bg-white text-primary shadow' : 'text-slate-400'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Customer */}
            <div className="space-y-1">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">ลูกค้า</p>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                {[['ALL','ทั้งหมด'],['YES','เป็นลูกค้า'],['NO','ไม่เป็น']].map(([val, label]) => (
                  <button key={val} onClick={() => props.setIsCustomerFilter(val)}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all whitespace-nowrap ${props.isCustomerFilter === val ? 'bg-white text-primary shadow' : 'text-slate-400'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* District */}
            <div className="space-y-1">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">อำเภอ</p>
              <select className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-bold outline-none min-w-[120px]"
                value={props.districtFilter}
                onChange={(e) => { props.setDistrictFilter(e.target.value); props.setSubDistrictFilter(''); }}>
                <option value="">ทุกพื้นที่</option>
                {props.districtList.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* Sub-district */}
            <div className="space-y-1">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">ตำบล</p>
              <select className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-bold outline-none min-w-[120px]"
                value={props.subDistrictFilter}
                onChange={(e) => props.setSubDistrictFilter(e.target.value)}
                disabled={!props.districtFilter}>
                <option value="">ทุกตำบล</option>
                {props.subDistrictList.map(sd => <option key={sd} value={sd}>{sd}</option>)}
              </select>
            </div>

            {/* Driver */}
            <div className="space-y-1">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">พนักงาน</p>
              <select className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-bold outline-none min-w-[140px]"
                value={props.driverFilter} onChange={(e) => props.setDriverFilter(e.target.value)}>
                <option value="">ทุกคน</option>
                {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>

            {/* Date range */}
            <div className="space-y-1">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">ช่วงวันที่</p>
              <div className="flex items-center gap-2">
                <input type="date" className="bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-[9px] font-bold outline-none"
                  value={props.startDate} onChange={(e) => props.setStartDate(e.target.value)} />
                <span className="text-slate-300 text-[9px] font-black">—</span>
                <input type="date" className="bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-[9px] font-bold outline-none"
                  value={props.endDate} onChange={(e) => props.setEndDate(e.target.value)} />
              </div>
            </div>

            <button onClick={() => setFiltersOpen(false)}
              className="ml-auto self-end mb-0.5 flex items-center gap-1 px-4 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase">
              <span className="material-symbols-outlined text-[13px]">check</span>
              ใช้งาน
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
