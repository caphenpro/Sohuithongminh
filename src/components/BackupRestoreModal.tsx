/**
 * Modal Sao lưu & Phục hồi dữ liệu ngoại tuyến
 * Lưu file vào điện thoại hoặc gửi vào Zalo "Cloud của tôi"
 */

import React, { useState, useRef } from 'react';
import { Download, Upload, Copy, Check, RotateCcw, AlertTriangle, X, Shield, FileText } from 'lucide-react';
import {
  downloadBackupFile,
  exportBackupData,
  importBackupData,
  getSampleHuiData,
  saveHuiGroups,
} from '../utils/storage';

interface BackupRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged: () => void;
}

export const BackupRestoreModal: React.FC<BackupRestoreModalProps> = ({
  isOpen,
  onClose,
  onDataChanged,
}) => {
  const [copied, setCopied] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDownload = () => {
    downloadBackupFile();
    setMessage({
      text: 'Đã tạo file sao lưu và tải về điện thoại! Bạn có thể lưu vào Thẻ nhớ hoặc Zalo "Cloud của tôi".',
      isError: false,
    });
  };

  const handleCopyText = () => {
    const backup = exportBackupData();
    const str = JSON.stringify(backup);
    navigator.clipboard.writeText(str).then(() => {
      setCopied(true);
      setMessage({
        text: 'Đã sao chép mã sao lưu vào bộ nhớ tạm! Bạn chỉ cần vào Zalo dán (paste) gửi cho chính mình để cất giữ.',
        isError: false,
      });
      setTimeout(() => setCopied(false), 3000);
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const result = importBackupData(content);
        if (result.success) {
          setMessage({ text: result.message, isError: false });
          onDataChanged();
        } else {
          setMessage({ text: result.message, isError: true });
        }
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRestoreFromPaste = () => {
    if (!pasteText.trim()) {
      setMessage({ text: 'Vui lòng dán mã sao lưu vào ô bên dưới!', isError: true });
      return;
    }
    const result = importBackupData(pasteText.trim());
    if (result.success) {
      setMessage({ text: result.message, isError: false });
      setPasteText('');
      onDataChanged();
    } else {
      setMessage({ text: result.message, isError: true });
    }
  };

  const handleResetSampleData = () => {
    const sample = getSampleHuiData();
    saveHuiGroups(sample);
    onDataChanged();
    setShowConfirmReset(false);
    setMessage({ text: 'Đã nạp lại bộ dữ liệu hụi mẫu thực tế!', isError: false });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-700">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Sao Lưu & Phục Hồi Sổ Hụi</h2>
              <p className="text-xs text-slate-500">Bảo toàn dữ liệu 100% ngoại tuyến trên máy</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thông báo kết quả */}
        {message && (
          <div
            className={`p-3.5 rounded-2xl text-xs font-medium border leading-relaxed ${
              message.isError
                ? 'bg-red-50 text-red-700 border-red-200'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Phần 1: Xuất sao lưu */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Download className="w-4 h-4 text-teal-600" /> 1. Xuất file dự phòng (Đề phòng đổi/mất máy)
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Hệ thống sẽ tạo ra một file dữ liệu nhỏ. Bạn nên lưu định kỳ vào thẻ nhớ hoặc gửi qua <strong>Zalo (Cloud của tôi)</strong> để không bao giờ sợ mất sổ.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 py-3 px-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              <Download className="w-4 h-4" /> Tải file .JSON về máy
            </button>

            <button
              onClick={handleCopyText}
              className="flex items-center justify-center gap-2 py-3 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Đã chép mã!' : 'Chép mã gửi Zalo'}
            </button>
          </div>
        </div>

        {/* Phần 2: Phục hồi */}
        <div className="space-y-3 border-t border-slate-100 pt-5">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Upload className="w-4 h-4 text-teal-600" /> 2. Phục hồi dữ liệu đã sao lưu
          </h3>
          <p className="text-xs text-slate-600">
            Chọn file sao lưu từ máy hoặc dán mã dữ liệu đã gửi từ Zalo vào đây:
          </p>

          <input
            type="file"
            ref={fileInputRef}
            accept=".json,application/json"
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 px-4 rounded-xl border border-dashed border-teal-500 bg-teal-50/50 hover:bg-teal-50 text-teal-800 font-semibold text-xs flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4 text-teal-600" /> Bấm để chọn file .JSON từ điện thoại
          </button>

          <div className="space-y-2 pt-1">
            <textarea
              rows={2}
              placeholder="Hoặc dán đoạn mã sao lưu vào đây..."
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
            {pasteText.trim().length > 0 && (
              <button
                onClick={handleRestoreFromPaste}
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl"
              >
                Xác nhận phục hồi từ đoạn mã
              </button>
            )}
          </div>
        </div>

        {/* Phần 3: Dữ liệu mẫu & Cài lại */}
        <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
          <button
            onClick={() => setShowConfirmReset(true)}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1.5 py-1"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Nạp lại dữ liệu mẫu
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
          >
            Đóng
          </button>
        </div>

        {/* Xác nhận nạp lại dữ liệu mẫu */}
        {showConfirmReset && (
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-3">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              Nạp dữ liệu mẫu sẽ thay thế sổ hụi hiện tại?
            </div>
            <p className="text-xs text-amber-800">
              Hãy chắc chắn bạn đã sao lưu dữ liệu cũ nếu muốn giữ lại.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="flex-1 py-2 bg-white text-slate-700 text-xs font-medium rounded-lg border border-amber-200"
              >
                Hủy
              </button>
              <button
                onClick={handleResetSampleData}
                className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg"
              >
                Nạp lại mẫu
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
