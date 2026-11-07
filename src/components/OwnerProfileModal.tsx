import React, { useEffect, useState } from 'react';
import { UserRound, X, Save } from 'lucide-react';
import type { AppSettings } from '../types/hui';

interface Props { isOpen: boolean; required: boolean; settings: AppSettings; onClose: () => void; onSave: (value: AppSettings) => Promise<void>; }
const fieldClass = 'mt-1.5 w-full min-h-12 p-3.5 border border-slate-200 rounded-xl text-base font-normal focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50';
const labelClass = 'block text-sm font-semibold text-slate-700';
export const OwnerProfileModal: React.FC<Props> = ({ isOpen, required, settings, onClose, onSave }) => {
  const [name,setName]=useState(settings.ownerName);
  const [idNumber,setIdNumber]=useState(settings.ownerIdNumber || '');
  const [phone,setPhone]=useState(settings.ownerPhone);
  const [address,setAddress]=useState(settings.ownerAddress || '');
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  useEffect(()=>{ if(isOpen){setName(settings.ownerName);setIdNumber(settings.ownerIdNumber||'');setPhone(settings.ownerPhone);setAddress(settings.ownerAddress||'');setError('');}},[isOpen,settings]);
  if(!isOpen)return null;
  const save=async()=>{
    setError('');
    if(!name.trim()||!idNumber.trim()||!phone.trim()||!address.trim()){setError('Vui lòng nhập đầy đủ họ tên, CCCD, số điện thoại và địa chỉ hiện tại.');return;}
    if(!/^[0-9]{9,12}$/.test(idNumber.replace(/[ .-]/g,''))){setError('Số CCCD/CMND phải gồm 9–12 chữ số.');return;}
    if(!/^[0-9+() .-]{8,15}$/.test(phone.trim())){setError('Vui lòng kiểm tra số điện thoại.');return;}
    setBusy(true);
    try{await onSave({...settings,ownerName:name.trim(),ownerIdNumber:idNumber.trim(),ownerPhone:phone.trim(),ownerAddress:address.trim()});onClose();}
    catch(e){setError(e instanceof Error?e.message:'Không thể lưu hồ sơ.');}
    finally{setBusy(false);}
  };
  return <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
    <div className="bg-white rounded-3xl max-w-md w-full max-h-[92dvh] flex flex-col shadow-2xl border border-slate-200">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
        <div className="flex gap-2 items-center"><UserRound className="w-5 h-5 text-teal-700"/><div><h2 className="font-bold text-lg text-slate-900">Hồ sơ chủ hụi</h2><p className="text-xs text-slate-500">{required?'Cần khai báo trước khi sử dụng sổ hụi':'Thông tin dùng trong văn bản thỏa thuận'}</p></div></div>
        {!required&&<button type="button" aria-label="Đóng" onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100"><X className="w-5 h-5"/></button>}
      </div>
      <div className="p-5 sm:p-6 space-y-4 overflow-y-auto overscroll-contain flex-1">
        <label className={labelClass}>Họ và tên đầy đủ *<input value={name} onChange={e=>setName(e.target.value)} autoComplete="name" className={fieldClass} placeholder="Họ tên chủ hụi"/></label>
        <label className={labelClass}>Số CCCD/CMND *<input value={idNumber} onChange={e=>setIdNumber(e.target.value)} inputMode="numeric" autoComplete="off" maxLength={15} className={fieldClass} placeholder="Số giấy tờ tùy thân"/></label>
        <label className={labelClass}>Số điện thoại *<input value={phone} onChange={e=>setPhone(e.target.value)} inputMode="tel" autoComplete="tel" className={fieldClass} placeholder="Số điện thoại liên hệ"/></label>
        <label className={labelClass}>Địa chỉ nơi ở hiện tại *<textarea value={address} onChange={e=>setAddress(e.target.value)} rows={3} autoComplete="street-address" className={fieldClass+' resize-y'} placeholder="Số nhà, đường, ấp/khóm, xã/phường, tỉnh/thành"/></label>
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3">CCCD và địa chỉ là dữ liệu cá nhân nhạy cảm. Hiện ứng dụng lưu dữ liệu trên thiết bị; hãy khóa máy và bảo vệ file sao lưu. Không gửi bản thỏa thuận công khai.</p>
        {error&&<p role="alert" className="text-sm text-red-600 bg-red-50 rounded-xl p-3">{error}</p>}
      </div>
      <div className="p-4 border-t border-slate-100 flex gap-3 shrink-0"><button type="button" disabled={required||busy} onClick={onClose} className="flex-1 min-h-12 p-3 border rounded-xl font-semibold disabled:opacity-40">Để sau</button><button type="button" disabled={busy} onClick={()=>void save()} className="flex-1 min-h-12 p-3 bg-teal-700 text-white rounded-xl font-bold disabled:opacity-50"><Save className="inline w-4 h-4 mr-2"/>{busy?'Đang lưu…':'Lưu hồ sơ'}</button></div>
    </div>
  </div>;
};
