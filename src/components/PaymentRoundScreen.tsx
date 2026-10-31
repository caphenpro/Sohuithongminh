/**
 * MÀN HÌNH 3: BẢNG THU TIỀN KỲ HIỆN TẠI (QUAN TRỌNG NHẤT)
 * - 2 Tab rõ ràng: Tab "Chưa đóng" (Màu đỏ/cam) và Tab "Đã đóng" (Màu xanh lá)
 * - Chạm 1 chạm để chuyển trạng thái "Đã đóng"
 * - Xuất tin nhắn Zalo và Xuất file ảnh PNG Bảng kê chất lượng cao
 * - Đối soát chéo và đánh dấu giao tiền cho người hốt
 */

import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Share2,
  Image as ImageIcon,
  Copy,
  Check,
  Search,
  Award,
  DollarSign,
  AlertCircle,
  Clock,
  Send,
  Info,
} from 'lucide-react';
import { HuiGroup, HuiRound, PaymentItem } from '../types/hui';
import { formatVND, formatDateVN } from '../utils/formatters';
import { getRoundCollectionStats } from '../utils/huiCalculator';
import { generateZaloShareText, downloadReceiptImageFile, shareReceiptImage } from '../utils/receiptGenerator';

interface PaymentRoundScreenProps {
  group: HuiGroup;
  round: HuiRound;
  onBack: () => void;
  onUpdateRound: (updatedRound: HuiRound) => void;
}

