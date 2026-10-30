/**
 * MÀN HÌNH 1: DANH SÁCH DÂY HỤI (TRANG CHỦ)
 * - Tổng quan các dây hụi đang chạy
 * - Nút bấm lớn màu xanh: [ + Tạo Dây Hụi Mới ]
 * - Thống kê nhanh: Tổng số tiền cần thu / Đã thu bao nhiêu %
 * - Menu quản lý bảo mật PIN & Sao lưu dữ liệu Zalo/Thẻ nhớ
 */

import React, { useState, useMemo } from 'react';
import {
  Plus,
  Shield,
  Download,
  Settings,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Lock,
  Layers,
  Calendar,
} from 'lucide-react';
import { AppSettings, HuiGroup, HuiRound } from '../types/hui';
import { formatVND, formatDateVN, getCycleLabel } from '../utils/formatters';
import { getRoundCollectionStats } from '../utils/huiCalculator';

interface HuiGroupListScreenProps {
  groups: HuiGroup[];
  settings: AppSettings;
  onSelectGroup: (group: HuiGroup) => void;
  onSelectActiveRound: (group: HuiGroup, round: HuiRound) => void;
  onOpenCreateModal: () => void;
  onOpenBackupModal: () => void;
  onOpenPinModal: () => void;
  onLockApp: () => void;
}

