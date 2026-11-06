import React, { useEffect, useState } from 'react';
import { UserRound, X } from 'lucide-react';
import type { AppSettings } from '../types/hui';

interface Props { isOpen: boolean; required: boolean; settings: AppSettings; onClose: () => void; onSave: (value: AppSettings) => Promise<void>; }
export const OwnerProfileModal: React.FC<Props> = ({ isOpen, required, settings, onClose, onSave }) => {
  const [name,setName]=useState(settings.ownerName);
  const [idNumber,setIdNumber]=useState(settings.ownerIdNumber || '');
  const [phone,setPhone]=useState(settings.ownerPhone);
  const [address,setAddress]=useState(settings.ownerAddress || '');
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  useEffect(()=>{ if(isOpen){setName(settings.ownerName);setIdNumber(settings.ownerIdNumber||'');setPhone(settings.ownerPhone);setAddress(settings.ownerAddress||'');setError('');}},[isOpen,settings]);
  if(!isOpen)return null;
  const save=async()=>{setError('');if(!name.trim()||!idNumber.trim()||!phone.trim()||!address.trim()){setError('Vui lòng nhập đầy đủ họ tên, CCCD, số điện thoại và địa chỉ hiện tại.');return;}if(!/^[0-9]{9,12}$/.test(idNumber.replace(/[ .-]/g,''))){setError('Số CCCD/CMND phải gồm 9–12 chữ số.');return;}setBusy(true);try{await onSave({...settings,ownerName:name.trim(),ownerIdNumber:idNumber.trim(),ownerPhone:phone.trim(),ownerAddress:address.trim()});onClose();}catch(e){setError(e instanceof Error?e.message:'Không thể lưu hồ sơ.');}finally{setBusy(false);}};
  return <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4"><div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
    <div className="flex items-center justify-between"><div className="flex gap-2 items-center"><UserRound className="text-teal-700"/><div><h2 className="font-bold text-lg">Hồ sơ chủ hụi</h2><p className="text-xs text-slate-500">{required?'Cần khai báo trước khi sử dụng sổ hụi':'Thông tin dùng trong văn bản thỏa thuận'}</p></div></div>{!required&&<button onClick={onClose}><X/></button>}</div>
    <label className="block text-xs font-semibold">Họ và tên đầy đủ<input value={name} onChange={e=>setName(e.target.value)} autoComplete="name" className="mt-1 w-full p-3 border rounded-xl text-sm" placeholder="Họ tên chủ hụi"/></label>
    <label className="block text-xs font-semibold">Số CCCD/CMND<input value={idNumber} onChange={e=>setIdNumber(e.target.value)} inputMode="numeric" className="mt-1 w-full p-3 border rounded-xl text-sm" placeholder="Số giấy tờ tùy thân"/></label>
    <label className="block text-xs font-semibold">Số điện thoại<input value={phone} onChange={e=>setPhone(e.target.value)} inputMode="tel" autoComplete="tel" className="mt-1 w-full p-3 border rounded-xl text-sm" placeholder="Số điện thoại liên hệ"/></label>
    <label className="block text-xs font-semibold">Địa chỉ nơi ở hiện tại<textarea value={address} onChange={e=>setAddress(e.target.value)} rows={2} autoComplete="street-address" className="mt-1 w-full p-3 border rounded-xl text-sm" placeholder="Số nhà, đường, ấp/khóm, xã/phường, tỉnh/thành"/></label>
    <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3">CCCD và địa chỉ là dữ liệu cá nhân nhạy cảm. Hiện ứng dụng lưu dữ liệu trên thiết bị; hãy khóa máy và bảo vệ file sao lưu. Không gửi bản thỏa thuận công khai.</p>
    {error&&<p className="text-sm text-red-600">{error}</p>}
    <div className="flex gap-2"><button disabled={required||busy} onClick={onClose} className="flex-1 p-3 border rounded-xl disabled:opacity-40">Để sau</button><button disabled={busy} onClick={()=>void save()} className="flex-1 p-3 bg-teal-700 text-white rounded-xl font-bold">{busy?'Đang lưu…':'Lưu hồ sơ'}</button></div>
  </div></div>;
};