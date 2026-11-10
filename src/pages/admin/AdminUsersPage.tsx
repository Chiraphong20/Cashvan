import React, { useEffect, useState } from 'react';
import { useAdminAuth } from '../../store/AdminAuthContext';

interface AdminUser {
  id: number;
  username: string;
  name: string;
  is_active: number;
  role: 'SUPER_ADMIN' | 'ADMIN';
  created_at?: string;
}

const emptyForm = { username: '', name: '', password: '', role: 'ADMIN' as 'SUPER_ADMIN' | 'ADMIN' };

export default function AdminUsersPage() {
  const { currentAdmin, token, logout, isSuperAdmin } = useAdminAuth();
  const authHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const notify = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const load = async () => {
    try {
      const res = await fetch('/api/admin/users', { headers: authHeaders });
      if (res.status === 401) { logout(); return; }
      const data = await res.json();
      if (data.status === 'success') setAdmins(data.admins);
      else notify('error', data.message || 'โหลดข้อมูลไม่สำเร็จ');
    } catch {
      notify('error', 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (isSuperAdmin) load(); else setLoading(false); }, []);

  const openModal = (admin?: AdminUser) => {
    setEditing(admin || null);
    setForm(admin ? { username: admin.username, name: admin.name, password: '', role: admin.role } : emptyForm);
    setShowPwd(false);
    setShowModal(true);
  };

  const call = async (url: string, method: string, body?: object) => {
    const res = await fetch(url, {
      method,
      headers: authHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.status === 401) { logout(); throw new Error('เซสชันหมดอายุ'); }
    const data = await res.json();
    if (data.status !== 'success') throw new Error(data.message || 'เกิดข้อผิดพลาด');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await call(`/api/admin/users/${editing.id}`, 'PUT', {
          name: form.name,
          password: form.password || undefined,
          role: form.role,
        });
        notify('success', 'บันทึกการแก้ไขเรียบร้อย');
      } else {
        await call('/api/admin/users', 'POST', form);
        notify('success', `เพิ่มผู้ดูแล "${form.name}" เรียบร้อย`);
      }
      setShowModal(false);
      await load();
    } catch (err: any) {
      notify('error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (admin: AdminUser) => {
    const next = !admin.is_active;
    if (!next && !window.confirm(`ระงับบัญชี "${admin.name}" ? ผู้ใช้นี้จะเข้าสู่ระบบไม่ได้`)) return;
    try {
      await call(`/api/admin/users/${admin.id}`, 'PUT', { is_active: next });
      notify('success', next ? 'เปิดใช้งานบัญชีแล้ว' : 'ระงับบัญชีแล้ว');
      await load();
    } catch (err: any) {
      notify('error', err.message);
    }
  };

  const handleDelete = async (admin: AdminUser) => {
    if (!window.confirm(`ลบผู้ดูแล "${admin.name}" (${admin.username}) ถาวร?`)) return;
    try {
      await call(`/api/admin/users/${admin.id}`, 'DELETE');
      notify('success', 'ลบผู้ดูแลเรียบร้อย');
      await load();
    } catch (err: any) {
      notify('error', err.message);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="p-8 text-center text-slate-400 font-bold">
        <span className="material-symbols-outlined text-5xl block mb-2">lock</span>
        หน้านี้สำหรับ Super Admin เท่านั้น
      </div>
    );
  }

  const inputCls = 'w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none';

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 animate-in fade-in duration-500">
      {toast && (
        <div className={`fixed top-6 right-6 z-[9999] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-white text-sm font-bold ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`}>
          <span className="material-symbols-outlined text-lg">{toast.type === 'success' ? 'check_circle' : 'error'}</span>
          {toast.message}
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-on-surface tracking-tighter">จัดการผู้ดูแลระบบ</h1>
          <p className="text-sm text-slate-500 font-medium">เพิ่ม แก้ไข ระงับ และรีเซ็ตรหัสผ่านของบัญชีแอดมิน</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-primary text-white px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined">add</span>
          เพิ่มผู้ดูแล
        </button>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/80 text-[10px] uppercase font-black tracking-widest text-slate-400 border-b border-slate-100">
                <th className="px-6 py-4">ผู้ใช้</th>
                <th className="px-6 py-4">Username</th>
                <th className="px-6 py-4">สิทธิ์</th>
                <th className="px-6 py-4">สถานะ</th>
                <th className="px-6 py-4 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={5} className="py-16 text-center text-slate-400 font-bold text-sm">กำลังโหลด...</td></tr>
              ) : admins.map(a => {
                const isSelf = a.id === currentAdmin?.id;
                const active = !!a.is_active;
                return (
                  <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black shrink-0">
                          {a.name?.charAt(0).toUpperCase() || 'A'}
                        </div>
                        <p className="font-bold text-slate-800">
                          {a.name}
                          {isSelf && <span className="ml-2 text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase">คุณ</span>}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-600">{a.username}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${a.role === 'SUPER_ADMIN' ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-500'}`}>
                        {a.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${active ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-rose-400'}`} />
                        {active ? 'ใช้งาน' : 'ถูกระงับ'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openModal(a)} title="แก้ไข / รีเซ็ตรหัสผ่าน" className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all">
                          <span className="material-symbols-outlined text-xl">edit_note</span>
                        </button>
                        <button onClick={() => toggleActive(a)} disabled={isSelf} title={active ? 'ระงับบัญชี' : 'เปิดใช้งาน'} className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all disabled:opacity-30 disabled:hover:bg-transparent">
                          <span className="material-symbols-outlined text-xl">{active ? 'block' : 'check_circle'}</span>
                        </button>
                        <button onClick={() => handleDelete(a)} disabled={isSelf} title="ลบ" className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all disabled:opacity-30 disabled:hover:bg-transparent">
                          <span className="material-symbols-outlined text-xl">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !saving && setShowModal(false)} />
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-800">{editing ? 'แก้ไขผู้ดูแล' : 'เพิ่มผู้ดูแลใหม่'}</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase text-slate-400 ml-1">Username *</label>
                <input required readOnly={!!editing} className={`${inputCls} ${editing ? 'bg-slate-50 text-slate-400' : ''}`} value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase text-slate-400 ml-1">ชื่อที่แสดง *</label>
                <input required className={inputCls} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase text-slate-400 ml-1">สิทธิ์การใช้งาน</label>
                <select
                  className={inputCls}
                  value={form.role}
                  disabled={editing?.id === currentAdmin?.id}
                  onChange={e => setForm({ ...form, role: e.target.value as 'SUPER_ADMIN' | 'ADMIN' })}
                >
                  <option value="ADMIN">Admin - ใช้งานระบบทั่วไป</option>
                  <option value="SUPER_ADMIN">Super Admin - จัดการผู้ดูแลได้</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase text-slate-400 ml-1">
                  {editing ? 'รหัสผ่านใหม่ (เว้นว่างหากไม่เปลี่ยน)' : 'รหัสผ่าน * (อย่างน้อย 6 ตัว)'}
                </label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    required={!editing}
                    minLength={6}
                    className={`${inputCls} pr-12`}
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary">
                    <span className="material-symbols-outlined text-[20px]">{showPwd ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} disabled={saving} className="flex-1 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-2xl disabled:opacity-40">ยกเลิก</button>
                <button type="submit" disabled={saving} className="flex-[2] py-3 text-sm font-black text-white bg-primary hover:brightness-110 rounded-2xl shadow-lg shadow-primary/20 disabled:opacity-60">
                  {saving ? 'กำลังบันทึก...' : editing ? 'บันทึกการแก้ไข' : 'เพิ่มผู้ดูแล'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
