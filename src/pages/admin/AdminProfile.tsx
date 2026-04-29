import React, { useState } from 'react';
import { useAdminAuth } from '../../store/AdminAuthContext';

export default function AdminProfile() {
  const { currentAdmin, updateProfile } = useAdminAuth();
  const [name, setName] = useState(currentAdmin?.name || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (newPassword && newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'รหัสผ่านใหม่ไม่ตรงกัน' });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: currentAdmin?.id, 
          name, 
          newPassword: newPassword || undefined 
        })
      });
      const data = await res.json();

      if (data.status === 'success') {
        updateProfile(data.admin);
        setMessage({ type: 'success', text: 'อัพเดทข้อมูลโปรไฟล์เรียบร้อยแล้ว' });
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage({ type: 'error', text: data.message || 'เกิดข้อผิดพลาดในการอัพเดทข้อมูล' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-4xl font-black text-on-surface tracking-tighter">Admin Profile</h1>
        <p className="text-slate-400 font-bold mt-2 uppercase tracking-widest text-xs">Manage your account settings</p>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden max-w-2xl">
        <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex items-center gap-6">
           <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-black">
              {currentAdmin?.name?.charAt(0).toUpperCase() || 'A'}
           </div>
           <div>
              <p className="text-xl font-black text-slate-800">{currentAdmin?.name}</p>
              <p className="text-xs font-bold text-slate-400 mt-1">Username: {currentAdmin?.username}</p>
           </div>
        </div>

        <form onSubmit={handleUpdate} className="p-8 space-y-6">
          {message.text && (
            <div className={`p-4 rounded-2xl text-sm font-bold flex items-center gap-2 ${message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
              <span className="material-symbols-outlined">{message.type === 'error' ? 'error' : 'check_circle'}</span>
              {message.text}
            </div>
          )}

          <div className="space-y-2">
             <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">ชื่อที่แสดง (Display Name)</label>
             <input 
               type="text" 
               value={name}
               onChange={e => setName(e.target.value)}
               className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none focus:border-primary/50 transition-all"
               required
             />
          </div>

          <div className="pt-6 border-t border-dashed border-slate-200">
             <h3 className="text-sm font-black text-slate-800 mb-4 uppercase tracking-widest">เปลี่ยนรหัสผ่าน (เว้นว่างไว้หากไม่ต้องการเปลี่ยน)</h3>
             <div className="space-y-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">รหัสผ่านใหม่ (New Password)</label>
                   <div className="relative">
                     <input 
                       type={showNewPassword ? 'text' : 'password'}
                       value={newPassword}
                       onChange={e => setNewPassword(e.target.value)}
                       className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 pr-12 font-bold outline-none focus:border-primary/50 transition-all"
                       placeholder="ระบุรหัสผ่านใหม่"
                     />
                     <button
                       type="button"
                       onClick={() => setShowNewPassword(!showNewPassword)}
                       className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors focus:outline-none flex items-center justify-center"
                     >
                       <span className="material-symbols-outlined text-[20px]">{showNewPassword ? 'visibility_off' : 'visibility'}</span>
                     </button>
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">ยืนยันรหัสผ่านใหม่ (Confirm Password)</label>
                   <div className="relative">
                     <input 
                       type={showConfirmPassword ? 'text' : 'password'}
                       value={confirmPassword}
                       onChange={e => setConfirmPassword(e.target.value)}
                       className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 pr-12 font-bold outline-none focus:border-primary/50 transition-all"
                       placeholder="ยืนยันรหัสผ่านใหม่อีกครั้ง"
                     />
                     <button
                       type="button"
                       onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                       className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors focus:outline-none flex items-center justify-center"
                     >
                       <span className="material-symbols-outlined text-[20px]">{showConfirmPassword ? 'visibility_off' : 'visibility'}</span>
                     </button>
                   </div>
                </div>
             </div>
          </div>

          <div className="pt-6">
             <button 
               type="submit" 
               disabled={isLoading}
               className="w-full bg-primary text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-70 disabled:hover:translate-y-0"
             >
               {isLoading ? 'กำลังบันทึกข้อมูล...' : 'บันทึกการตั้งค่า'}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
}