export const PaymentRoundScreen: React.FC<PaymentRoundScreenProps> = ({
  group,
  round,
  onBack,
  onUpdateRound,
}) => {
  const [activeTab, setActiveTab] = useState<'unpaid' | 'paid'>('unpaid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [isExportingImage, setIsExportingImage] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Tính toán thống kê gom tiền kỳ này
  const stats = useMemo(() => getRoundCollectionStats(round), [round]);

  // Danh sách chưa đóng và đã đóng
  const { unpaidPayments, paidPayments, winnerPayment } = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = round.payments.filter((p) =>
      q ? p.memberName.toLowerCase().includes(q) : true
    );

    const winner = round.payments.find((p) => p.isWinnerThisRound);
    const unpaid = filtered.filter((p) => !p.isPaid && !p.isWinnerThisRound);
    const paid = filtered.filter((p) => p.isPaid && !p.isWinnerThisRound);

    return { unpaidPayments: unpaid, paidPayments: paid, winnerPayment: winner };
  }, [round.payments, searchQuery]);

  // Hành động chạm để đổi trạng thái đóng tiền
  const handleTogglePayment = (shareId: string) => {
    const updatedPayments = round.payments.map((p) => {
      if (p.shareId === shareId) {
        const nextState = !p.isPaid;
        return {
          ...p,
          isPaid: nextState,
          paidAt: nextState ? new Date().toISOString() : undefined,
        };
      }
      return p;
    });

    const isAllNowPaid = updatedPayments.every((p) => p.isWinnerThisRound || p.isPaid);
    const updatedRound: HuiRound = {
      ...round,
      payments: updatedPayments,
      status: isAllNowPaid && round.isPayoutCompleted ? 'completed' : 'collecting',
    };

    onUpdateRound(updatedRound);
  };

  // Cập nhật trạng thái giao tiền cho người hốt
  const handleTogglePayout = () => {
    const nextPayoutState = !round.isPayoutCompleted;
    const isAllPaid = round.payments.every((p) => p.isWinnerThisRound || p.isPaid);

    const updatedRound: HuiRound = {
      ...round,
      isPayoutCompleted: nextPayoutState,
      payoutDate: nextPayoutState ? new Date().toISOString() : undefined,
      status: isAllPaid && nextPayoutState ? 'completed' : 'collecting',
    };

    onUpdateRound(updatedRound);
    setNotification(
      nextPayoutState
        ? `Đã đánh dấu giao đủ tiền cho ${round.winnerMemberName}!`
        : `Đã hoàn tác trạng thái giao tiền người hốt`
    );
    setTimeout(() => setNotification(null), 2500);
  };

  // Chia sẻ Zalo
  const handleCopyZalo = () => {
    const text = generateZaloShareText(group, round);
    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    });
  };

  // Chia sẻ ảnh PNG qua bảng chia sẻ Android (chọn Zalo/Messenger)
  const handleShareImage = async () => {
    setIsExportingImage(true);
    try {
      const result = await shareReceiptImage(group, round);
      setNotification(result === 'shared'
        ? 'Đã mở bảng chia sẻ. Chọn Zalo để gửi ảnh bảng kê.'
        : 'Thiết bị chưa hỗ trợ chia sẻ tệp; ảnh đã được chuyển sang tải về.');
      setTimeout(() => setNotification(null), 4000);
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') return;
      console.error('Lỗi chia sẻ ảnh bảng kê:', e);
      setNotification(e instanceof Error ? `Không chia sẻ được ảnh: ${e.message}` : 'Không chia sẻ được ảnh bảng kê.');
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setIsExportingImage(false);
    }
  };

  // Xuất ảnh bảng kê PNG
  const handleDownloadImage = async () => {
    setIsExportingImage(true);
    try {
      await downloadReceiptImageFile(group, round);
      setNotification('Đã lưu ảnh vào thư mục Download/SoHuiThongMinh trên điện thoại.');
      setTimeout(() => setNotification(null), 3000);
    } catch (e) {
      console.error('Lỗi xuất ảnh bảng kê:', e);
      setNotification(e instanceof Error ? `Không xuất được ảnh: ${e.message}` : 'Không xuất được ảnh bảng kê. Vui lòng thử lại.');
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setIsExportingImage(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col pb-24 text-slate-900">
      {/* Top App Bar Compact */}
      <header className="sticky top-0 z-30 bg-teal-800 text-white shadow-md pt-safe">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-xl text-teal-100 hover:text-white hover:bg-teal-700/60 transition flex items-center gap-1"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-xs font-semibold">Danh sách kỳ</span>
          </button>

          <div className="text-center">
            <h1 className="text-base font-bold tracking-tight">
              Bảng Thu Tiền Kỳ {round.roundNumber}/{group.totalShares}
            </h1>
            <p className="text-[11px] text-teal-200 truncate max-w-[200px]">
              {group.name}
            </p>
          </div>

          <button
            onClick={() => setShowShareModal(true)}
            className="p-2 -mr-2 rounded-xl text-teal-100 hover:text-white hover:bg-teal-700/60 transition"
            title="Chia sẻ bảng thu"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {/* Thanh tiến độ thu tiền nổi bật */}
        <div className="px-4 pb-3 pt-1 border-t border-teal-700/60">
          <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
            <span className="text-teal-100">
              Đã thu: {formatVND(stats.totalCollected)} / {formatVND(stats.totalDue)}
            </span>
            <span className="text-emerald-300 font-mono-numbers">
              {stats.progressPercent}%
            </span>
          </div>

          <div className="w-full bg-teal-950/40 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all duration-300 shadow-sm"
              style={{ width: `${Math.min(100, stats.progressPercent)}%` }}
            />
          </div>
        </div>
      </header>

      {/* Thông báo dạng Toast */}
      {notification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 bg-slate-900/90 text-white text-xs font-semibold py-2 px-4 rounded-full shadow-lg backdrop-blur-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          {notification}
        </div>
      )}

      {/* Thẻ người hốt & Tiền thực nhận */}
      <div className="px-4 pt-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wide">
                  Người hốt kỳ này:
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {round.winnerMemberName || 'Chưa chọn'}
                </h3>
                <p className="text-xs text-slate-500">
                  Giá kêu: <strong className="text-slate-700">{formatVND(round.bidAmount)}</strong> · Thảo: {formatVND(round.commissionAmount)}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-semibold text-slate-500 uppercase block">
                Thực nhận về:
              </span>
              <span className="text-base sm:text-lg font-black text-emerald-700 font-mono-numbers block">
                {formatVND(round.netWinnerPayout)}
              </span>
            </div>
          </div>

          {/* Nút bấm trạng thái giao tiền cho người hốt */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-600">Bàn giao tiền cho người hốt:</span>
            <button
              onClick={handleTogglePayout}
              className={`py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                round.isPayoutCompleted
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
              }`}
            >
              {round.isPayoutCompleted ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Đã Giao Tiền
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4 text-amber-600" /> Chưa Giao Tiền
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tìm kiếm nhanh */}
      <div className="px-4 pt-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm tên con hụi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-2.5 pl-9 pr-4 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 2 TAB LỚN ĐƯỢC THIẾT KẾ CHO CHỦ HỤI ĐI GOM TIỀN */}
      <div className="px-4 pt-3">
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-200/80 rounded-2xl">
          {/* Tab CHƯA ĐÓNG (Màu đỏ/cam nổi bật) */}
          <button
            onClick={() => setActiveTab('unpaid')}
            className={`py-3 px-3 rounded-xl text-center transition flex flex-col items-center justify-center ${
              activeTab === 'unpaid'
                ? 'bg-red-600 text-white shadow-md font-bold'
                : 'text-slate-700 hover:bg-slate-300/50 font-medium'
            }`}
          >
            <span className="text-xs uppercase tracking-wider flex items-center gap-1">
              🔴 Chưa đóng
            </span>
            <span className="text-sm font-black mt-0.5">
              {stats.pendingCount} người · {formatVND(stats.pendingAmount)}
            </span>
          </button>

          {/* Tab ĐÃ ĐÓNG (Màu xanh lá đối soát) */}
          <button
            onClick={() => setActiveTab('paid')}
            className={`py-3 px-3 rounded-xl text-center transition flex flex-col items-center justify-center ${
              activeTab === 'paid'
                ? 'bg-emerald-700 text-white shadow-md font-bold'
                : 'text-slate-700 hover:bg-slate-300/50 font-medium'
            }`}
          >
            <span className="text-xs uppercase tracking-wider flex items-center gap-1">
              🟢 Đã đóng
            </span>
            <span className="text-sm font-black mt-0.5">
              {stats.paidCount} người · {formatVND(stats.totalCollected)}
            </span>
          </button>
        </div>
      </div>

      {/* DANH SÁCH CON HỤI THEO TAB */}
      <div className="px-4 pt-3 space-y-2.5">
        {activeTab === 'unpaid' ? (
          /* TAB CHƯA ĐÓNG */
          unpaidPayments.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center space-y-3 border border-slate-200 shadow-xs">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-800">
                Đã Gom Đủ 100% Tiền Hụi Kỳ Này!
              </h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Tất cả con hụi đã hoàn thành đóng tiền. Hãy kiểm tra và bấm "Đã Giao Tiền" cho người hốt.
              </p>
            </div>
          ) : (
            unpaidPayments.map((item) => {
              const shareTag =
                group.shares.filter((s) => s.memberId === item.memberId).length > 1
                  ? ` (Chân ${item.shareIndex})`
                  : '';
              return (
                <div
                  key={item.shareId}
                  onClick={() => handleTogglePayment(item.shareId)}
                  className="bg-white hover:bg-slate-50 active:scale-[0.99] transition rounded-2xl p-4 border border-red-200/80 shadow-xs flex items-center justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-6 h-6 rounded-full border-2 border-red-500 text-transparent flex items-center justify-center shrink-0">
                      <Circle className="w-4 h-4 text-red-300" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-slate-900 truncate">
                          {item.memberName}
                        </span>
                        <span className="text-xs text-slate-500 shrink-0 font-medium">
                          {shareTag}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-0.5 text-xs">
                        <span
                          className={`font-semibold ${
                            item.isLive ? 'text-sky-700' : 'text-purple-700'
                          }`}
                        >
                          {item.isLive ? 'Hụi sống' : 'Hụi chết'}
                        </span>
                        {item.phone && (
                          <span className="text-slate-400">· {item.phone}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Nút bấm to chạm nhẹ để đánh dấu [ĐÃ THU] */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-base sm:text-lg font-black text-red-600 font-mono-numbers block">
                        {formatVND(item.amountDue)}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Chạm để tích
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTogglePayment(item.shareId);
                      }}
                      className="h-11 px-3.5 bg-red-600 hover:bg-red-700 active:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1 transition"
                    >
                      <Check className="w-4 h-4" /> Đã thu
                    </button>
                  </div>
                </div>
              );
            })
          )
        ) : (
          /* TAB ĐÃ ĐÓNG (ĐỐI SOÁT CHÉO) */
          paidPayments.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center space-y-2 border border-slate-200">
              <p className="text-sm font-semibold text-slate-600">
                Chưa có ai đóng tiền kỳ này.
              </p>
              <p className="text-xs text-slate-400">
                Khi thu được tiền ai, chạm vào nút "Đã thu" ở Tab Chưa Đóng để chuyển sang đây.
              </p>
            </div>
          ) : (
            paidPayments.map((item) => {
              const shareTag =
                group.shares.filter((s) => s.memberId === item.memberId).length > 1
                  ? ` (Chân ${item.shareIndex})`
                  : '';
              return (
                <div
                  key={item.shareId}
                  className="bg-white rounded-2xl p-3.5 border border-emerald-200 shadow-xs flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-slate-900 truncate">
                          {item.memberName}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          {shareTag}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>{item.isLive ? 'Hụi sống' : 'Hụi chết'}</span>
                        {item.paidAt && (
                          <span>· Lúc {new Date(item.paidAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-bold text-emerald-700 font-mono-numbers">
                      {formatVND(item.amountDue)}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleTogglePayment(item.shareId)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded-lg transition"
                      title="Hoàn tác nếu bấm nhầm"
                    >
                      Hoàn tác
                    </button>
                  </div>
                </div>
              );
            })
          )
        )}
      </div>

      {/* THANH CÔNG CỤ DƯỚI ĐÁY: XUẤT ZALO & XUẤT ẢNH BẢNG KÊ */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 pb-safe shadow-lg">
        <div className="max-w-xl mx-auto flex items-center gap-3">
          <button
            onClick={() => setShowShareModal(true)}
            className="flex-1 py-3 px-3 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition"
          >
            <Send className="w-4 h-4" /> Gửi Tin Nhắn Zalo
          </button>

          <button
            onClick={handleShareImage}
            disabled={isExportingImage}
            className="flex-1 py-3 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition"
          >
            <ImageIcon className="w-4 h-4 text-emerald-400" />
            {isExportingImage ? 'Đang tạo ảnh...' : 'Chia sẻ ảnh Zalo'}
          </button>
        </div>
      </div>

      {/* MODAL XUẤT TIN NHẮN ZALO / MESSENGER */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Xuất Bảng Gom Gửi Zalo / Messenger
                </h3>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Bấm nút <strong>Sao chép nội dung</strong> bên dưới, sau đó mở nhóm chat Zalo hoặc Messenger của dây hụi và Dán (Paste) để gửi cho mọi người xem:
            </p>

            <div className="flex-1 overflow-y-auto bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <pre className="text-xs text-slate-800 font-sans whitespace-pre-wrap leading-relaxed">
                {generateZaloShareText(group, round)}
              </pre>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleCopyZalo}
                className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm"
              >
                {copiedText ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" /> Đã Sao Chép!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" /> Sao Chép Nội Dung
                  </>
                )}
              </button>

              <button
                onClick={handleDownloadImage}
                disabled={isExportingImage}
                className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                <ImageIcon className="w-4 h-4" /> Tải File Ảnh
              </button>
              <button
                onClick={handleShareImage}
                disabled={isExportingImage}
                className="py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                <Share2 className="w-4 h-4" /> Gửi ảnh
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
