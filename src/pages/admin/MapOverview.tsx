import React, { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, GeoJSON, useMapEvents, Circle } from 'react-leaflet';
import L from 'leaflet';
import { useStoreDB, SurveyTarget } from '../../store/StoreContext';
import FilterPanel from '../../components/admin/FilterPanel';
import koratGeojson from '../../store/korat_geojson.json';
import { KORAT_SUBDISTRICTS, findDistrictByCoords, KORAT_DISTRICTS as districtList } from '../../constants/locations';

const AMPOE_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  '#f43f5e', '#4ade80', '#2dd4bf', '#38bdf8', '#818cf8', '#c084fc', '#f472b6', '#fb7185',
  '#dc2626', '#ea580c', '#d97706', '#ca8a04', '#65a30d', '#16a34a', '#059669', '#0d9488'
];

const getAmphoeColor = (amphoeCode: string) => {
  const codeNum = parseInt(amphoeCode, 10) || 0;
  return AMPOE_COLORS[codeNum % AMPOE_COLORS.length];
};

const getCustomMarker = (type: string, status: string, isAdminOnly?: boolean) => {
  const isSurveyed = status === 'SUCCESS';
  const shadowClass = isSurveyed ? 'shadow-[0_0_12px_rgba(16,185,129,0.7)]' : 'shadow-[0_0_15px_rgba(244,63,94,0.8)]';

  let markerHtml = '';

  if (isSurveyed) {
    markerHtml = `
      <div class="relative flex items-center justify-center w-[30px] h-[30px] bg-[#10b981] rounded-full border-[2.5px] border-white ${shadowClass} z-20">
        <span class="material-symbols-outlined text-white text-[16px]" style="font-variation-settings: 'FILL' 1; font-weight: 700;">check</span>
      </div>
    `;
  } else {
    markerHtml = `
      <div class="relative flex items-center justify-center w-8 h-8 z-30 group-hover:-translate-y-2 transition-transform duration-300">
        <div class="absolute w-7 h-7 bg-[#f43f5e] ${shadowClass} border-2 border-white" 
             style="border-radius: 50% 50% 50% 0; transform: rotate(-45deg);"></div>
        <div class="absolute w-2.5 h-2.5 bg-white rounded-full z-10 animate-pulse"></div>
      </div>
    `;
  }

  const iconHtml = `
    <div class="relative flex flex-col items-center group cursor-pointer hover:scale-110 transition-transform duration-300">
      <div class="absolute bottom-10 bg-white/95 backdrop-blur px-3 py-1.5 rounded-xl text-xs font-black shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 text-slate-800 border border-slate-100 pointer-events-none">
        ${isAdminOnly ? '👀 เฉพาะแอดมิน' : (isSurveyed ? '✅ สำรวจแล้ว' : '📍 รอดำเนินการ')}
      </div>
      ${markerHtml}
      ${isAdminOnly ? `
        <div class="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-white rounded-full flex items-center justify-center border-2 border-white z-[100] shadow-sm">
          <span class="material-symbols-outlined text-[10px] font-black">visibility_off</span>
        </div>
      ` : ''}
    </div>
  `;

  return L.divIcon({
    className: 'bg-transparent border-0',
    html: iconHtml,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

function MapEvents({ onMapClick, isDefiningTarget, addMode }: { onMapClick: (lat: number, lng: number) => void, isDefiningTarget: boolean, addMode: boolean }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapOverview() {
  const { stores, surveyTargets, sales, fetchStoreById, addStore, visits, isCollapsed, addSurveyTarget, deleteSurveyTarget, drivers } = useStoreDB();
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const selectedStore = useMemo(() => stores.find(s => s.id === selectedStoreId), [stores, selectedStoreId]);
  
  const setSelectedStore = (store: any) => {
    setSelectedStoreId(store ? store.id : null);
  };

  const [selectedTarget, setSelectedTarget] = useState<SurveyTarget | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showSalesHistory, setShowSalesHistory] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isDefiningTarget, setIsDefiningTarget] = useState(false);
  const [targetDraft, setTargetDraft] = useState<Partial<SurveyTarget> | null>(null);
  const [addMode, setAddMode] = useState(false);
  
  // 11 Feature Checklist States
  const FIXED_WAREHOUSE = { lat: 14.99954784495029, lng: 102.11866307852294 };
  const [warehouseRadius, setWarehouseRadius] = useState(5000); 
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'SUCCESS'>('ALL');
  const [districtFilter, setDistrictFilter] = useState('');
  const [subDistrictFilter, setSubDistrictFilter] = useState('');
  const [driverFilter, setDriverFilter] = useState('');
  const [isCustomerFilter, setIsCustomerFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [newData, setNewData] = useState<any>({
    name: '', address: '', type: 'grocery', status: 'UNSURVEYED',
    lat: 14.99954784495029, lng: 102.11866307852294,
    district: '', sub_district: '', is_admin_only: false
  });
  const [coordText, setCoordText] = useState('14.999547, 102.118663');

  const getStoresInTarget = (target: SurveyTarget) => {
    return stores.filter(store => {
      const dist = L.latLng(store.lat, store.lng).distanceTo(L.latLng(target.lat, target.lng));
      return dist <= target.radius;
    }).length;
  };

  const handleEditTarget = (target: SurveyTarget) => {
    setTargetDraft({ ...target });
    deleteSurveyTarget(target.id);
  };

  const handleMapClick = async (lat: number, lng: number) => {
    if (addMode) {
      const detectedDistrict = findDistrictByCoords(lat, lng);
      
      let detectedZone = '';
      surveyTargets.forEach(target => {
        const dist = L.latLng(lat, lng).distanceTo(L.latLng(target.lat, target.lng));
        if (dist <= target.radius) {
          detectedZone = target.name;
        }
      });

      setNewData({ ...newData, lat, lng, district: detectedDistrict, sales_zone: detectedZone });
      setCoordText(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      setIsAdding(true);
      setAddMode(false);
    } else if (isDefiningTarget) {
      setTargetDraft({ name: '', lat, lng, radius: 500, color: '#3b82f6', status: 'ACTIVE' });
      setIsDefiningTarget(false);
    }
  };

  const filteredStores = useMemo(() => {
    return stores.filter(store => {
      // 1. Basic Text & Status
      const matchesSearch = !searchTerm || store.name.toLowerCase().includes(searchTerm.toLowerCase());
      const isSurveyed = store.status === 'SUCCESS';
      const matchesStatus = statusFilter === 'ALL' || (statusFilter === 'SUCCESS' && isSurveyed) || (statusFilter === 'PENDING' && !isSurveyed);
      const matchesDistrict = !districtFilter || store.district_name === districtFilter;
      const matchesSubDistrict = !subDistrictFilter || store.sub_district_name === subDistrictFilter;
      const matchesDriver = !driverFilter || store.assigned_driver_id === driverFilter;
      const matchesCustomer = isCustomerFilter === 'ALL' || (isCustomerFilter === 'YES' && store.is_customer) || (isCustomerFilter === 'NO' && !store.is_customer);
      
      const distToWarehouse = L.latLng(store.lat, store.lng).distanceTo(L.latLng(FIXED_WAREHOUSE.lat, FIXED_WAREHOUSE.lng));
      // Radius is used visually, no longer restricts store visibility
      // const matchesRadius = distToWarehouse <= warehouseRadius;

      // 5. Date Range Logic (Support for DD/MM/YY comparisons)
      let matchesDate = true;
      if (startDate || endDate) {
        const storeDate = store.created_at ? new Date(store.created_at).getTime() : 0;
        if (startDate) {
          const start = new Date(startDate).setHours(0, 0, 0, 0);
          matchesDate = storeDate >= start;
        }
        if (endDate) {
          const end = new Date(endDate).setHours(23, 59, 59, 999);
          matchesDate = matchesDate && storeDate <= end;
        }
      }
      
      return matchesSearch && matchesStatus && matchesDistrict && matchesSubDistrict && matchesDriver && matchesCustomer && matchesDate;
    });
  }, [stores, searchTerm, statusFilter, districtFilter, subDistrictFilter, driverFilter, isCustomerFilter, warehouseRadius, startDate, endDate]);

  return (
    <div className={`fixed inset-0 z-0 transition-all duration-300 ${isCollapsed ? 'pl-20' : 'pl-64'}`}>
      <div className="w-full h-full relative">
        <MapContainer center={[14.9995, 102.1186]} zoom={12} zoomControl={false} className="h-full w-full">
          <TileLayer url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}" subdomains={['mt0', 'mt1', 'mt2', 'mt3']} />
          <ZoomControl position="bottomright" />
          <MapEvents onMapClick={handleMapClick} isDefiningTarget={isDefiningTarget} addMode={addMode} />

          {/* District Highlights */}
          <GeoJSON data={koratGeojson as any} style={(f) => ({ color: getAmphoeColor(f?.properties?.amp_code), weight: 2, opacity: 0.5, fillOpacity: 0.02 })} interactive={false} />

          {/* Store Markers */}
          {filteredStores.map(store => (
            <Marker 
              key={store.id} 
              position={[store.lat, store.lng]} 
              icon={getCustomMarker(store.type, store.status, store.is_admin_only)}
            >
              <Popup className="precision-popup">
                <div className="p-1 min-w-[150px] font-body">
                  <h3 className="font-black text-sm text-slate-800 mb-1 px-1 text-center">{store.name}</h3>
                  <button 
                    onClick={() => {
                      setSelectedStore(store);
                    }} 
                    className="w-full bg-slate-900 text-white py-2.5 rounded-xl text-[10px] font-black uppercase mt-2 shadow-lg shadow-slate-900/20 active:scale-95 transition-all"
                  >
                    ดูรายละเอียด
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Fixed Warehouse & Adjustable Radius */}
          <Marker position={[FIXED_WAREHOUSE.lat, FIXED_WAREHOUSE.lng]} icon={L.divIcon({
            html: `<div class="relative flex items-center justify-center"><div class="absolute w-12 h-12 bg-blue-900/20 rounded-full animate-pulse"></div><div class="w-10 h-10 bg-blue-900 text-white rounded-xl shadow-xl flex items-center justify-center border-2 border-white ring-2 ring-blue-900/30"><span class="material-symbols-outlined text-2xl" style="font-variation-settings: 'FILL' 1">warehouse</span></div><div class="absolute -bottom-6 bg-blue-900 text-white text-[9px] font-black px-2 py-0.5 rounded-full whitespace-nowrap shadow-sm">คลังสินค้านครราชสีมา</div></div>`,
            className: 'warehouse-icon', iconSize: [40, 40], iconAnchor: [20, 20],
          })} />
          <Circle center={[FIXED_WAREHOUSE.lat, FIXED_WAREHOUSE.lng]} radius={warehouseRadius} pathOptions={{ color: '#1e3a8a', fillColor: '#1e3a8a', fillOpacity: 0.05, weight: 1, dashArray: '5, 5' }} interactive={false} />

          {/* Target Zones Overlay */}
          {surveyTargets.map(target => (
            <React.Fragment key={target.id}>
              <Circle 
                center={[target.lat, target.lng]} 
                radius={target.radius} 
                pathOptions={{ fillColor: target.color, color: target.color, fillOpacity: 0.15, weight: 2, dashArray: '5, 5' }}
                eventHandlers={{
                  click: (e) => {
                    if (addMode || isDefiningTarget) {
                      handleMapClick(e.latlng.lat, e.latlng.lng);
                    }
                  }
                }}
              >
                <Popup className="precision-popup">
                  <div className="p-3 min-w-[180px] font-body">
                    <div className="flex items-center gap-2 mb-3">
                       <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: target.color }}>
                          <span className="material-symbols-outlined text-sm">track_changes</span>
                       </div>
                       <div>
                          <h3 className="font-black text-xs text-slate-800 leading-none">{target.name}</h3>
                          <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">เป้าหมายพื้นที่สำรวจ</p>
                       </div>
                    </div>
                    
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4">
                       <div className="flex justify-between items-center mb-1">
                          <span className="text-[9px] font-black text-slate-400 uppercase">ร้านค้าในพื้นที่</span>
                          <span className="text-xs font-black text-primary">{getStoresInTarget(target)} ร้าน</span>
                       </div>
                    </div>

                    <div className="flex gap-2">
                       <button onClick={() => handleEditTarget(target)} className="flex-1 bg-slate-900 text-white py-2 rounded-lg text-[9px] font-black uppercase flex items-center justify-center gap-1">แก้ไข</button>
                       <button onClick={() => deleteSurveyTarget(target.id)} className="w-10 h-8 bg-rose-50 text-rose-500 rounded-lg flex items-center justify-center"><span className="material-symbols-outlined text-sm">delete</span></button>
                    </div>
                  </div>
                </Popup>
              </Circle>
              {/* Area Name Label */}
              <Marker 
                position={[target.lat, target.lng]} 
                icon={L.divIcon({
                  className: 'bg-transparent border-0',
                  html: `
                    <div class="flex flex-col items-center">
                      <div class="px-3 py-1 bg-white/90 backdrop-blur-sm border-2 rounded-full shadow-lg whitespace-nowrap" style="border-color: ${target.color}">
                        <span class="text-[10px] font-black text-slate-800 uppercase tracking-tighter">${target.name}</span>
                      </div>
                    </div>
                  `,
                  iconSize: [100, 30],
                  iconAnchor: [50, 15]
                })}
                interactive={false}
              />
            </React.Fragment>
          ))}
        </MapContainer>

        {/* UI Overlays */}
        <div className="absolute top-6 right-6 z-[1000] flex flex-col items-end gap-4 pointer-events-none w-80">
          <div className="w-full pointer-events-auto">
            <FilterPanel 
              searchTerm={searchTerm} setSearchTerm={setSearchTerm}
              statusFilter={statusFilter} setStatusFilter={setStatusFilter}
              districtFilter={districtFilter} setDistrictFilter={setDistrictFilter}
              subDistrictFilter={subDistrictFilter} setSubDistrictFilter={setSubDistrictFilter}
              districtList={districtList} subDistrictList={KORAT_SUBDISTRICTS[districtFilter] || []}
              driverFilter={driverFilter} setDriverFilter={setDriverFilter}
              isCustomerFilter={isCustomerFilter} setIsCustomerFilter={setIsCustomerFilter}
              startDate={startDate} setStartDate={setStartDate}
              endDate={endDate} setEndDate={setEndDate}
              warehouseRadius={warehouseRadius} setWarehouseRadius={setWarehouseRadius}
            />
          </div>
        </div>

        {/* Map Legend (Bottom Left) - Moved as per request */}
        <div className="absolute bottom-6 left-6 z-[1000] pointer-events-auto w-72">
          <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-6 shadow-2xl border border-white/50 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4 px-1">Map Legend (คำอธิบายหมุด)</h4>
            <div className="grid grid-cols-2 gap-y-3 gap-x-4">
              <LegendItem icon="check" label="สำรวจแล้ว" color="bg-secondary" isCircular />
              <LegendItem icon="location_on" label="เป้าหมายสำรวจ" color="bg-rose-500" isPin />
              <LegendItem icon="visibility_off" label="หมุดลับ (Admin)" color="bg-amber-500" isBox />
              <LegendItem icon="warehouse" label="โกดังสินค้า" color="bg-blue-900" isBox />
            </div>
            <div className="mt-4 pt-4 border-t border-dashed border-slate-200">
               <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-blue-900 border-dashed rounded-full bg-blue-900/5"></div>
                  <span className="text-[10px] font-black text-on-surface uppercase tracking-tighter">รัศมีบริการ ({(warehouseRadius/1000).toFixed(0)} KM)</span>
               </div>
            </div>
          </div>
        </div>

        <div className="absolute top-24 left-4 z-[1000] flex flex-col gap-2">
           <button onClick={() => setIsDefiningTarget(!isDefiningTarget)} className={`flex items-center gap-2 px-6 py-4 rounded-3xl font-black text-[11px] uppercase tracking-widest shadow-2xl transition-all ${isDefiningTarget ? 'bg-amber-500 text-white animate-pulse' : 'bg-white text-slate-700'}`}>
              <span className="material-symbols-outlined text-lg">track_changes</span>
              ปักพื้นที่เป้าหมาย
           </button>
           <button onClick={() => {
              setNewData({ ...newData, name: '', is_admin_only: false, lat: 14.999547, lng: 102.118663, status: 'UNSURVEYED' });
              setIsAdding(true);
           }} className={`flex items-center gap-2 px-6 py-4 rounded-3xl font-black text-[11px] uppercase tracking-widest shadow-2xl transition-all ${addMode ? 'bg-[#f43f5e] text-white animate-pulse' : 'bg-white text-slate-700'}`}>
              <span className="material-symbols-outlined text-lg">add_location_alt</span>
              เพิ่มร้านใหม่ {addMode && '(กำลังเลือกหมุด...)'}
           </button>
        </div>

        {/* Modals & Slide-overs */}
        {selectedStore && (
          <div className="absolute inset-y-0 right-0 w-96 bg-white shadow-[-20px_0_60px_rgba(0,0,0,0.1)] z-[2000] animate-in slide-in-from-right duration-500 flex flex-col">
             <div className="p-8 pb-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                      <span className="material-symbols-outlined font-variation-fill">storefront</span>
                   </div>
                   <div>
                      <h3 className="text-xl font-black text-slate-800 leading-none">รายละเอียดร้านค้า</h3>
                      <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Store Intelligence</p>
                   </div>
                </div>
                <button onClick={() => setSelectedStore(null)} className="w-10 h-10 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors">
                   <span className="material-symbols-outlined">close</span>
                </button>
             </div>

             <div className="flex-1 overflow-y-auto px-8 py-4 space-y-8">
                {/* Visual Status */}
                <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100">
                   <div className="flex flex-col items-center text-center">
                      <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 ${selectedStore.status === 'SUCCESS' ? 'bg-secondary/10 text-secondary' : 'bg-rose-500/10 text-rose-500'}`}>
                         {selectedStore.status === 'SUCCESS' ? 'สำรวจสำเร็จ' : 'รอดำเนินการ'}
                      </div>
                      <h2 className="text-2xl font-black text-slate-900 mb-1">{selectedStore.name}</h2>
                      <p className="text-xs font-bold text-slate-400 max-w-[200px] leading-relaxed">{selectedStore.address || 'ไม่มีข้อมูลที่อยู่'}</p>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-dashed border-slate-200">
                      <div className="text-center">
                         <p className="text-[10px] font-black text-slate-400 uppercase mb-1 underline decoration-primary/30 decoration-2">โซนพื้นที่</p>
                         <p className="font-black text-slate-800">{selectedStore.sub_district_name || 'ไม่ระบุ'}</p>
                      </div>
                      <div className="text-center">
                         <p className="text-[10px] font-black text-slate-400 uppercase mb-1 underline decoration-primary/30 decoration-2">ประเภท</p>
                         <p className="font-black text-slate-800 tracking-tighter capitalize">{selectedStore.type}</p>
                      </div>
                   </div>
                </div>


                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4 pt-4">
                   <button className="bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 hover:-translate-y-1 transition-all">แก้ไขข้อมูล</button>
                   {(() => {
                      const hasSales = sales.some(s => s.store_id === selectedStore.id);
                      const saleCount = sales.filter(s => s.store_id === selectedStore.id).length;
                      
                      if (!hasSales) {
                        return (
                          <button 
                           disabled
                           className="bg-slate-100 text-slate-400 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] cursor-not-allowed"
                          >
                            ไม่มีประวัติขาย
                          </button>
                        );
                      }
                      
                      return (
                        <button 
                         onClick={() => setShowSalesHistory(true)}
                         className="bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-slate-900/20 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                        >
                          ดูประวัติขาย
                          <span className="bg-white/20 px-2 py-0.5 rounded-full text-[9px]">{saleCount} บิล</span>
                        </button>
                      );
                   })()}
                </div>
             </div>

             <div className="p-8 pt-0">
                <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 flex items-center justify-between">
                   <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">พนักงานดูแล</p>
                   <div className="flex items-center gap-2">
                       <span className="text-[11px] font-black text-slate-800 underline decoration-rose-200 decoration-2 italic">สมชาย ใจดี</span>
                       <div className="w-6 h-6 rounded-full bg-rose-200"></div>
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* Sales History Overlay */}
        {showSalesHistory && selectedStore && (
          <div className="absolute inset-y-0 right-0 w-[450px] bg-slate-50 shadow-[-30px_0_60px_rgba(0,0,0,0.2)] z-[3000] animate-in slide-in-from-right duration-500 flex flex-col border-l border-white/20">
             <div className="p-8 pb-4 flex justify-between items-center bg-white border-b border-slate-100">
                <div className="flex items-center gap-3">
                   <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-slate-900/20">
                      <span className="material-symbols-outlined text-2xl">receipt_long</span>
                   </div>
                   <div>
                      <h3 className="text-xl font-black text-slate-800 leading-none">ประวัติยอดขาย</h3>
                      <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{selectedStore.name}</p>
                   </div>
                </div>
                <button onClick={() => setShowSalesHistory(false)} className="w-10 h-10 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center">
                   <span className="material-symbols-outlined">close</span>
                </button>
             </div>

             <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {(() => {
                   const storeSales = sales.filter(s => s.store_id === selectedStore.id);
                   
                   if (storeSales.length === 0) return (
                     <div className="flex flex-col items-center justify-center py-20 opacity-30">
                        <span className="material-symbols-outlined text-6xl">history_toggle_off</span>
                        <p className="text-sm font-black uppercase mt-4">ยังไม่มีประวัติการซื้อขาย</p>
                     </div>
                   );

                   return storeSales.sort((a,b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()).map(sale => (
                     <div key={sale.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:border-slate-300 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                           <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">เลขที่บิล: {sale.id}</p>
                              <p className="text-xs font-black text-slate-800">{new Date(sale.created_at || '').toLocaleDateString('th-TH', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                           </div>
                           <div className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-[10px] font-black">
                              ฿{Number(sale.total_amount).toLocaleString()}
                           </div>
                        </div>
                        
                        <div className="space-y-2 pt-2 border-t border-dashed border-slate-100">
                           {sale.items?.map((item: any, idx: number) => (
                             <div key={idx} className="flex justify-between text-[10px] font-bold text-slate-500">
                                <span className="flex gap-2">
                                  <span className="text-slate-300">•</span>
                                  {item.product_name || `สินค้า #${item.product_id}`} x {item.quantity}
                                </span>
                                <span>฿{(item.price * item.quantity).toLocaleString()}</span>
                             </div>
                           ))}
                        </div>

                        <div className="mt-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                           <p className="text-[8px] font-black text-slate-300 uppercase">พนักงาน: {sale.driver_id}</p>
                           <button className="text-[10px] font-black text-primary flex items-center gap-1">ดูใบเสร็จ <span className="material-symbols-outlined text-xs">open_in_new</span></button>
                        </div>
                     </div>
                   ));
                })()}
             </div>
          </div>
        )}

        {isAdding && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
             <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl space-y-6">
                <h3 className="text-2xl font-black text-on-surface tracking-tighter">เพิ่มข้อมูลร้านค้าใหม่</h3>
                <input type="text" placeholder="ชื่อร้านค้า" className="w-full bg-slate-50 p-4 rounded-xl font-bold outline-none border-2 border-slate-100" value={newData.name} onChange={e => setNewData({...newData, name: e.target.value})} />
                
                <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border-2 border-slate-100">
                   <div className="flex justify-between items-center mb-1">
                     <label className="text-[10px] font-black uppercase text-slate-500">พิกัดสถานที่ (Latitude / Longitude)</label>
                     <button onClick={() => { setIsAdding(false); setAddMode(true); }} className="text-[10px] font-black text-primary flex items-center gap-1 hover:underline px-2 py-1 bg-primary/10 rounded-lg transition-colors">
                        <span className="material-symbols-outlined text-[14px]">location_on</span> เลือกจากแผนที่
                     </button>
                   </div>
                   <div className="flex flex-col gap-2">
                      <input 
                        type="text" 
                        placeholder="วางพิกัดที่นี่ (เช่น 14.999547, 102.118663)" 
                        className="w-full bg-white p-3 rounded-xl font-bold outline-none border border-slate-200 text-xs focus:border-primary/50 text-slate-700" 
                        value={coordText} 
                        onChange={e => {
                          const val = e.target.value;
                          setCoordText(val);
                          const match = val.match(/([\d.-]+)[\s,]+([\d.-]+)/);
                          if (match) {
                            const lat = parseFloat(match[1]);
                            const lng = parseFloat(match[2]);
                            let detectedZone = '';
                            surveyTargets.forEach(target => {
                              const dist = L.latLng(lat, lng).distanceTo(L.latLng(target.lat, target.lng));
                              if (dist <= target.radius) detectedZone = target.name;
                            });
                            setNewData({ ...newData, lat, lng, sales_zone: detectedZone });
                          }
                        }} 
                      />
                      {newData.sales_zone && (
                        <div className="text-[10px] font-bold text-primary flex items-center gap-1 px-1">
                          <span className="material-symbols-outlined text-[14px]">check_circle</span>
                          พิกัดอยู่ในโซน: {newData.sales_zone}
                        </div>
                      )}
                   </div>
                </div>
                <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white"><span className="material-symbols-outlined text-lg">visibility_off</span></div>
                      <div>
                         <h4 className="text-xs font-black text-amber-900">ปักเป็นหมุดลับ (Admin Only)</h4>
                         <p className="text-[10px] text-amber-600 font-bold">พนักงานจะไม่เห็นหมุดนี้</p>
                      </div>
                   </div>
                   <input type="checkbox" className="w-6 h-6 accent-amber-500" checked={newData.is_admin_only} onChange={e => setNewData({...newData, is_admin_only: e.target.checked})} />
                </div>
                <div className="flex gap-4">
                   <button onClick={() => { addStore(newData); setIsAdding(false); }} className="flex-1 bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-widest active:scale-95 transition-all">สร้างข้อมูลร้าน</button>
                   <button onClick={() => setIsAdding(false)} className="px-8 bg-slate-100 text-slate-400 py-4 rounded-2xl font-black uppercase">ยกเลิก</button>
                </div>
             </div>
          </div>
        )}
        {/* Target Area Configuration Modal */}
        {targetDraft && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
             <div className="bg-white rounded-[3rem] w-full max-w-md p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-300">
                <div className="flex items-center gap-4 mb-2">
                   <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
                      <span className="material-symbols-outlined text-2xl">track_changes</span>
                   </div>
                   <div>
                      <h3 className="text-xl font-black text-slate-800 leading-none">กำหนดพื้นที่เป้าหมาย</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Configure Target Survey Area</p>
                   </div>
                </div>

                <div className="space-y-4">
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1">ชื่อเรียกพื้นที่</label>
                      <input 
                        type="text" 
                        placeholder="เช่น พื้นที่ตลาดโคราช, โซนเขตเมือง..." 
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-xs font-bold outline-none focus:border-amber-500/30 transition-all"
                        value={targetDraft.name} 
                        onChange={e => setTargetDraft({...targetDraft, name: e.target.value})} 
                      />
                   </div>

                   <div className="space-y-3 bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-100 italic">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-black uppercase text-amber-600">ขอบเขตพื้นที่ (Area Radius)</label>
                        <span className="text-sm font-black text-slate-800">{(targetDraft.radius / 1000).toFixed(1)} KM</span>
                      </div>
                      <input 
                        type="range" 
                        min="100" 
                        max="20000" 
                        step="100"
                        className="w-full accent-amber-500"
                        value={targetDraft.radius}
                        onChange={e => setTargetDraft({...targetDraft, radius: parseInt(e.target.value)})}
                      />
                      <div className="flex justify-between text-[8px] font-black text-slate-300 uppercase">
                         <span>0.1 KM</span>
                         <span>20 KM</span>
                      </div>
                   </div>

                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1">เลือกสีระบุโซน</label>
                      <div className="flex gap-3">
                         {['#f59e0b', '#3b82f6', '#ef4444', '#10b981', '#8b5cf6'].map(color => (
                            <button 
                              key={color}
                              onClick={() => setTargetDraft({...targetDraft, color})}
                              className={`w-10 h-10 rounded-full border-4 transition-all ${targetDraft.color === color ? 'border-slate-800 scale-110 shadow-lg' : 'border-transparent shadow-sm'}`}
                              style={{ backgroundColor: color }}
                            />
                         ))}
                      </div>
                   </div>
                </div>

                <div className="flex gap-4 pt-4">
                   <button 
                    onClick={() => {
                      if (targetDraft.name) {
                        addSurveyTarget(targetDraft as SurveyTarget);
                        setTargetDraft(null);
                      } else {
                        alert('กรุณาระบุชื่อพื้นที่');
                      }
                    }} 
                    className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs active:scale-95 transition-all shadow-xl shadow-slate-900/20"
                   >
                      บันทึกพื้นที่
                   </button>
                   <button 
                    onClick={() => setTargetDraft(null)} 
                    className="px-8 bg-slate-100 text-slate-400 py-4 rounded-2xl font-black uppercase text-xs hover:bg-slate-200 transition-colors"
                   >
                      ยกเลิก
                   </button>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LegendItem({ icon, label, color, isCircular, isPin, isBox }: any) {
  return (
    <div className="flex items-center gap-3">
      {isCircular && <div className={`w-5 h-5 rounded-full ${color} border-2 border-white flex items-center justify-center`}><span className="material-symbols-outlined text-[10px] text-white">check</span></div>}
      {isPin && <div className="w-4 h-4 bg-rose-500 border-2 border-white shadow-sm" style={{ borderRadius: '50% 50% 50% 0', transform: 'rotate(-45deg)' }}></div>}
      {isBox && <div className={`w-5 h-5 rounded-lg ${color} flex items-center justify-center border-2 border-white shadow-sm`}><span className="material-symbols-outlined text-[10px] text-white">{icon}</span></div>}
      <span className="text-[9px] font-black text-on-surface uppercase tracking-tight">{label}</span>
    </div>
  );
}
