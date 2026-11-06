import React, { useState } from 'react';
import { UserRound, X, Save } from 'lucide-react';

export interface NewHuiMemberInfo {
  name: string;
  phone: string;
  idNumber: string;
  birthDate: string;
  address: string;
  sharesCount: number;
}
interface Props { isOpen:boolean; onClose:()=>void; onSave:(member:NewHuiMemberInfo)=>void; }
export const AddHuiMemberModal:React.FC<Props>=({isOpen,onClose,onSave})=>{
 const [name,setName]=useState(''); const [phone,setPhone]=useState('');
 const [idNumber,setIdNumber]=useState(''); const [birthDate,setBirthDate]=useState('');
 const [address,setAddress]=useState(''); const [sharesCount,setSharesCount]=useState(1);
 const [error,setError]=useState('');
 if(!isOpen)return null;
 const save=()=>{if(!name.trim()){setError('Vui lòng nhập họ tên hụi viên.');return;} if(sharesCount<1){setError('Số phần tham gia phải ít nhất là 1.');return;}
 onSave({name:name.trim(),phone:phone.trim(),idNumber:idNumber.trim(),birthDate,address:address.trim(),sharesCount});setName('');setPhone('');setIdNumber('');setBirthDate('');setAddress('');setSharesCount(1);setError('');onClose();};
 return <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-3 sm:p-4"><div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 shadow-2xl space-y-4">
  <div className="flex items-center justify-between"><div className="flex items-center gap-2"><UserRound className="w-5 h-5 text-teal-700"/><div><h2 className="text-lg font-bold">Thêm hụi viên</h2><p className="text-xs text-slate-500">Nhập thông tin theo văn bản thỏa thuận</p></div></div><button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100"><X/></button></div>
  <label className="block text-sm font-semibold">Họ và tên đầy đủ *<input value={name} onChange={e=>setName(e.target.value)} autoComplete="name" placeholder="Nhập họ tên hụi viên" className="mt-1.5 w-full p-3.5 border rounded-xl text-base"/></label>
  <label className="block text-sm font-semibold">Số CCCD/CMND<input value={idNumber} onChange={e=>setIdNumber(e.target.value)} inputMode="numeric" placeholder="Nhập số giấy tờ tùy thân" className="mt-1.5 w-full p-3.5 border rounded-xl text-base"/></label>
  <label className="block text-sm font-semibold">Ngày, tháng, năm sinh<input type="date" value={birthDate} onChange={e=>setBirthDate(e.target.value)} className="mt-1.5 w-full p-3.5 border rounded-xl text-base"/></label>
  <label className="block text-sm font-semibold">Số điện thoại<input value={phone} onChange={e=>setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="Số điện thoại liên hệ" className="mt-1.5 w-full p-3.5 border rounded-xl text-base"/></label>
  <label className="block text-sm font-semibold">Địa chỉ nơi cư trú<textarea value={address} onChange={e=>setAddress(e.target.value)} rows={3} autoComplete="street-address" placeholder="Số nhà, đường, ấp/khóm, xã/phường, tỉnh/thành" className="mt-1.5 w-full p-3.5 border rounded-xl text-base resize-y"/></label>
  <div><label className="block text-sm font-semibold mb-1.5">Số phần hụi viên tham gia</label><div className="flex items-center gap-3"><button onClick={()=>setSharesCount(v=>Math.max(1,v-1))} className="w-12 h-12 rounded-xl border text-xl font-bold">−</button><input type="number" min="1" value={sharesCount} onChange={e=>setSharesCount(Math.max(1,Math.floor(Number(e.target.value)||1)))} className="flex-1 p-3 border rounded-xl text-center text-base font-bold"/><button onClick={()=>setSharesCount(v=>v+1)} className="w-12 h-12 rounded-xl border text-xl font-bold">+</button></div></div>
  {error&&<p className="text-sm text-red-600">{error}</p>}
  <div className="flex gap-3 pt-1"><button onClick={onClose} className="flex-1 p-3.5 rounded-xl border font-semibold">Hủy</button><button onClick={save} className="flex-1 p-3.5 rounded-xl bg-teal-700 text-white font-bold"><Save className="inline w-4 h-4 mr-2"/>Lưu hụi viên</button></div>
 </div></div>;
};
