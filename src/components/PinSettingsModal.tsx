/**
 * Modal quản lý và cài đặt mã PIN bảo mật
 */

import React, { useState } from 'react';
import { Lock, Shield, Check, X } from 'lucide-react';
import { AppSettings } from '../types/hui';

interface PinSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
}

export const PinSettingsModal: React.FC<PinSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [pinEnabled, setPinEnabled] = useState(settings.pinEnabled);
  const [newPin, setNewPin] = useState(settings.pinCode || '');
  const [confirmPin, setConfirmPin] = useState(settings.pinCode || '');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    setError('');
    if (pinEnabled) {
      if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
        setError('Mã PIN phải gồm đúng 4 chữ số (0-9)!');
        return;
      }
      if (newPin !== confirmPin) {
        setError('Mã PIN nhập lại không khớp!');
        return;
      }
    }

    onSaveSettings({
      ...settings,
      pinEnabled,
      pinCode: pinEnabled ? newPin : '',
    });

    setSuccessMsg('Đã lưu cài đặt bảo mật thành công!');
    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-700">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Bảo Mật Mã PIN</h2>
              <p className="text-xs text-slate-500">Khóa sổ sách khi cho mượn máy</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bật / Tắt PIN switch */}
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <div>
            <div className="font-semibold text-slate-900 text-sm">Bật khóa bảo vệ App</div>
            <div className="text-xs text-slate-500">Yêu cầu nhập mã PIN khi mở ứng dụng</div>
          </div>
          <button
            type="button"
            onClick={() => setPinEnabled(!pinEnabled)}
            className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              pinEnabled ? 'bg-teal-600' : 'bg-slate-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                pinEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {pinEnabled && (
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Mã PIN 4 số mới:
              </label>
              <div className="relative">
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="Nhập 4 số (ví dụ: 1234)"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/[^\d]/g, '').slice(0, 4))}
                  className="w-full text-center text-2xl tracking-widest font-mono font-bold py-3 px-4 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
                <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nhập lại mã PIN:
              </label>
              <div className="relative">
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="Xác nhận lại 4 số"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/[^\d]/g, '').slice(0, 4))}
                  className="w-full text-center text-2xl tracking-widest font-mono font-bold py-3 px-4 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
                <Check className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200 leading-relaxed">
              💡 Lưu ý: Hãy ghi nhớ mã PIN này. Mã khôi phục dự phòng luôn là <strong>8888</strong>.
            </p>
          </div>
        )}

        {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
        {successMsg && <p className="text-xs text-teal-600 font-semibold">{successMsg}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-md shadow-teal-600/20"
          >
            Lưu cài đặt
          </button>
        </div>
      </div>
    </div>
  );
};
