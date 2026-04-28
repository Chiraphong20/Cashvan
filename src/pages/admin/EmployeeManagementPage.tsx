import React, { useState, useMemo } from 'react';
import { useStore } from '../../store/StoreContext';
import { Driver } from '../../types';

export default function EmployeeManagementPage() {
  const { drivers, addDriver, updateDriver, deleteDriver, zones } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [formData, setFormData] = useState<Partial<Driver>>({
    id: '',
    name: '',
    phone: '',
    vehicle_plate: '',
    vehicle_code: '',
    assigned_zone: '',
    work_status: 'OFFLINE'
  });

  const filteredDrivers = useMemo(() => {
    return drivers.filter(d => 
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      d.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [drivers, searchTerm]);

  const handleOpenModal = (driver?: Driver) => {
    if (driver) {
      setEditingDriver(driver);
      setFormData(driver);
    } else {
      setEditingDriver(null);
      const nextId = `DRV-${String(drivers.length + 1).padStart(3, '0')}`;
      setFormData({
        id: nextId,
        name: '',
        phone: '',
        vehicle_plate: '',
        vehicle_code: '',
        assigned_zone: '',
        work_status: 'OFFLINE'
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDriver) {
      await updateDriver(editingDriver.id, formData);
    } else {
      await addDriver(formData as Driver);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบพนักงานรายนี้?')) {
      await deleteDriver(id);
    }
  };

  const subDistrictZones = zones.filter(z => z.parent_id !== 1 && z.parent_id !== null);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-on-surface font-headline tracking-tighter">ระบบจัดการพนักงาน</h1>
          <p className="text-sm text-slate-500 font-medium">เพิ่ม แก้ไข และจัดการรายชื่อพนักงานขับรถ/พนักงานขาย</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="btn-primary py-3 px-6 shadow-lg shadow-primary/20 flex items-center gap-2 group"
        >
          <span className="material-symbols-outlined group-hover:rotate-90 transition-transform">add</span>
          <span>เพิ่มพนักงานใหม่</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="precision-card p-5 bg-white border-l-4 border-primary">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">พนักงานทั้งหมด</p>
          <p className="text-2xl font-black text-slate-800 mt-1">{drivers.length} คน</p>
        </div>
        <div className="precision-card p-5 bg-white border-l-4 border-emerald-500">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">กำลังปฏิบัติงาน</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{drivers.filter(d => d.work_status === 'ONLINE').length} คน</p>
        </div>
      </div>

      <div className="precision-card bg-white shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
            <input 
              type="text" 
              placeholder="ค้นหาชื่อ หรือ รหัสพนักงาน..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-[10px] uppercase font-black tracking-widest text-slate-400 border-b border-slate-100">
                <th className="px-6 py-4">พนักงาน</th>
                <th className="px-6 py-4">ยานพาหนะ</th>
                <th className="px-6 py-4">พื้นที่รับผิดชอบ</th>
                <th className="px-6 py-4">สถานะ</th>
                <th className="px-6 py-4 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredDrivers.map(driver => (
                <tr key={driver.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden group-hover:scale-105 transition-transform shadow-sm">
                        <img 
                          src={driver.avatar_url || `https://i.pravatar.cc/100?u=${driver.id}`} 
                          alt={driver.name} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 leading-tight">{driver.name}</p>
                        <p className="text-[10px] font-medium text-slate-400 tracking-wider mt-0.5">{driver.id} • {driver.phone || '-'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-600">{driver.vehicle_code || '-'}</span>
                      <span className="text-[10px] text-slate-400">{driver.vehicle_plate || '-'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-600">
                    {driver.assigned_zone || 'ไม่ได้ระบุ'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      driver.work_status === 'ONLINE' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${driver.work_status === 'ONLINE' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
                      {driver.work_status === 'ONLINE' ? 'เริ่มงานแล้ว' : 'ยังไม่เริ่มงาน'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                       <button onClick={() => handleOpenModal(driver)} className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors">
                        <span className="material-symbols-outlined text-xl">edit_note</span>
                       </button>
                       <button onClick={() => handleDelete(driver.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <span className="material-symbols-outlined text-xl">delete</span>
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg relative overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-800">{editingDriver ? 'แก้ไขข้อมูล' : 'เพิ่มพนักงาน'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 transition-colors">
                <span className="material-symbols-outlined text-slate-500">close</span>
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase text-slate-400 ml-1">รหัสพนักงาน</label>
                  <input type="text" required readOnly={!!editingDriver} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" value={formData.id} onChange={(e) => setFormData({...formData, id: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase text-slate-400 ml-1">เบอร์ติดต่อ</label>
                  <input type="tel" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase text-slate-400 ml-1">ชื่อ-นามสกุล</label>
                <input type="text" required className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase text-slate-400 ml-1">รหัสยานพาหนะ</label>
                  <input type="text" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm" value={formData.vehicle_code} onChange={(e) => setFormData({...formData, vehicle_code: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase text-slate-400 ml-1">เลขทะเบียน</label>
                  <input type="text" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm" value={formData.vehicle_plate} onChange={(e) => setFormData({...formData, vehicle_plate: e.target.value})} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase text-slate-400 ml-1">พื้นที่รับผิดชอบ</label>
                <select className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm" value={formData.assigned_zone} onChange={(e) => setFormData({...formData, assigned_zone: e.target.value})}>
                  <option value="">เลือกพื้นที่...</option>
                  {subDistrictZones.map(zone => (
                    <option key={zone.id} value={zone.name_th}>{zone.name_th}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-3 mt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-2xl transition-colors">ยกเลิก</button>
                <button type="submit" className="flex-[2] py-3 text-sm font-black text-white bg-primary hover:bg-primary-dark rounded-2xl shadow-lg transition-all active:scale-[0.98]">{editingDriver ? 'บันทึก' : 'เพิ่มพนักงาน'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
