import React, { useState } from 'react';
import { Lock, Delete } from 'lucide-react';

interface PinLockScreenProps {
  verifyPin: (pin: string) => Promise<boolean>;
  onSuccess: () => void;
}
export const PinLockScreen: React.FC<PinLockScreenProps> = ({ verifyPin, onSuccess }) => {
  const [enteredPin, setEnteredPin] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [checking, setChecking] = useState(false);
  const handleDigit = async (digit: string) => {
    if (checking || attempts >= 5 || enteredPin.length >= 4) return;
    const next = enteredPin + digit;
    setEnteredPin(next); setError('');
    if (next.length === 4) {
      setChecking(true);
      const valid = await verifyPin(next);
      setChecking(false);
      if (valid) onSuccess();
      else {
        const count = attempts + 1;
        setAttempts(count); setEnteredPin('');
        setError(count >= 5 ? 'Đã nhập sai 5 lần. Tải lại ứng dụng sau 30 giây để thử lại.' : 'Mã PIN không đúng. Vui lòng thử lại.');
        if (count >= 5) window.setTimeout(() => { setAttempts(0); setError(''); }, 30_000);
      }
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-slate-900 text-white p-6 select-none">
      <div className="flex flex-col items-center mt-8 space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-teal-600 flex items-center justify-center"><Lock className="w-8 h-8" /></div>
        <h1 className="text-2xl font-bold">Sổ Hụi Thông Minh</h1>
        <p className="text-slate-400 text-sm">Nhập mã PIN 4 số để mở sổ</p>
        <div className="flex gap-5 py-4">{[0,1,2,3].map(i => <div key={i} className={`w-5 h-5 rounded-full ${enteredPin.length > i ? 'bg-teal-400' : 'bg-slate-700 border border-slate-600'}`} />)}</div>
        {error && <p role="alert" className="text-red-400 text-sm text-center">{error}</p>}
      </div>
      <div className="w-full max-w-xs grid grid-cols-3 gap-4 mb-4">
        {['1','2','3','4','5','6','7','8','9'].map(d => <button key={d} disabled={checking || attempts >= 5} onClick={() => void handleDigit(d)} className="h-18 rounded-2xl bg-slate-800 text-2xl font-bold border border-slate-700 disabled:opacity-50">{d}</button>)}
        <button onClick={() => { setEnteredPin(''); setError(''); }} className="h-18 rounded-2xl bg-slate-800 text-sm">Xóa hết</button>
        <button disabled={checking || attempts >= 5} onClick={() => void handleDigit('0')} className="h-18 rounded-2xl bg-slate-800 text-2xl font-bold">0</button>
        <button onClick={() => { setEnteredPin(p => p.slice(0,-1)); setError(''); }} className="h-18 rounded-2xl bg-slate-800"><Delete className="w-6 h-6 mx-auto" /></button>
      </div>
      <p className="text-xs text-slate-500">Dữ liệu lưu cục bộ trên thiết bị · Không có mã PIN dự phòng công khai</p>
    </div>
  );
};