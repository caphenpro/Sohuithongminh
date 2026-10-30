/**
 * MÀN HÌNH 2: CHI TIẾT DÂY HỤI (QUẢN LÝ CÁC KỲ)
 * - Hiển thị danh sách các kỳ từ kỳ 1 đến kỳ cuối
 * - Thấy rõ kỳ đã xong, kỳ đang diễn ra, kỳ sắp tới
 * - Nút [ Kêu Hụi Kỳ Tiếp Theo ] mở modal tính toán và chốt kỳ
 */

import React, { useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Calendar,
  Users,
  Award,
  CheckCircle2,
  Clock,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { HuiGroup, HuiRound } from '../types/hui';
import { formatVND, formatDateVN, getCycleLabel } from '../utils/formatters';
import { getRoundCollectionStats } from '../utils/huiCalculator';
import { BidRoundModal } from './BidRoundModal';

interface HuiDetailScreenProps {
  group: HuiGroup;
  onBack: () => void;
  onSelectRound: (round: HuiRound) => void;
  onUpdateGroup: (updatedGroup: HuiGroup) => void;
}

export const HuiDetailScreen: React.FC<HuiDetailScreenProps> = ({
  group,
  onBack,
  onSelectRound,
  onUpdateGroup,
}) => {
  const [activeTab, setActiveTab] = useState<'rounds' | 'members'>('rounds');
  const [showBidModal, setShowBidModal] = useState(false);

  const completedRoundsCount = group.rounds.filter((r) => r.status === 'completed').length;
  const collectingRound = group.rounds.find((r) => r.status === 'collecting');
  const nextRoundNumber = group.rounds.length + 1;
  const hasRemainingRounds = group.rounds.length < group.totalShares;

  // Xử lý khi chốt kỳ mới từ modal
  const handleConfirmNewRound = (newRound: HuiRound) => {
    // Đánh dấu chân hụi trúng thành đã chết
    const updatedShares = group.shares.map((s) => {
      if (s.id === newRound.winnerShareId) {
        return {
          ...s,
          isDead: true,
          wonRoundNumber: newRound.roundNumber,
          bidAmountWon: newRound.bidAmount,
        };
      }
      return s;
    });

    const updatedRounds = [...group.rounds, newRound];
    const isNowAllDone = updatedRounds.length === group.totalShares && newRound.status === 'completed';

    const updatedGroup: HuiGroup = {
      ...group,
      shares: updatedShares,
      rounds: updatedRounds,
      currentRoundNumber: newRound.roundNumber,
      status: isNowAllDone ? 'completed' : 'active',
    };

    onUpdateGroup(updatedGroup);

    // Chuyển thẳng vào Màn hình 3 (Bảng thu tiền kỳ mới này)
    onSelectRound(newRound);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col pb-24 text-slate-900">
      {/* Top App Bar */}
      <header className="sticky top-0 z-30 bg-teal-800 text-white shadow-md pt-safe">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-xl text-teal-100 hover:text-white hover:bg-teal-700/60 transition flex items-center gap-1"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-xs font-semibold">Tất cả dây</span>
          </button>

          <div className="text-center truncate px-2">
            <h1 className="text-base font-bold tracking-tight truncate">
              {group.name}
            </h1>
            <p className="text-[11px] text-teal-200">
              {getCycleLabel(group.cycle)} · {formatVND(group.baseAmount)}
            </p>
          </div>

          <div className="w-8" />
        </div>
      </header>

      {/* Thẻ tóm tắt thông tin dây hụi */}
      <div className="px-4 pt-4">
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-slate-500 font-medium block mb-1">Giá 1 phần:</span>
              <span className="text-base font-bold text-teal-700 font-mono-numbers">
                {formatVND(group.baseAmount)}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-slate-500 font-medium block mb-1">Quy mô dây:</span>
              <span className="text-base font-bold text-slate-800 font-mono-numbers">
                {group.totalShares} phần ({group.totalShares} kỳ)
              </span>
            </div>
          </div>

          {/* Tiến độ các kỳ */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-600">Tiến độ dây hụi:</span>
              <span className="text-teal-700">
                Đã mở {group.rounds.length} / {group.totalShares} kỳ
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-teal-600 h-full rounded-full transition-all"
                style={{
                  width: `${Math.round((group.rounds.length / group.totalShares) * 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Cảnh báo nếu đang có kỳ mở gom tiền */}
          {collectingRound && (
            <div
              onClick={() => onSelectRound(collectingRound)}
              className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between cursor-pointer hover:bg-amber-100/70 transition"
            >
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                </span>
                <div>
                  <span className="text-xs font-bold text-amber-900 block">
                    Kỳ {collectingRound.roundNumber} ĐANG GOM TIỀN!
                  </span>
                  <span className="text-[11px] text-amber-700">
                    Người hốt: {collectingRound.winnerMemberName}
                  </span>
                </div>
              </div>

              <span className="text-xs font-bold text-teal-800 flex items-center gap-1">
                Vào thu tiền <ChevronRight className="w-4 h-4" />
              </span>
            </div>
          )}
        </div>
      </div>

      {/* NÚT LỚN KÊU HỤI KỲ TIẾP THEO (YÊU CẦU ĐẶC BIỆT CỦA USER) */}
      {hasRemainingRounds && !collectingRound && (
        <div className="px-4 pt-4">
          <button
            onClick={() => setShowBidModal(true)}
            className="w-full py-4 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white rounded-2xl font-bold text-base shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            KÊU HỤI KỲ {nextRoundNumber} TIẾP THEO
          </button>
        </div>
      )}

      {/* Tabs Chuyển đổi: Danh sách Kỳ / Danh sách Con Hụi */}
      <div className="px-4 pt-4">
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-200/80 rounded-2xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('rounds')}
            className={`py-2.5 rounded-xl transition ${
              activeTab === 'rounds'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Danh Sách Các Kỳ ({group.rounds.length}/{group.totalShares})
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`py-2.5 rounded-xl transition ${
              activeTab === 'members'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Danh Sách Con Hụi ({group.shares.length} phần)
          </button>
        </div>
      </div>

      {/* TAB 1: DANH SÁCH CÁC KỲ */}
      {activeTab === 'rounds' ? (
        <div className="px-4 pt-3 space-y-3">
          {group.rounds.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center space-y-3 border border-slate-200">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 mx-auto flex items-center justify-center font-bold">
                1
              </div>
              <h4 className="text-sm font-bold text-slate-800">Dây hụi mới tạo!</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Bấm nút <strong>[Kêu Hụi Kỳ 1 Tiếp Theo]</strong> bên trên để bắt đầu mở thăm kỳ đầu tiên.
              </p>
              <button
                onClick={() => setShowBidModal(true)}
                className="py-2.5 px-4 bg-teal-600 text-white text-xs font-bold rounded-xl"
              >
                Mở Kỳ 1 Ngay
              </button>
            </div>
          ) : (
            // Danh sách các kỳ đảo ngược (kỳ mới nhất ở trên cùng)
            [...group.rounds].reverse().map((round) => {
              const stats = getRoundCollectionStats(round);
              const isCollecting = round.status === 'collecting';
              const isCompleted = round.status === 'completed';

              return (
                <div
                  key={round.id}
                  onClick={() => onSelectRound(round)}
                  className={`bg-white rounded-3xl p-4 shadow-xs border transition cursor-pointer hover:shadow-md ${
                    isCollecting
                      ? 'border-amber-400 bg-amber-50/20 ring-1 ring-amber-300'
                      : 'border-slate-200 hover:border-teal-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 ${
                          isCollecting
                            ? 'bg-amber-500 text-white shadow-sm'
                            : 'bg-teal-50 text-teal-800 border border-teal-200'
                        }`}
                      >
                        Kỳ {round.roundNumber}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">
                            {round.winnerMemberName || 'Chưa xác định'}
                          </span>
                          {isCollecting && (
                            <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                              Đang gom
                            </span>
                          )}
                          {isCompleted && (
                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Xong
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-slate-500 mt-0.5">
                          Ngày {formatDateVN(round.date)} · Thăm: {formatVND(round.bidAmount)}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 uppercase block font-medium">
                        Thực nhận
                      </span>
                      <span className="text-sm font-black text-emerald-700 font-mono-numbers block">
                        {formatVND(round.netWinnerPayout)}
                      </span>
                    </div>
                  </div>

                  {/* Tiến độ thu tiền của kỳ này */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="text-slate-600">
                      Đã thu: <strong className="text-slate-900">{stats.paidCount}/{stats.paidCount + stats.pendingCount} phần</strong>
                      {stats.pendingCount > 0 && (
                        <span className="text-red-600 font-semibold ml-1">
                          (Thiếu {formatVND(stats.pendingAmount)})
                        </span>
                      )}
                    </div>

                    <span className="text-teal-700 font-bold flex items-center gap-0.5 text-xs">
                      Chi tiết <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* TAB 2: DANH SÁCH CON HỤI */
        <div className="px-4 pt-3 space-y-2">
          {group.shares.map((share, index) => {
            const isWinner = share.isDead;
            return (
              <div
                key={share.id}
                className="bg-white rounded-2xl p-3.5 border border-slate-200 flex items-center justify-between gap-3 shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold shrink-0">
                    {index + 1}
                  </span>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">
                        {share.memberName}
                      </span>
                      {group.shares.filter((s) => s.memberId === share.memberId).length > 1 && (
                        <span className="text-xs text-slate-500 font-medium">
                          (Chân {share.shareIndex})
                        </span>
                      )}
                    </div>
                    {share.phone && (
                      <span className="text-xs text-slate-400">{share.phone}</span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  {isWinner ? (
                    <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-xl border border-purple-200 inline-block">
                      Đã hốt Kỳ {share.wonRoundNumber} (Hụi chết)
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-xl border border-sky-200 inline-block">
                      Chưa hốt (Hụi sống)
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Kêu Hụi Kỳ Mới */}
      {showBidModal && (
        <BidRoundModal
          isOpen={showBidModal}
          onClose={() => setShowBidModal(false)}
          group={group}
          nextRoundNumber={nextRoundNumber}
          onConfirmRound={handleConfirmNewRound}
        />
      )}
    </div>
  );
};
