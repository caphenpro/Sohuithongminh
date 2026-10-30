import React, { useEffect, useState } from 'react';
import { Lock, Shield, Check, X } from 'lucide-react';
import { AppSettings } from '../types/hui';

interface PinSettingsModalProps {
  isOpen: boolean; onClose: () => void; settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => Promise<void> | void;
}
export const PinSettingsModal: React.FC<PinSettingsModalProps> = ({ isOpen, onClose, settings, onSaveSettings }) => {
  const [enabled, setEnabled] = useState(settings.pinEnabled);
  const [pin, setPin] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (isOpen) { setEnabled(settings.pinEnabled); setPin(''); setConfirm(''); setError(''); setSuccess(''); } }, [isOpen, settings.pinEnabled]);
  if (!isOpen) return null;
  const save = async () => {
    setError('');
    if (enabled && (!/^\d{4}$/.test(pin) || pin !== confirm)) { setError(pin.length !== 4 ? 'PIN phải gồm đúng 4 chữ số.' : 'Hai lần nhập PIN không khớp.'); return; }
    setSaving(true);
    try {
      await onSaveSettings({ ...settings, pinEnabled: enabled, pinCode: enabled ? pin : '' });
      setSuccess('Đã lưu cài đặt bảo mật.');
      window.setTimeout(onClose, 700);
    } catch (e) { setError(e instanceof Error ? e.message : 'Không thể lưu cài đặt.'); }
    finally { setSaving(false); }
  };
  return <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
    <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
      <div className="flex justify-between items-center"><div className="flex gap-2 items-center"><Shield className="text-teal-700"/><div><h2 className="font-bold text-lg">Bảo mật PIN</h2><p className="text-xs text-slate-500">PIN được băm PBKDF2-SHA-256 trước khi lưu</p></div></div><button onClick={onClose}><X/></button></div>
      <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl"><span className="text-sm font-semibold">Bật khóa ứng dụng</span><input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} /></div>
      {enabled && <div className="space-y-3">
        <label className="block text-xs font-semibold">PIN mới<input type="password" inputMode="numeric" maxLength={4} value={pin} onChange={e => setPin(e.target.value.replace(/\D/g,'').slice(0,4))} className="mt-1 w-full p-3 border rounded-xl text-center text-2xl tracking-widest" /></label>
        <label className="block text-xs font-semibold">Xác nhận PIN<input type="password" inputMode="numeric" maxLength={4} value={confirm} onChange={e => setConfirm(e.target.value.replace(/\D/g,'').slice(0,4))} className="mt-1 w-full p-3 border rounded-xl text-center text-2xl tracking-widest" /></label>
        <p className="text-xs text-amber-800 bg-amber-50 p-3 rounded-xl">Không có mã dự phòng mặc định. Hãy sao lưu dữ liệu và ghi nhớ PIN. Quên PIN không đồng nghĩa dữ liệu được tự động giải mã.</p>
      </div>}
      {error && <p className="text-sm text-red-600">{error}</p>}{success && <p className="text-sm text-emerald-700 flex gap-2"><Check/>{success}</p>}
      <div className="flex gap-3"><button onClick={onClose} className="flex-1 p-3 border rounded-xl">Hủy</button><button disabled={saving} onClick={() => void save()} className="flex-1 p-3 bg-teal-700 text-white rounded-xl disabled:opacity-50">{saving ? 'Đang lưu…' : 'Lưu cài đặt'}</button></div>
    </div>
  </div>;
};