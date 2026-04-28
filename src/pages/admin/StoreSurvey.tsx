import React, { useState, useMemo } from 'react';
import { useStoreDB } from '../../store/StoreContext';
import { KORAT_SUBDISTRICTS } from '../../constants/locations';
import { mockDistricts, mockSubDistricts } from '../../store/mockData';
import L from 'leaflet';

export default function StoreSurvey() {
  const { stores, addStore, updateStore, deleteStore, drivers, fetchStoreById, surveyTargets } = useStoreDB();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isCustomerFilter, setIsCustomerFilter] = useState('ALL'); // ALL, YES, NO
  const [districtFilter, setDistrictFilter] = useState('');
  const [subDistrictFilter, setSubDistrictFilter] = useState('');
  const [driverFilter, setDriverFilter] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<any>(null);
  const [viewingPhotos, setViewingPhotos] = useState<string[] | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const getDynamicZone = (lat: number, lng: number, currentZone: string) => {
    if (!lat || !lng || !surveyTargets || surveyTargets.length === 0) return currentZone || '-';
    try {
      const storePos = L.latLng(lat, lng);
      for (const target of surveyTargets) {
        if (storePos.distanceTo(L.latLng(target.lat, target.lng)) <= target.radius) {
          return target.name; // Dynamically calculated zone overrides the static one if matched
        }
      }
    } catch(e) {}
    return currentZone || '-';
  };

  const handleViewPhotos = async (store: any) => {
    // If the store photo is already parsed or we have it? No, fetch it to be safe since it's lazy loaded.
    const fullStore = await fetchStoreById(store.id);
    if (!fullStore || !fullStore.photo_url) {
       alert('ร้านนี้ยังไม่มีรูปภาพหน้าร้าน');
       return;
    }
    
    let photos: string[] = [];
    try {
      const parsed = JSON.parse(fullStore.photo_url);
      photos = Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      photos = [fullStore.photo_url];
    }
    
    if (photos.length > 0) {
      setCurrentPhotoIndex(0);
      setViewingPhotos(photos);
    } else {
      alert('ร้านนี้ยังไม่มีรูปภาพหน้าร้าน');
    }
  };

  const handleOpenAdd = () => {
    setEditingStore({
      name: '', type: 'grocery', is_customer: false, district: '', sub_district: '', address: '', lat: 14.9736, lng: 102.0945
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (store: any) => {
    setEditingStore({ ...store });
    setIsModalOpen(true);
  };

  const handleSaveStore = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const isCustomer = data.get('is_customer') === 'true';
    const payload = {
      name: data.get('name') as string,
      type: data.get('type') as string,
      phone: data.get('phone') as string,
      is_customer: isCustomer,
      district: data.get('district') as string,
      sub_district: data.get('sub_district') as string,
      address: data.get('address') as string,
      sales_zone: data.get('sales_zone') as string || getDynamicZone(parseFloat(data.get('lat') as string) || 0, parseFloat(data.get('lng') as string) || 0, ''),
      lat: parseFloat(data.get('lat') as string) || 0,
      lng: parseFloat(data.get('lng') as string) || 0,
      status: editingStore.id ? editingStore.status : 'SUCCESS'
    };

    if (editingStore.id) {
      await updateStore(editingStore.id, payload);
    } else {
      await addStore(payload);
    }
    setIsModalOpen(false);
  };

  // Table Data Filtering
  const filteredData = useMemo(() => {
    return stores.filter(store => {
      const matchesSearch = !searchTerm || store.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || 
                           (statusFilter === 'DONE' && store.status === 'SUCCESS') ||
                           (statusFilter === 'PENDING' && store.status !== 'SUCCESS');
      const matchesCustomer = isCustomerFilter === 'ALL' || 
                             (isCustomerFilter === 'YES' && store.is_customer) ||
                             (isCustomerFilter === 'NO' && !store.is_customer);
      const matchesDistrict = !districtFilter || store.district_name === districtFilter;
      const matchesSubDistrict = !subDistrictFilter || store.sub_district_name === subDistrictFilter;
      const matchesDriver = !driverFilter || store.assigned_driver_id === driverFilter;
      
      return matchesSearch && matchesStatus && matchesCustomer && matchesDistrict && matchesSubDistrict && matchesDriver;
    });
  }, [stores, searchTerm, statusFilter, isCustomerFilter, districtFilter, subDistrictFilter, driverFilter]);

  const districtList = useMemo(() => mockDistricts.map(d => d.name_th).sort(), []);
  const subdistrictList = useMemo(() => {
    if (!districtFilter) return [];
    const distId = mockDistricts.find(d => d.name_th === districtFilter)?.id;
    return mockSubDistricts.filter(s => s.parent_id === distId).map(s => s.name_th).sort();
  }, [districtFilter]);

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 font-body">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-on-surface tracking-tighter">ร้านค้าและผลสำรวจ</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Master database for all pinned and surveyed locations</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-primary text-white px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-lg">add_location_alt</span>
          เพิ่มข้อมูลร้านค้าใหม่
        </button>
      </div>

      {/* Advanced Filter Panel */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Search */}
            <div className="space-y-1.5">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ค้นหาร้านค้า</label>
               <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-sm">search</span>
                  <input 
                    type="text" 
                    placeholder="ระบุชื่อร้านที่ต้องการ..."
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl pl-11 pr-4 py-3 text-sm font-bold outline-none focus:border-primary/30 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
               </div>
            </div>

            {/* Status Dropdown */}
            <div className="space-y-1.5">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">สถานะการสำรวจ</label>
               <select 
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none appearance-none"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
               >
                 <option value="ALL">ทั้งหมด</option>
                 <option value="DONE">สำรวจเรียบร้อยแล้ว</option>
                 <option value="PENDING">ยังไม่ได้สำรวจ</option>
               </select>
            </div>

            {/* Customer Radio (Custom looking select) */}
            <div className="space-y-1.5">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ประเภทลูกค้า</label>
               <div className="flex bg-slate-50 p-1.5 rounded-xl border-2 border-slate-100">
                  {['ALL', 'YES', 'NO'].map(type => (
                    <button 
                      key={type}
                      onClick={() => setIsCustomerFilter(type)}
                      className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all ${isCustomerFilter === type ? 'bg-white text-primary shadow-sm' : 'text-slate-400'}`}
                    >
                      {type === 'ALL' ? 'ทั้งหมด' : type === 'YES' ? 'เป็นลูกค้า' : 'ไม่เป็น'}
                    </button>
                  ))}
               </div>
            </div>

            {/* Driver Dropdown */}
            <div className="space-y-1.5">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">พนักงานที่รับผิดชอบ</label>
               <select 
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none appearance-none"
                value={driverFilter}
                onChange={(e) => setDriverFilter(e.target.value)}
               >
                 <option value="">ทุกคน (All Drivers)</option>
                 {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
               </select>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-dashed border-slate-100">
            <div className="space-y-1.5">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">พื้นที่ (อำเภอ และ ตำบล)</label>
               <div className="flex gap-4">
                  <select 
                    className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none appearance-none"
                    value={districtFilter}
                    onChange={(e) => { setDistrictFilter(e.target.value); setSubDistrictFilter(''); }}
                  >
                    <option value="">ทุกอำเภอ</option>
                    {districtList.map(d => <option key={d} value={d!}>{d}</option>)}
                  </select>
                  <select 
                    className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none appearance-none"
                    value={subDistrictFilter}
                    onChange={(e) => setSubDistrictFilter(e.target.value)}
                    disabled={!districtFilter}
                  >
                    <option value="">ทุกตำบล</option>
                    {subdistrictList.map((sd: any) => <option key={sd} value={sd}>{sd}</option>)}
                  </select>
               </div>
            </div>
            
            <div className="flex items-end gap-3 justify-end pb-1">
               <button 
                onClick={() => {
                  setSearchTerm(''); setStatusFilter('ALL'); setDistrictFilter(''); setDriverFilter(''); setSubDistrictFilter(''); setIsCustomerFilter('ALL');
                }}
                className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors"
               >
                 รีเซ็ตตัวกรอง
               </button>
               <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                  ผลการค้นหา: {filteredData.length} รายการ
               </div>
            </div>
         </div>
      </div>

      {/* Main Table Content */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
         <div className="overflow-x-auto max-h-[700px] custom-scrollbar">
            <table className="w-full">
               <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest sticky top-0 z-10">
                  <tr>
                     <th className="px-8 py-5 text-left">สถานะ</th>
                     <th className="px-4 py-5 text-left">ชื่อร้านค้า</th>
                     <th className="px-4 py-5 text-left">ประเภท</th>
                     <th className="px-4 py-5 text-left">พิกัด/พื้นที่</th>
                     <th className="px-4 py-5 text-left">พบร้านวันที่</th>
                     <th className="px-4 py-5 text-left">ผู้สำรวจ</th>
                     <th className="px-4 py-5 text-center">ลูกค้า</th>
                     <th className="px-8 py-5 text-right">จัดการ</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {filteredData.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-all group">
                       <td className="px-8 py-5">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${item.status === 'SUCCESS' ? 'bg-secondary/10 text-secondary' : 'bg-rose-500/10 text-rose-500'}`}>
                             {item.status === 'SUCCESS' ? 'DONE' : 'PENDING'}
                          </span>
                       </td>
                       <td className="px-4 py-5">
                          <div className="font-bold text-on-surface text-sm">{item.name}</div>
                          <div className="text-[10px] text-slate-400 font-medium truncate max-w-[200px]">{item.address}</div>
                       </td>
                       <td className="px-4 py-5">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-lg">
                             {item.type}
                          </span>
                       </td>
                        <td className="px-4 py-5">
                           <div className="text-xs font-bold text-slate-700">อ.{item.district_name || '-'} / ต.{item.sub_district_name || '-'}</div>
                           <div className="text-[10px] font-bold text-primary mt-0.5">โซน: {getDynamicZone(item.lat, item.lng, item.sales_zone)}</div>
                           <div className="text-[9px] font-mono text-slate-300">{(item.lat||0).toFixed(4)}, {(item.lng||0).toFixed(4)}</div>
                        </td>
                       <td className="px-4 py-5">
                          {item.status === 'SUCCESS' ? (
                            <>
                              <div className="text-xs font-bold text-slate-700">{item.created_at ? new Date(item.created_at).toLocaleDateString('th-TH', { timeZone: 'Asia/Bangkok' }) : '-'}</div>
                              <div className="text-[9px] font-bold text-slate-400">
                                {item.created_at ? new Date(item.created_at).toLocaleTimeString('th-TH', { timeZone: 'Asia/Bangkok', hour: '2-digit', minute: '2-digit' }) : ''}
                              </div>
                            </>
                          ) : (
                            <div className="text-xs font-bold text-slate-400 italic bg-slate-100 inline-block px-2 py-1 rounded-md">ยังไม่พบร้าน</div>
                          )}
                       </td>
                       <td className="px-4 py-5">
                          <div className="flex items-center gap-2">
                             <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-[10px] text-primary">person</span>
                             </div>
                             <span className="text-xs font-bold text-slate-700 truncate max-w-[120px]" title={item.created_by || 'ไม่ได้ระบุ'}>
                                {item.created_by || 'ไม่ได้ระบุ'}
                             </span>
                          </div>
                       </td>
                       <td className="px-4 py-5 text-center">
                          <button 
                             onClick={() => updateStore(item.id, { is_customer: !item.is_customer, status: 'SUCCESS' })}
                             className={`material-symbols-outlined text-lg hover:scale-125 transition-transform ${item.is_customer ? 'text-primary' : 'text-slate-200 hover:text-slate-400'}`} style={{ fontVariationSettings: "'FILL' 1" }}
                             title={item.is_customer ? "ลูกค้าประจํา (คลิกเพื่อยกเลิก)" : "ร้านค้าทั่วไป (คลิกเพื่อตั้งสกานะเป็นลูกค้า)"}
                          >
                             {item.is_customer ? 'stars' : 'radio_button_unchecked'}
                          </button>
                       </td>
                       <td className="px-8 py-5 text-right">
                           <div className="flex justify-end gap-2">
                              <button 
                                 onClick={() => handleViewPhotos(item)}
                                 className="w-9 h-9 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all"
                                 title="ดูรูปหน้าร้าน"
                              >
                                 <span className="material-symbols-outlined text-sm">photo_camera</span>
                              </button>
                              <button 
                                 onClick={() => handleOpenEdit(item)}
                                 className="w-9 h-9 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center hover:bg-primary hover:text-white transition-all"
                                 title="แก้ไข"
                              >
                                 <span className="material-symbols-outlined text-sm">edit</span>
                              </button>
                             <button 
                              onClick={() => { if(window.confirm('ยืนยันระบบการลบข้อมูลร้านค้า?')) deleteStore(item.id) }}
                              className="w-9 h-9 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"
                             >
                                <span className="material-symbols-outlined text-sm">delete</span>
                             </button>
                          </div>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
         
         {/* Footer / Pagination Mockup */}
         <div className="p-6 bg-slate-50 flex justify-between items-center text-slate-400">
            <p className="text-[10px] font-bold">แสดงทั้งหมด {filteredData.length} จาก {stores.length} รายการ</p>
            <div className="flex gap-2">
               <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-white text-xs font-bold">1</button>
               <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-white text-xs font-bold">2</button>
            </div>
         </div>
      </div>

      {/* Store Modal */}
      {isModalOpen && editingStore && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSaveStore} className="bg-white rounded-[2.5rem] w-full max-w-2xl p-8 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-slate-800">{editingStore.id ? 'แก้ไขข้อมูลร้านค้า' : 'เพิ่มร้านค้าใหม่'}</h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="w-10 h-10 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center hover:bg-rose-100 hover:text-rose-500 transition-all">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ชื่อร้านค้า <span className="text-rose-500">*</span></label>
                <input required name="name" defaultValue={editingStore.name} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-primary/30" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">เบอร์โทรติดต่อ</label>
                  <input name="phone" defaultValue={editingStore.phone} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-primary/30" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">สถานะลูกค้า</label>
                  <select name="is_customer" defaultValue={editingStore.is_customer ? 'true' : 'false'} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-primary/30">
                    <option value="true">เป็นลูกค้าของเรา</option>
                    <option value="false">ไม่ใช่ลูกค้า (General)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ที่อยู่ / รายละเอียด</label>
                <input name="address" defaultValue={editingStore.address} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-primary/30" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">อำเภอ</label>
                  <select 
                    name="district" 
                    value={editingStore.district} 
                    onChange={e => setEditingStore({ ...editingStore, district: e.target.value })} 
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-primary/30 appearance-none"
                  >
                    <option value="">-- เลือกอำเภอ --</option>
                    {mockDistricts.map(d => <option key={d.id} value={d.name_th}>{d.name_th}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ตำบล</label>
                  <select 
                    name="sub_district" 
                    value={editingStore.sub_district} 
                    onChange={e => setEditingStore({ ...editingStore, sub_district: e.target.value })} 
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-primary/30 appearance-none"
                  >
                    <option value="">-- เลือกตำบล --</option>
                    {mockSubDistricts
                      .filter(s => {
                         const distId = mockDistricts.find(d => d.name_th === editingStore.district)?.id;
                         return !distId || s.parent_id === distId;
                      })
                      .map(s => <option key={s.id} value={s.name_th}>{s.name_th}</option>)
                    }
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">โซน (Sales Zone)</label>
                  <input name="sales_zone" defaultValue={editingStore.sales_zone} placeholder="ระบุชื่อโซน..." className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-primary/30" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ละติจูด (Lat)</label>
                  <input name="lat" type="number" step="any" defaultValue={editingStore.lat} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-mono outline-none focus:border-primary/30" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ลองจิจูด (Lng)</label>
                  <input name="lng" type="number" step="any" defaultValue={editingStore.lng} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-mono outline-none focus:border-primary/30" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ประเภทร้าน</label>
                  <select name="type" defaultValue={editingStore.type} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-primary/30">
                    <option value="grocery">ร้านชำ / โชห่วย</option>
                    <option value="minimart">มินิมาร์ท</option>
                    <option value="restaurant">ร้านอาหาร</option>
                    <option value="wholesale">ร้านค้าส่ง</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-4 pt-6 border-t border-slate-100">
              <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 rounded-xl text-slate-400 font-black uppercase tracking-widest text-[10px] bg-slate-50 hover:bg-slate-100 transition-colors">ย้ายออก</button>
              <button type="submit" className="flex-1 py-4 rounded-xl text-white font-black uppercase tracking-widest text-[10px] bg-primary hover:brightness-110 shadow-lg shadow-primary/20 transition-all">บันทึกข้อมูลร้านค้า</button>
            </div>
          </form>
        </div>
      )}

      {/* Photo Viewer Modal */}
      {viewingPhotos && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[3000] flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full flex flex-col items-center">
            <button 
              onClick={() => setViewingPhotos(null)} 
              className="absolute -top-12 right-0 text-white hover:text-rose-400 transition-colors"
            >
              <span className="material-symbols-outlined text-4xl">close</span>
            </button>
            
            <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-black shadow-2xl border border-white/10">
              <img 
                src={viewingPhotos[currentPhotoIndex]} 
                className="w-full h-full object-contain" 
                alt="Store View" 
              />
              
              {viewingPhotos.length > 1 && (
                <>
                  <button 
                    onClick={() => setCurrentPhotoIndex(prev => prev > 0 ? prev - 1 : viewingPhotos.length - 1)}
                    className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-primary backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all"
                  >
                    <span className="material-symbols-outlined text-2xl">chevron_left</span>
                  </button>
                  <button 
                    onClick={() => setCurrentPhotoIndex(prev => prev < viewingPhotos.length - 1 ? prev + 1 : 0)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-primary backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all"
                  >
                    <span className="material-symbols-outlined text-2xl">chevron_right</span>
                  </button>
                  
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                    {viewingPhotos.map((_, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => setCurrentPhotoIndex(idx)}
                        className={`transition-all rounded-full ${idx === currentPhotoIndex ? 'w-8 h-2 bg-white' : 'w-2 h-2 bg-white/50 hover:bg-white/80'}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
            <p className="text-white/70 mt-4 text-sm font-black uppercase tracking-widest">
              รูปภาพที่ {currentPhotoIndex + 1} จาก {viewingPhotos.length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