export const HuiGroupListScreen: React.FC<HuiGroupListScreenProps> = ({
  groups,
  settings,
  onSelectGroup,
  onSelectActiveRound,
  onOpenCreateModal,
  onOpenBackupModal,
  onOpenPinModal,
  onLockApp,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('active');

  // Tính toán thống kê tổng quan toàn app
  const summary = useMemo(() => {
    let todayDue = 0;
    let todayCollected = 0;
    let activeRoundsCount = 0;

    groups.forEach((g) => {
      g.rounds.forEach((r) => {
        if (r.status === 'collecting') {
          activeRoundsCount += 1;
          const stats = getRoundCollectionStats(r);
          todayDue += stats.totalDue;
          todayCollected += stats.totalCollected;
        }
      });
    });

    const percent = todayDue > 0 ? Math.round((todayCollected / todayDue) * 100) : 100;
    const pendingAmount = Math.max(0, todayDue - todayCollected);

    return {
      activeGroupsCount: groups.filter((g) => g.status === 'active').length,
      totalGroupsCount: groups.length,
      todayDue,
      todayCollected,
      pendingAmount,
      percent,
      activeRoundsCount,
    };
  }, [groups]);

  // Lọc theo trạng thái
  const filteredGroups = useMemo(() => {
    if (filterStatus === 'active') return groups.filter((g) => g.status === 'active');
    if (filterStatus === 'completed') return groups.filter((g) => g.status === 'completed');
    return groups;
  }, [groups, filterStatus]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col pb-24 text-slate-900">
      {/* Top App Bar Contract: Brand zone + Utilities */}
      <header className="sticky top-0 z-30 bg-teal-800 text-white shadow-md pt-safe">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-700 border border-teal-600 flex items-center justify-center font-black text-white text-base shadow-xs">
              H
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight">Sổ Hụi Thông Minh</h1>
              <span className="text-[10px] text-teal-200 block font-medium">
                100% Ngoại tuyến · Bảo mật tại chỗ
              </span>
            </div>
          </div>

          {/* Công cụ tiện ích: Khóa PIN & Sao lưu */}
          <div className="flex items-center gap-1">
            <button
              onClick={onOpenBackupModal}
              className="p-2 rounded-xl text-teal-100 hover:text-white hover:bg-teal-700/60 transition"
              title="Sao lưu & Phục hồi"
            >
              <Download className="w-5 h-5" />
            </button>

            <button
              onClick={onOpenPinModal}
              className="p-2 rounded-xl text-teal-100 hover:text-white hover:bg-teal-700/60 transition"
              title="Cài đặt mã PIN"
            >
              <Shield className="w-5 h-5" />
            </button>

            {settings.pinEnabled && (
              <button
                onClick={onLockApp}
                className="p-2 rounded-xl text-teal-100 hover:text-white hover:bg-teal-700/60 transition"
                title="Khóa ứng dụng ngay"
              >
                <Lock className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* THỐNG KÊ NHANH Ở ĐẦU MÀN HÌNH (YÊU CẦU ĐẶC BIỆT CỦA USER) */}
      <div className="px-4 pt-4">
        <div className="bg-gradient-to-br from-teal-900 to-teal-800 text-white rounded-3xl p-5 shadow-lg shadow-teal-950/15 border border-teal-700/50 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-bold text-teal-200">
              Tổng quan gom hụi hôm nay
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-700/60 text-teal-100 border border-teal-600/50">
              {summary.activeRoundsCount} kỳ đang gom tiền
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-1">
            <div>
              <span className="text-[11px] text-teal-300 block font-medium">
                Tổng tiền cần gom:
              </span>
              <span className="text-xl sm:text-2xl font-black font-mono-numbers block tracking-tight">
                {formatVND(summary.todayDue)}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-teal-300 block font-medium">
                Đã thu được:
              </span>
              <span className="text-xl sm:text-2xl font-black text-emerald-300 font-mono-numbers block tracking-tight">
                {summary.percent}%
              </span>
            </div>
          </div>

          {/* Thanh đo tiến độ */}
          <div className="space-y-1.5 pt-1">
            <div className="w-full bg-teal-950/60 rounded-full h-3 overflow-hidden p-0.5">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-300 shadow-sm"
                style={{ width: `${Math.min(100, summary.percent)}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-teal-200 font-medium">
              <span>Đã gom: {formatVND(summary.todayCollected)}</span>
              {summary.pendingAmount > 0 && (
                <span className="text-amber-300 font-bold">
                  Còn thiếu: {formatVND(summary.pendingAmount)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* NÚT BẤM LỚN MÀU XANH [ + TẠO DÂY HỤI MỚI ] (YÊU CẦU ĐẶC BIỆT CỦA USER) */}
      <div className="px-4 pt-4">
        <button
          onClick={onOpenCreateModal}
          className="w-full py-4 px-5 bg-teal-600 hover:bg-teal-700 active:scale-[0.99] text-white rounded-2xl font-black text-base shadow-lg shadow-teal-600/30 flex items-center justify-center gap-2 transition"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
          TẠO DÂY HỤI MỚI
        </button>
      </div>

      {/* Bộ lọc trạng thái dây hụi */}
      <div className="px-4 pt-4 flex items-center justify-between">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Danh Sách Dây Hụi ({filteredGroups.length})
        </span>

        <div className="flex bg-slate-200/80 p-0.5 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filterStatus === 'active'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Đang chạy
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filterStatus === 'completed'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Đã xong
          </button>
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filterStatus === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tất cả
          </button>
        </div>
      </div>

      {/* DANH SÁCH CÁC THẺ DÂY HỤI */}
      <div className="px-4 pt-3 space-y-3.5">
        {filteredGroups.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center space-y-3 border border-slate-200 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 mx-auto flex items-center justify-center font-bold">
              <Layers className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              Chưa có dây hụi nào trong mục này
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Bấm nút xanh lớn <strong>[+ Tạo Dây Hụi Mới]</strong> bên trên để bắt đầu thêm dây hụi đầu tiên của bạn.
            </p>
          </div>
        ) : (
          filteredGroups.map((group) => {
            const collectingRound = group.rounds.find((r) => r.status === 'collecting');
            const completedCount = group.rounds.filter((r) => r.status === 'completed').length;
            const isCompleted = group.status === 'completed';

            return (
              <div
                key={group.id}
                onClick={() => onSelectGroup(group)}
                className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 hover:border-teal-300 hover:shadow-md transition cursor-pointer space-y-3"
              >
                {/* Header card */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-700 transition">
                      {group.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {formatVND(group.baseAmount)}/phần · {group.totalShares} phần · {getCycleLabel(group.cycle)}
                    </p>
                  </div>

                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-xl shrink-0 ${
                      isCompleted
                        ? 'bg-slate-100 text-slate-600'
                        : collectingRound
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-teal-50 text-teal-800 border border-teal-200'
                    }`}
                  >
                    {isCompleted ? 'Đã mãn hụi' : collectingRound ? 'Đang gom tiền' : 'Đang chạy'}
                  </span>
                </div>

                {/* Thanh tiến độ kỳ */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-600 font-medium">
                    <span>
                      Tiến độ: <strong>Kỳ {group.rounds.length}/{group.totalShares}</strong>
                    </span>
                    <span className="text-slate-500">
                      Bắt đầu: {formatDateVN(group.startDate)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-teal-600 h-full rounded-full transition-all"
                      style={{
                        width: `${Math.round((group.rounds.length / group.totalShares) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Nếu có kỳ đang gom tiền: Có nút tắt mở thẳng vào Màn hình 3 */}
                {collectingRound ? (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectActiveRound(group, collectingRound);
                    }}
                    className="p-3 bg-red-50 hover:bg-red-100/70 border border-red-200 rounded-2xl flex items-center justify-between text-xs transition"
                  >
                    <div>
                      <span className="font-bold text-red-700 block">
                        Kỳ {collectingRound.roundNumber}: Gom tiền ({collectingRound.winnerMemberName} hốt)
                      </span>
                      <span className="text-[11px] text-red-600">
                        Chạm để mở Bảng Thu Tiền ngay ➔
                      </span>
                    </div>

                    <button className="px-3 py-1.5 bg-red-600 text-white font-bold rounded-xl shadow-xs">
                      Gom tiền
                    </button>
                  </div>
                ) : (
                  <div className="pt-1 flex items-center justify-between text-xs text-teal-700 font-semibold">
                    <span>Xem chi tiết các kỳ & con hụi</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
