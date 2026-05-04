import React, { useState, useMemo } from 'react';
import { useStore } from '../../store/StoreContext';
import { Driver } from '../../types';

type Toast = { type: 'success' | 'error'; message: string };

export default function EmployeeManagementPage() {
  const { drivers, addDriver, updateDriver, deleteDriver } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [formData, setFormData] = useState<Partial<Driver>>({
    id: '', name: '', phone: '', vehicle_plate: '', vehicle_code: '', assigned_zone: '', work_status: 'OFFLINE'
  });

  const showToast = (type: Toast['type'], message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const filteredDrivers = useMemo(() =>
    drivers.filter(d =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.phone || '').includes(searchTerm)
    ), [drivers, searchTerm]);

  const handleOpenModal = (driver?: Driver) => {
    if (driver) {
      setEditingDriver(driver);
      setFormData({ ...driver });
    } else {
      setEditingDriver(null);
      const nextId = `DRV-${String(drivers.length + 1).padStart(3, '0')}`;
      setFormData({ id: nextId, name: '', phone: '', vehicle_plate: '', vehicle_code: '', assigned_zone: '', work_status: 'OFFLINE' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return showToast('error', 'กรุณากรอกชื่อพนักงาน');
    if (!formData.id?.trim()) return showToast('error', 'กรุณากรอกรหัสพนักงาน');
    setIsSaving(true);
    try {
      if (editingDriver) {
        await updateDriver(editingDriver.id, formData);
        showToast('success', `แก้ไขข้อมูล "${formData.name}" เรียบร้อยแล้ว`);
      } else {
        await addDriver(formData as Driver);
        showToast('success', `เพิ่มพนักงาน "${formData.name}" เรียบร้อยแล้ว`);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      showToast('error', `เกิดข้อผิดพลาด: ${err?.message || 'กรุณาลองใหม่อีกครั้ง'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (driver: Driver) => {
    if (!window.confirm(`ยืนยันการลบพนักงาน "${driver.name}"?\nข้อมูลที่เกี่ยวข้องจะไม่ถูกลบ`)) return;
    setIsDeleting(driver.id);
    try {
      await deleteDriver(driver.id);
      showToast('success', `ลบพนักงาน "${driver.name}" เรียบร้อยแล้ว`);
    } catch (err: any) {
      showToast('error', `ไม่สามารถลบได้: ${err?.message || 'กรุณาลองใหม่'}`);
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[9999] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-white text-sm font-bold animate-in slide-in-from-right-10 duration-300 ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`}>
          <span className="material-symbols-outlined text-lg">{toast.type === 'success' ? 'check_circle' : 'error'}</span>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-on-surface font-headline tracking-tighter">ระบบจัดการพนักงาน</h1>
          <p className="text-sm text-slate-500 font-medium">เพิ่ม แก้ไข และจัดการรายชื่อพนักงานขับรถ/พนักงานขาย</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-primary text-white px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined">add</span>
          เพิ่มพนักงานใหม่
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 border-l-4 border-l-primary">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">พนักงานทั้งหมด</p>
          <p className="text-3xl font-black text-slate-800 mt-1">{drivers.length} <span className="text-base font-bold text-slate-400">คน</span></p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 border-l-4 border-l-emerald-500">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">กำลังปฏิบัติงาน</p>
          <p className="text-3xl font-black text-emerald-600 mt-1">{drivers.filter(d => d.work_status === 'ONLINE').length} <span className="text-base font-bold text-slate-400">คน</span></p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 border-l-4 border-l-amber-400">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ผลการค้นหา</p>
          <p className="text-3xl font-black text-amber-600 mt-1">{filteredDrivers.length} <span className="text-base font-bold text-slate-400">คน</span></p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 max-w-md w-full">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
            <input
              type="text"
              placeholder="ค้นหาชื่อ, รหัส หรือเบอร์โทร..."
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0">
            แสดง {filteredDrivers.length} / {drivers.length} รายการ
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
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
              {filteredDrivers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center opacity-30">
                    <span className="material-symbols-outlined text-5xl block">group_off</span>
                    <p className="font-black uppercase tracking-[0.2em] text-xs mt-3">ไม่พบพนักงาน</p>
                  </td>
                </tr>
              ) : filteredDrivers.map(driver => (
                <tr key={driver.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden group-hover:scale-105 transition-transform shadow-sm shrink-0">
                        <img src={driver.avatar_url || `https://i.pravatar.cc/100?u=${driver.id}`} alt={driver.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 leading-tight">{driver.name}</p>
                        <p className="text-[10px] font-medium text-slate-400 tracking-wider mt-0.5">{driver.id} • {driver.phone || 'ไม่มีเบอร์'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-700">{driver.vehicle_code || '-'}</span>
                      <span className="text-[10px] text-slate-400">{driver.vehicle_plate || '-'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-600">{driver.assigned_zone || 'ไม่ได้ระบุ'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${driver.work_status === 'ONLINE' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${driver.work_status === 'ONLINE' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                      {driver.work_status === 'ONLINE' ? 'เริ่มงานแล้ว' : 'ยังไม่เริ่มงาน'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleOpenModal(driver)}
                        className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                        title="แก้ไขข้อมูล"
                      >
                        <span className="material-symbols-outlined text-xl">edit_note</span>
                      </button>
                      <button
                        onClick={() => handleDelete(driver)}
                        disabled={isDeleting === driver.id}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all disabled:opacity-40"
                        title="ลบพนักงาน"
                      >
                        {isDeleting === driver.id
                          ? <span className="material-symbols-outlined text-xl animate-spin">progress_activity</span>
                          : <span className="material-symbols-outlined text-xl">delete</span>}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !isSaving && setIsModalOpen(false)} />
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg relative overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-xl font-black text-slate-800">{editingDriver ? 'แก้ไขข้อมูลพนักงาน' : 'เพิ่มพนักงานใหม่'}</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                  {editingDriver ? `ID: ${editingDriver.id}` : 'กรอกข้อมูลพนักงาน'}
                </p>
              </div>
              <button
                onClick={() => !isSaving && setIsModalOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-200 transition-colors"
              >
                <span className="material-symbols-outlined text-slate-500">close</span>
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase text-slate-400 ml-1">รหัสพนักงาน <span className="text-rose-400">*</span></label>
                  <input
                    type="text"
                    required
                    readOnly={!!editingDriver}
                    className={`w-full px-4 py-2.5 rounded-xl text-sm font-bold border outline-none transition-all ${editingDriver ? 'bg-slate-50 border-slate-100 text-slate-400' : 'bg-white border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20'}`}
                    value={formData.id || ''}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase text-slate-400 ml-1">เบอร์ติดต่อ</label>
                  <input
                    type="tel"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0xx-xxx-xxxx"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase text-slate-400 ml-1">ชื่อ-นามสกุล <span className="text-rose-400">*</span></label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="กรอกชื่อ-นามสกุล"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase text-slate-400 ml-1">รหัสรถ</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    value={formData.vehicle_code || ''}
                    onChange={(e) => setFormData({ ...formData, vehicle_code: e.target.value })}
                    placeholder="เช่น V-01"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase text-slate-400 ml-1">เลขทะเบียน</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    value={formData.vehicle_plate || ''}
                    onChange={(e) => setFormData({ ...formData, vehicle_plate: e.target.value })}
                    placeholder="เช่น กข 1234"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase text-slate-400 ml-1">พื้นที่รับผิดชอบ</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    value={formData.assigned_zone || ''}
                    onChange={(e) => setFormData({ ...formData, assigned_zone: e.target.value })}
                    placeholder="เช่น โซนเมือง"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase text-slate-400 ml-1">สถานะการทำงาน</label>
                  <select
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    value={formData.work_status || 'OFFLINE'}
                    onChange={(e) => setFormData({ ...formData, work_status: e.target.value as 'ONLINE' | 'OFFLINE' })}
                  >
                    <option value="OFFLINE">ยังไม่เริ่มงาน</option>
                    <option value="ONLINE">กำลังปฏิบัติงาน</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => !isSaving && setIsModalOpen(false)}
                  disabled={isSaving}
                  className="flex-1 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-2xl transition-colors disabled:opacity-40"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-[2] py-3 text-sm font-black text-white bg-primary hover:brightness-110 rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isSaving
                    ? <><span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> กำลังบันทึก...</>
                    : editingDriver ? 'บันทึกการแก้ไข' : 'เพิ่มพนักงาน'
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
