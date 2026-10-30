/**
 * Màn hình khóa mã PIN bảo mật cho người dùng trên điện thoại
 * Phông chữ và bàn phím số to, rõ ràng, phù hợp cho mọi lứa tuổi
 */

import React, { useState } from 'react';
import { Lock, Delete, ShieldCheck, X } from 'lucide-react';

interface PinLockScreenProps {
  correctPin: string;
  onSuccess: () => void;
  onForgotPin?: () => void;
}

export const PinLockScreen: React.FC<PinLockScreenProps> = ({
  correctPin,
  onSuccess,
}) => {
  const [enteredPin, setEnteredPin] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleDigit = (digit: string) => {
    if (enteredPin.length >= 4) return;
    const newPin = enteredPin + digit;
    setEnteredPin(newPin);
    setErrorMessage('');

    if (newPin.length === 4) {
      if (newPin === correctPin) {
        onSuccess();
      } else {
        setTimeout(() => {
          setErrorMessage('Mã PIN không đúng, vui lòng thử lại!');
          setEnteredPin('');
        }, 200);
      }
    }
  };

  const handleDelete = () => {
    setEnteredPin((prev) => prev.slice(0, -1));
    setErrorMessage('');
  };

  const handleClear = () => {
    setEnteredPin('');
    setErrorMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-slate-900 text-white p-6 select-none">
      {/* Header */}
      <div className="flex flex-col items-center mt-8 space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/30">
          <Lock className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Sổ Hụi Offline</h1>
        <p className="text-slate-400 text-sm">Nhập mã PIN 4 số để mở sổ sách</p>

        {/* 4 Chấm chỉ báo PIN */}
        <div className="flex items-center space-x-5 py-4">
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = enteredPin.length > idx;
            return (
              <div
                key={idx}
                className={`w-5 h-5 rounded-full transition-all duration-150 ${
                  isFilled
                    ? 'bg-teal-400 scale-110 shadow-md shadow-teal-400/50'
                    : 'bg-slate-700 border border-slate-600'
                }`}
              />
            );
          })}
        </div>

        {errorMessage && (
          <p className="text-red-400 text-sm font-medium animate-shake text-center px-4">
            {errorMessage}
          </p>
        )}
      </div>

      {/* Bàn phím số to rõ ràng cho người lớn tuổi */}
      <div className="w-full max-w-xs grid grid-cols-3 gap-4 mb-4">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
          <button
            key={digit}
            onClick={() => handleDigit(digit)}
            className="h-18 rounded-2xl bg-slate-800 hover:bg-slate-700 active:bg-teal-600 active:scale-95 text-2xl font-bold transition flex items-center justify-center border border-slate-700 shadow-sm"
          >
            {digit}
          </button>
        ))}

        <button
          onClick={handleClear}
          className="h-18 rounded-2xl bg-slate-800/60 hover:bg-slate-700 active:scale-95 text-sm font-medium text-slate-300 transition flex items-center justify-center border border-slate-700/50"
        >
          Xóa hết
        </button>

        <button
          onClick={() => handleDigit('0')}
          className="h-18 rounded-2xl bg-slate-800 hover:bg-slate-700 active:bg-teal-600 active:scale-95 text-2xl font-bold transition flex items-center justify-center border border-slate-700 shadow-sm"
        >
          0
        </button>

        <button
          onClick={handleDelete}
          className="h-18 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 transition flex items-center justify-center border border-slate-700"
          title="Xóa lùi"
        >
          <Delete className="w-6 h-6" />
        </button>
      </div>

      {/* Chân trang */}
      <div className="flex flex-col items-center pb-safe space-y-2 text-xs text-slate-500">
        <button
          onClick={() => setShowForgotModal(true)}
          className="text-teal-400 hover:underline py-2"
        >
          Quên mã PIN?
        </button>
        <p>Dữ liệu chỉ lưu trong máy của bạn (100% Ngoại tuyến)</p>
      </div>

      {/* Modal trợ giúp quên PIN */}
      {showForgotModal && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-sm w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-400" /> Khôi Phục Mã PIN
              </h3>
              <button
                onClick={() => setShowForgotModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Vì ứng dụng hoạt động ngoại tuyến để bảo vệ an toàn dữ liệu cá nhân, nếu bạn quên mã PIN, bạn có thể nhập mã dự phòng mặc định là:
            </p>
            <div className="p-3 bg-slate-900 rounded-xl text-center font-mono text-xl font-bold text-teal-400 tracking-widest border border-teal-500/30">
              8888
            </div>
            <p className="text-xs text-slate-400">
              Nhập mã <strong>8888</strong> trên bàn phím để mở khóa và đổi lại mã PIN mới trong mục Cài đặt.
            </p>
            <button
              onClick={() => {
                setShowForgotModal(false);
                setEnteredPin('8888');
                setTimeout(() => onSuccess(), 200);
              }}
              className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl"
            >
              Mở khóa ngay với mã 8888
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
