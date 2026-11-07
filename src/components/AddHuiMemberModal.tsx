import React, { useEffect, useState } from 'react';
import { UserRound, X, Save } from 'lucide-react';
import type { HuiMember } from '../types/hui';

export interface NewHuiMemberInfo {
  id?: string;
  name: string;
  phone: string;
  idNumber: string;
  birthDate: string;
  address: string;
  sharesCount: number;
}
interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (member: NewHuiMemberInfo) => void;
  member?: HuiMember;
  sharesLocked?: boolean;
}
const fieldClass = 'mt-1.5 w-full min-h-12 p-3.5 border border-slate-200 rounded-xl text-base font-normal focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50';
const labelClass = 'block text-sm font-semibold text-slate-700';
export const AddHuiMemberModal: React.FC<Props> = ({ isOpen, onClose, onSave, member, sharesLocked = false }) => {
  const [name,setName]=useState(''); const [phone,setPhone]=useState('');
  const [idNumber,setIdNumber]=useState(''); const [birthDate,setBirthDate]=useState('');
  const [address,setAddress]=useState(''); const [sharesCount,setSharesCount]=useState(1);
  const [error,setError]=useState('');
  useEffect(()=>{ if(isOpen){setName(member?.name||'');setPhone(member?.phone||'');setIdNumber(member?.idNumber||'');setBirthDate(member?.birthDate||'');setAddress(member?.address||'');setSharesCount(member?.sharesCount||1);setError('');}},[isOpen,member]);
  if(!isOpen)return null;
  const save=()=>{
    const cleanId=idNumber.replace(/[ .-]/g,'');
    if(!name.trim()){setError('Vui lòng nhập họ tên hụi viên.');return;}
    if(idNumber.trim() && !/^[0-9]{9,12}$/.test(cleanId)){setError('CCCD/CMND phải gồm 9–12 chữ số.');return;}
    if(phone.trim() && !/^[0-9+() .-]{8,15}$/.test(phone.trim())){setError('Vui lòng kiểm tra số điện thoại.');return;}
    if(!Number.isInteger(sharesCount)||sharesCount<1){setError('Số phần tham gia phải ít nhất là 1.');return;}
    onSave({id:member?.id,name:name.trim(),phone:phone.trim(),idNumber:idNumber.trim(),birthDate,address:address.trim(),sharesCount});
    onClose();
  };
  return <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
    <div className="bg-white rounded-3xl max-w-md w-full max-h-[92dvh] flex flex-col shadow-2xl border border-slate-200">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2"><UserRound className="w-5 h-5 text-teal-700"/><div><h2 className="text-lg font-bold text-slate-900">{member?'Sửa thông tin hụi viên':'Thêm hụi viên'}</h2><p className="text-xs text-slate-500">Thông tin trình bày theo hồ sơ chủ hụi và văn bản thỏa thuận</p></div></div>
        <button type="button" onClick={onClose} aria-label="Đóng" className="p-2 rounded-xl hover:bg-slate-100"><X className="w-5 h-5"/></button>
      </div>
      <div className="p-5 sm:p-6 space-y-4 overflow-y-auto overscroll-contain flex-1">
        <label className={labelClass}>Họ và tên đầy đủ *<input value={name} onChange={e=>setName(e.target.value)} autoComplete="name" placeholder="Nhập họ tên hụi viên" className={fieldClass}/></label>
        <label className={labelClass}>Số CCCD/CMND<input value={idNumber} onChange={e=>setIdNumber(e.target.value)} inputMode="numeric" autoComplete="off" maxLength={15} placeholder="Nhập số giấy tờ tùy thân" className={fieldClass}/></label>
        <label className={labelClass}>Ngày, tháng, năm sinh<input type="date" value={birthDate} onChange={e=>setBirthDate(e.target.value)} className={fieldClass}/></label>
        <label className={labelClass}>Số điện thoại<input value={phone} onChange={e=>setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="Số điện thoại liên hệ" className={fieldClass}/></label>
        <label className={labelClass}>Địa chỉ nơi cư trú<textarea value={address} onChange={e=>setAddress(e.target.value)} rows={3} autoComplete="street-address" placeholder="Số nhà, đường, ấp/khóm, xã/phường, tỉnh/thành" className={fieldClass+' resize-y'}/></label>
        <div><label className={labelClass}>Số phần hụi viên tham gia</label>{sharesLocked&&<p className="text-xs text-amber-700 mt-1">Dây đã mở kỳ; số phần được khóa để bảo toàn lịch sử tài chính.</p>}<div className="flex items-center gap-3 mt-2"><button type="button" disabled={sharesLocked} onClick={()=>setSharesCount(v=>Math.max(1,v-1))} className="w-12 h-12 rounded-xl border text-xl font-bold disabled:opacity-40">−</button><input type="number" min="1" max="1000" disabled={sharesLocked} value={sharesCount} onChange={e=>setSharesCount(Math.max(1,Math.min(1000,Math.floor(Number(e.target.value)||1))))} className="flex-1 min-h-12 p-3 border rounded-xl text-center text-base font-bold disabled:bg-slate-100"/><button type="button" disabled={sharesLocked} onClick={()=>setSharesCount(v=>Math.min(1000,v+1))} className="w-12 h-12 rounded-xl border text-xl font-bold disabled:opacity-40">+</button></div></div>
        {error&&<p role="alert" className="text-sm text-red-600 bg-red-50 p-3 rounded-xl">{error}</p>}
      </div>
      <div className="p-4 border-t border-slate-100 flex gap-3 shrink-0"><button type="button" onClick={onClose} className="flex-1 min-h-12 p-3 rounded-xl border font-semibold">Hủy</button><button type="button" onClick={save} className="flex-1 min-h-12 p-3 rounded-xl bg-teal-700 text-white font-bold"><Save className="inline w-4 h-4 mr-2"/>{member?'Lưu thay đổi':'Lưu hụi viên'}</button></div>
    </div>
  </div>;
};
