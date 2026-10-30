/**
 * Modal Tạo Dây Hụi Mới & Thêm Con Hụi Nhanh Chóng
 */

import React, { useState } from 'react';
import { Plus, Trash2, Users, DollarSign, Calendar, X, Check, Sparkles } from 'lucide-react';
import { HuiCycle, HuiGroup, HuiMember, HuiShare } from '../types/hui';
import { formatVND, getTodayDateString } from '../utils/formatters';

interface CreateHuiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveGroup: (newGroup: HuiGroup) => void;
  existingMembersPool: string[]; // Tên những người quen từ các dây khác để chọn nhanh
}

export const CreateHuiModal: React.FC<CreateHuiModalProps> = ({
  isOpen,
  onClose,
  onSaveGroup,
  existingMembersPool,
}) => {
  const [name, setName] = useState('');
  const [baseAmount, setBaseAmount] = useState<number>(1000000);
  const [customBaseStr, setCustomBaseStr] = useState('1000000');
  const [totalShares, setTotalShares] = useState<number>(12);
  const [cycle, setCycle] = useState<HuiCycle>('monthly');
  const [startDate, setStartDate] = useState(getTodayDateString());
  const [commissionDefault, setCommissionDefault] = useState<number>(500000);
  const [firstPotRule, setFirstPotRule] = useState<'auction' | 'owner_first'>('owner_first');

  // Danh sách thành viên đang tạo
  const [membersList, setMembersList] = useState<{ id: string; name: string; phone?: string; sharesCount: number }[]>([
    { id: '1', name: 'Chị Mai (Trái cây)', phone: '', sharesCount: 1 },
    { id: '2', name: 'Anh Ba Hưng', phone: '', sharesCount: 1 },
    { id: '3', name: 'Cô Sáu Tiệm Vàng', phone: '', sharesCount: 1 },
  ]);

  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [newMemberShares, setNewMemberShares] = useState(1);
  const [quickPasteText, setQuickPasteText] = useState('');
  const [showQuickPaste, setShowQuickPaste] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Tính tổng số chân hụi đã điền
  const currentTotalAllocated = membersList.reduce((acc, m) => acc + (m.sharesCount || 1), 0);

  const handleAddSingleMember = (customName?: string) => {
    const memberName = (customName || newMemberName).trim();
    if (!memberName) return;

    // Kiểm tra nếu tên đã có trong danh sách
    const existingIndex = membersList.findIndex((m) => m.name.toLowerCase() === memberName.toLowerCase());
    if (existingIndex >= 0) {
      // Tăng thêm số chân
      const updated = [...membersList];
      updated[existingIndex].sharesCount += newMemberShares;
      setMembersList(updated);
    } else {
      setMembersList((prev) => [
        ...prev,
        {
          id: `m_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: memberName,
          phone: newMemberPhone.trim(),
          sharesCount: newMemberShares,
        },
      ]);
    }

    setNewMemberName('');
    setNewMemberPhone('');
    setNewMemberShares(1);
    setErrorMsg('');
  };

  const handleRemoveMember = (index: number) => {
    setMembersList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateShares = (index: number, delta: number) => {
    setMembersList((prev) => {
      const updated = [...prev];
      const newCount = Math.max(1, (updated[index].sharesCount || 1) + delta);
      updated[index].sharesCount = newCount;
      return updated;
    });
  };

  // Thêm nhanh danh sách từ văn bản dán (cách nhau bởi dấu phẩy hoặc xuống dòng)
  const handleProcessQuickPaste = () => {
    if (!quickPasteText.trim()) return;
    const names = quickPasteText
      .split(/[\n,;]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const newEntries = names.map((n) => ({
      id: `m_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: n,
      phone: '',
      sharesCount: 1,
    }));

    setMembersList((prev) => [...prev, ...newEntries]);
    setQuickPasteText('');
    setShowQuickPaste(false);
  };

  // Tự động điền các chân còn thiếu cho đủ tổng số phần
  const handleAutoFillRemaining = () => {
    const remaining = totalShares - currentTotalAllocated;
    if (remaining <= 0) return;

    const autoItems: { id: string; name: string; phone?: string; sharesCount: number }[] = [];
    for (let i = 1; i <= remaining; i++) {
      autoItems.push({
        id: `m_${Date.now()}_${i}`,
        name: `Con hụi ${currentTotalAllocated + i}`,
        phone: '',
        sharesCount: 1,
      });
    }
    setMembersList((prev) => [...prev, ...autoItems]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const groupName = name.trim() || `Dây ${formatVND(baseAmount)} - ${totalShares} phần`;

    if (baseAmount <= 0) {
      setErrorMsg('Vui lòng nhập số tiền 1 phần hụi lớn hơn 0!');
      return;
    }

    if (currentTotalAllocated !== totalShares) {
      setErrorMsg(
        `Số chân hụi chưa khớp: Hiện có ${currentTotalAllocated} chân, nhưng dây này thiết lập ${totalShares} phần. Bạn có thể bấm "Tự điền chân còn thiếu" hoặc chỉnh lại số phần!`
      );
      return;
    }

    // Tạo danh sách shares chi tiết từ members
    const allShares: HuiShare[] = [];
    const membersToSave: HuiMember[] = [];

    membersList.forEach((m) => {
      membersToSave.push({
        id: m.id,
        name: m.name,
        phone: m.phone,
        sharesCount: m.sharesCount,
      });

      for (let sIdx = 1; sIdx <= m.sharesCount; sIdx++) {
        allShares.push({
          id: `share_${m.id}_${sIdx}`,
          memberId: m.id,
          memberName: m.name,
          shareIndex: sIdx,
          phone: m.phone,
          isDead: false,
        });
      }
    });

    const newGroup: HuiGroup = {
      id: `grp_${Date.now()}`,
      name: groupName,
      baseAmount,
      totalShares,
      cycle,
      startDate,
      commissionDefault,
      firstPotRule,
      status: 'active',
      members: membersToSave,
      shares: allShares,
      rounds: [],
      currentRoundNumber: 0,
      createdAt: new Date().toISOString(),
    };

    onSaveGroup(newGroup);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Tạo Dây Hụi Mới</h2>
            <p className="text-xs text-slate-500">Cấu hình tiền hụi, chu kỳ và danh sách con hụi</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung form có thể cuộn */}
        <form onSubmit={handleSubmit} className="p-5 space-y-6 overflow-y-auto flex-1 text-slate-800">
          {/* Tên dây hụi */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Tên Dây Hụi:
            </label>
            <input
              type="text"
              placeholder={`Ví dụ: Dây ${formatVND(baseAmount)} - Chợ Chiều`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          {/* Tiền 1 phần */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Số Tiền 1 Phần:
              </label>
              <span className="text-sm font-bold text-teal-700">{formatVND(baseAmount)}</span>
            </div>

            {/* Gợi ý mức tiền nhanh */}
            <div className="grid grid-cols-4 gap-2 mb-2">
              {[500000, 1000000, 2000000, 5000000].map((val) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => {
                    setBaseAmount(val);
                    setCustomBaseStr(String(val));
                    setCommissionDefault(Math.round(val * 0.5)); // Gợi ý tiền thảo 50%
                  }}
                  className={`py-2 px-1 text-xs font-bold rounded-xl border transition ${
                    baseAmount === val
                      ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {formatVND(val).replace(' đ', '')}
                </button>
              ))}
            </div>

            <input
              type="text"
              inputMode="numeric"
              placeholder="Nhập số tiền khác..."
              value={customBaseStr}
              onChange={(e) => {
                const clean = e.target.value.replace(/[^\d]/g, '');
                setCustomBaseStr(clean);
                const num = parseInt(clean, 10) || 0;
                setBaseAmount(num);
                if (num > 0) setCommissionDefault(Math.round(num * 0.5));
              }}
              className="w-full py-2.5 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
            />
          </div>

          {/* Số phần & Chu kỳ */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Tổng Số Phần:
              </label>
              <select
                value={totalShares}
                onChange={(e) => setTotalShares(parseInt(e.target.value, 10))}
                className="w-full py-3 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                {[6, 8, 10, 12, 15, 18, 20, 24, 30].map((n) => (
                  <option key={n} value={n}>
                    {n} phần ({n} kỳ)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Chu Kỳ Khui:
              </label>
              <select
                value={cycle}
                onChange={(e) => setCycle(e.target.value as HuiCycle)}
                className="w-full py-3 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                <option value="monthly">Hàng tháng (Tháng)</option>
                <option value="biweekly">Nửa tháng (15 ngày)</option>
                <option value="weekly">Hàng tuần (Tuần)</option>
                <option value="daily">Mỗi ngày (Ngày)</option>
              </select>
            </div>
          </div>

          {/* Ngày bắt đầu & Tiền thảo */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Ngày Mở / Khui Kỳ 1:
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Tiền Thảo Chủ Hụi:
                </label>
              </div>
              <input
                type="text"
                inputMode="numeric"
                value={commissionDefault ? commissionDefault.toLocaleString('vi-VN') : ''}
                onChange={(e) => {
                  const clean = e.target.value.replace(/[^\d]/g, '');
                  setCommissionDefault(parseInt(clean, 10) || 0);
                }}
                placeholder="0 đ"
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
              />
            </div>
          </div>

          {/* Kỳ đầu */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Quy tắc Kỳ Đầu (Kỳ 1):
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setFirstPotRule('owner_first')}
                className={`p-2.5 rounded-xl border text-left font-medium transition ${
                  firstPotRule === 'owner_first'
                    ? 'bg-teal-50 border-teal-500 text-teal-900 font-bold'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                Chủ hụi hốt trước (Hụi đầu không thăm)
              </button>
              <button
                type="button"
                onClick={() => setFirstPotRule('auction')}
                className={`p-2.5 rounded-xl border text-left font-medium transition ${
                  firstPotRule === 'auction'
                    ? 'bg-teal-50 border-teal-500 text-teal-900 font-bold'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                Đấu thăm bình thường từ Kỳ 1
              </button>
            </div>
          </div>

          {/* DANH SÁCH CON HỤI */}
          <div className="border-t border-slate-100 pt-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-teal-600" /> Danh Sách Con Hụi
                </h3>
                <p className="text-xs text-slate-500">
                  Tiến độ: <strong className={currentTotalAllocated === totalShares ? 'text-teal-700' : 'text-amber-700'}>{currentTotalAllocated} / {totalShares} phần</strong>
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowQuickPaste(!showQuickPaste)}
                  className="px-2.5 py-1 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition"
                >
                  {showQuickPaste ? 'Đóng dán nhanh' : 'Dán danh sách'}
                </button>
                {currentTotalAllocated < totalShares && (
                  <button
                    type="button"
                    onClick={handleAutoFillRemaining}
                    className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                  >
                    Tự điền đủ {totalShares}
                  </button>
                )}
              </div>
            </div>

            {/* Dán danh sách nhanh */}
            {showQuickPaste && (
              <div className="p-3 bg-teal-50/50 rounded-2xl border border-teal-200 space-y-2">
                <textarea
                  rows={2}
                  placeholder="Dán danh sách tên con hụi (cách nhau bằng dấu phẩy hoặc xuống dòng)..."
                  value={quickPasteText}
                  onChange={(e) => setQuickPasteText(e.target.value)}
                  className="w-full p-2.5 text-xs bg-white border border-teal-200 rounded-xl focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleProcessQuickPaste}
                  className="py-1.5 px-4 bg-teal-600 text-white text-xs font-bold rounded-lg"
                >
                  Thêm tất cả vào danh sách
                </button>
              </div>
            )}

            {/* Thêm một người */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nhập tên con hụi (ví dụ: Chị Lan, Anh Ba)..."
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSingleMember();
                  }
                }}
                className="flex-1 py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              />

              <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2">
                <span className="text-[11px] text-slate-500">Phần:</span>
                <button
                  type="button"
                  onClick={() => setNewMemberShares(Math.max(1, newMemberShares - 1))}
                  className="w-6 h-6 rounded bg-white text-slate-700 text-xs font-bold shadow-xs"
                >
                  -
                </button>
                <span className="w-5 text-center text-xs font-bold">{newMemberShares}</span>
                <button
                  type="button"
                  onClick={() => setNewMemberShares(newMemberShares + 1)}
                  className="w-6 h-6 rounded bg-white text-slate-700 text-xs font-bold shadow-xs"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleAddSingleMember()}
                className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shrink-0"
              >
                <Plus className="w-4 h-4" /> Thêm
              </button>
            </div>

            {/* Gợi ý nhanh từ người quen cũ nếu có */}
            {existingMembersPool.length > 0 && (
              <div className="space-y-1">
                <span className="text-[11px] text-slate-500 font-medium">Người quen từ dây khác (Chạm để thêm):</span>
                <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                  {existingMembersPool.slice(0, 10).map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => handleAddSingleMember(name)}
                      className="px-2 py-1 bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-700 rounded-lg text-[11px] font-medium transition"
                    >
                      + {name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Danh sách các con hụi đã thêm */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {membersList.map((m, idx) => (
                <div
                  key={m.id || idx}
                  className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-[10px] font-bold">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-slate-800">{m.name}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-0.5">
                      <button
                        type="button"
                        onClick={() => handleUpdateShares(idx, -1)}
                        className="text-slate-500 hover:text-slate-800 font-bold px-1"
                      >
                        -
                      </button>
                      <span className="font-bold text-teal-800 px-1">
                        {m.sharesCount} phần
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateShares(idx, 1)}
                        className="text-slate-500 hover:text-slate-800 font-bold px-1"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveMember(idx)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {errorMsg && (
            <p className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-200">
              {errorMsg}
            </p>
          )}

          {/* Nút hành động Submit */}
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={currentTotalAllocated !== totalShares}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md ${
                currentTotalAllocated === totalShares
                  ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/30'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4" /> Hoàn Tất Tạo Dây Hụi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
