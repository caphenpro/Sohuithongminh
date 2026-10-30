/**
 * Modal Kêu Hụi / Mở Kỳ Hụi Mới
 * Tính toán tức thì hụi sống, hụi chết, tiền thảo và số tiền người hốt thực nhận
 */

import React, { useState, useMemo } from 'react';
import { Award, DollarSign, Calculator, Check, X, AlertCircle } from 'lucide-react';
import { HuiGroup, HuiRound } from '../types/hui';
import { calculateRoundPreview, generateRoundPayments } from '../utils/huiCalculator';
import { formatVND, getTodayDateString } from '../utils/formatters';

interface BidRoundModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: HuiGroup;
  nextRoundNumber: number;
  onConfirmRound: (newRound: HuiRound) => void;
}

export const BidRoundModal: React.FC<BidRoundModalProps> = ({
  isOpen,
  onClose,
  group,
  nextRoundNumber,
  onConfirmRound,
}) => {
  // Lấy các chân hụi CÒN SỐNG (chưa hốt)
  const availableLiveShares = useMemo(() => {
    return group.shares.filter((s) => !s.isDead);
  }, [group]);

  const ownerFirstRound = nextRoundNumber === 1 && group.firstPotRule === 'owner_first';
  const [selectedShareId, setSelectedShareId] = useState<string>(
    availableLiveShares[0]?.id || ''
  );
  const [bidAmountStr, setBidAmountStr] = useState<string>(ownerFirstRound ? '0' : '150000');
  const [commissionStr, setCommissionStr] = useState<string>(
    String(group.commissionDefault || 0)
  );
  const [roundDate, setRoundDate] = useState<string>(getTodayDateString());
  const [roundNotes, setRoundNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const bidAmount = parseInt(bidAmountStr.replace(/[^\d]/g, ''), 10) || 0;
  const commission = parseInt(commissionStr.replace(/[^\d]/g, ''), 10) || 0;
  const effectiveBidAmount = ownerFirstRound ? 0 : bidAmount;

  // Tính toán trước kết quả tức thì
  const preview = useMemo(() => {
    if (!selectedShareId) return null;
    return calculateRoundPreview(
      group,
      nextRoundNumber,
      selectedShareId,
      effectiveBidAmount,
      commission
    );
  }, [group, nextRoundNumber, selectedShareId, effectiveBidAmount, commission]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    setErrorMsg('');
    if (!selectedShareId) {
      setErrorMsg('Vui lòng chọn người hốt kỳ này!');
      return;
    }

    if (!ownerFirstRound && bidAmount >= group.baseAmount) {
      setErrorMsg('Số tiền thăm phải nhỏ hơn số tiền 1 phần hụi!');
      return;
    }

    if (!preview) return;

    // Tạo danh sách payments chi tiết
    const payments = generateRoundPayments(group, selectedShareId, effectiveBidAmount);

    const winnerShare = group.shares.find((s) => s.id === selectedShareId);

    const newRound: HuiRound = {
      id: `rnd_${group.id}_${nextRoundNumber}_${Date.now()}`,
      roundNumber: nextRoundNumber,
      date: roundDate,
      status: 'collecting', // Bắt đầu gom tiền ngay!
      bidAmount: effectiveBidAmount,
      winnerMemberId: winnerShare?.memberId,
      winnerMemberName: winnerShare?.memberName,
      winnerShareId: selectedShareId,
      commissionAmount: commission,
      firstRoundDeduction: 0,
      payments,
      netWinnerPayout: preview.netWinnerPayout,
      isPayoutCompleted: false,
      notes: roundNotes.trim(),
    };

    onConfirmRound(newRound);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Kêu Hụi Kỳ {nextRoundNumber} / {group.totalShares}
              </h2>
              <p className="text-xs text-slate-500">{group.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung có thể cuộn */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1 text-slate-800">
          {/* Chọn người hốt */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Chọn Người Hốt Kỳ Này:
            </label>
            {availableLiveShares.length === 0 ? (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl">
                Tất cả con hụi trong dây này đều đã hốt!
              </div>
            ) : (
              <select
                value={selectedShareId}
                onChange={(e) => setSelectedShareId(e.target.value)}
                className="w-full py-3 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                {availableLiveShares.map((s) => {
                  const shareTag =
                    group.shares.filter((x) => x.memberId === s.memberId).length > 1
                      ? ` (Chân ${s.shareIndex})`
                      : '';
                  return (
                    <option key={s.id} value={s.id}>
                      {s.memberName} {shareTag}
                    </option>
                  );
                })}
              </select>
            )}
          </div>

          {/* Nhập giá kêu / tiền thăm */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                {ownerFirstRound ? 'Kỳ đầu chủ hụi nhận trước – không đấu thăm:' : 'Giá Kêu Trúng (Tiền Thăm):'}
              </label>
              <span className="text-sm font-bold text-amber-600">
                {formatVND(bidAmount)}
              </span>
            </div>

            {/* Gợi ý nhanh */}
            <div className="grid grid-cols-4 gap-2 mb-2">
              {[50000, 100000, 150000, 200000].map((val) => (
                <button
                  type="button"
                  key={val}
                  disabled={ownerFirstRound}
                  onClick={() => setBidAmountStr(String(val))}
                  className={`py-1.5 px-1 text-xs font-bold rounded-lg border transition ${
                    bidAmount === val
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {val >= 1000 ? `${val / 1000}k` : val}
                </button>
              ))}
            </div>

            <input
              type="text"
              inputMode="numeric"
              placeholder="Nhập số tiền thăm..."
              value={ownerFirstRound ? '0' : bidAmountStr}
              disabled={ownerFirstRound}
              onChange={(e) => {
                const clean = e.target.value.replace(/[^\d]/g, '');
                setBidAmountStr(clean);
              }}
              className="w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
            />
          </div>

          {/* Ngày khui & Tiền thảo */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Ngày Khui:
              </label>
              <input
                type="date"
                value={roundDate}
                onChange={(e) => setRoundDate(e.target.value)}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Tiền Thảo Chủ Hụi:
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={commission ? commission.toLocaleString('vi-VN') : ''}
                onChange={(e) => {
                  const clean = e.target.value.replace(/[^\d]/g, '');
                  setCommissionStr(clean);
                }}
                placeholder="0 đ"
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              />
            </div>
          </div>

          {/* BẢNG TÍNH TOÁN TỰ ĐỘNG TỨC THÌ (CORE LOGIC) */}
          {preview && (
            <div className="p-4 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl border border-teal-200 space-y-3">
              <div className="flex items-center justify-between border-b border-teal-200/60 pb-2">
                <span className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 text-teal-700" /> Bảng Tính Tự Động Kỳ {nextRoundNumber}
                </span>
                <span className="text-[11px] font-semibold text-teal-700 bg-white px-2 py-0.5 rounded-full border border-teal-200">
                  Chuẩn công thức
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="flex justify-between items-center py-0.5">
                  <span>
                    • Hụi sống nộp ({preview.totalLiveSharesCount} phần):
                  </span>
                  <span className="font-bold text-slate-900 font-mono-numbers">
                    {formatVND(preview.liveAmountDue)} / phần
                  </span>
                </div>

                <div className="flex justify-between items-center py-0.5">
                  <span>
                    • Hụi chết nộp ({preview.totalDeadSharesCount} phần):
                  </span>
                  <span className="font-bold text-slate-900 font-mono-numbers">
                    {formatVND(preview.deadAmountDue)} / phần
                  </span>
                </div>

                <div className="flex justify-between items-center py-0.5 border-t border-teal-200/50 pt-1">
                  <span>• Tổng tiền gom được:</span>
                  <span className="font-bold text-teal-900 font-mono-numbers">
                    {formatVND(preview.grossTotal)}
                  </span>
                </div>

                {preview.commissionAmount > 0 && (
                  <div className="flex justify-between items-center py-0.5 text-slate-600">
                    <span>• Trừ tiền thảo chủ hụi:</span>
                    <span className="font-semibold text-slate-800 font-mono-numbers">
                      - {formatVND(preview.commissionAmount)}
                    </span>
                  </div>
                )}
              </div>

              {/* SỐ TIỀN NGƯỜI HỐT THỰC NHẬN */}
              <div className="p-3 bg-white rounded-xl border border-teal-200 flex items-center justify-between shadow-xs">
                <div>
                  <div className="text-[11px] font-bold text-teal-800 uppercase">
                    Thực Giao Người Hốt:
                  </div>
                  <div className="text-xs font-medium text-slate-500">
                    {preview.winnerMemberName}
                  </div>
                </div>
                <div className="text-lg font-black text-emerald-700 font-mono-numbers">
                  {formatVND(preview.netWinnerPayout)}
                </div>
              </div>
            </div>
          )}

          {errorMsg && (
            <p className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-200 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
            </p>
          )}

          {/* Nút Chốt Kỳ */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md shadow-teal-600/30 flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Chốt Kỳ & Mở Bảng Gom
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
