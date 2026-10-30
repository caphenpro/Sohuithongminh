/**
 * Module cốt lõi: Tính toán số tiền hụi sống, hụi chết, hoa hồng và tiền người hốt nhận
 * Tuân thủ tuyệt đối quy tắc tài chính hụi truyền thống Việt Nam
 */

import { HuiGroup, HuiRound, HuiShare, PaymentItem } from '../types/hui';

export interface CalculationPreview {
  baseAmount: number;
  bidAmount: number;
  liveAmountDue: number; // Tiền mỗi phần hụi sống phải nộp (Gốc - Thăm)
  deadAmountDue: number; // Tiền mỗi phần hụi chết phải nộp (Gốc)
  totalLiveSharesCount: number; // Số phần hụi sống (không tính phần trúng)
  totalDeadSharesCount: number; // Số phần hụi chết
  liveTotalCollected: number; // Tổng tiền hụi sống đóng
  deadTotalCollected: number; // Tổng tiền hụi chết đóng
  grossTotal: number; // Tổng gộp gom được
  commissionAmount: number; // Tiền thảo chủ hụi
  firstRoundDeduction: number; // Tiền đầu nếu có
  netWinnerPayout: number; // Thực tế người hốt nhận về
  winnerShareId: string;
  winnerMemberName: string;
}

/**
 * Tính toán trước con số khi người dùng mở thăm / kêu hụi kỳ mới
 */
export function calculateRoundPreview(
  group: HuiGroup,
  roundNumber: number,
  winnerShareId: string,
  bidAmount: number,
  customCommission?: number
): CalculationPreview {
  const baseAmount = group.baseAmount;
  const liveAmountDue = Math.max(0, baseAmount - bidAmount);
  const deadAmountDue = baseAmount;

  const winnerShare = group.shares.find((s) => s.id === winnerShareId);
  const winnerMemberName = winnerShare ? winnerShare.memberName : '';

  // Đếm các phần chết (đã hốt trước kỳ này) và các phần sống (chưa hốt)
  let totalDeadSharesCount = 0;
  let totalLiveSharesCount = 0;

  group.shares.forEach((share) => {
    if (share.id === winnerShareId) {
      // Phần trúng kỳ này là phần nhận tiền
      return;
    }
    if (share.isDead) {
      totalDeadSharesCount += 1;
    } else {
      totalLiveSharesCount += 1;
    }
  });

  const liveTotalCollected = totalLiveSharesCount * liveAmountDue;
  const deadTotalCollected = totalDeadSharesCount * deadAmountDue;
  const grossTotal = liveTotalCollected + deadTotalCollected;

  const commissionAmount =
    customCommission !== undefined ? customCommission : group.commissionDefault || 0;
  const firstRoundDeduction = 0; // Tiền đầu nếu có thỏa thuận riêng

  const netWinnerPayout = Math.max(0, grossTotal - commissionAmount - firstRoundDeduction);

  return {
    baseAmount,
    bidAmount,
    liveAmountDue,
    deadAmountDue,
    totalLiveSharesCount,
    totalDeadSharesCount,
    liveTotalCollected,
    deadTotalCollected,
    grossTotal,
    commissionAmount,
    firstRoundDeduction,
    netWinnerPayout,
    winnerShareId,
    winnerMemberName,
  };
}

/**
 * Khởi tạo dữ liệu thanh toán chi tiết cho một kỳ hụi
 */
export function generateRoundPayments(
  group: HuiGroup,
  winnerShareId: string,
  bidAmount: number
): PaymentItem[] {
  const baseAmount = group.baseAmount;
  const liveAmountDue = Math.max(0, baseAmount - bidAmount);
  const deadAmountDue = baseAmount;

  return group.shares.map((share) => {
    const isWinnerThisRound = share.id === winnerShareId;
    const isLive = !share.isDead && !isWinnerThisRound;

    let amountDue = 0;
    if (isWinnerThisRound) {
      // Người hốt kỳ này nhận tiền, phần trúng không phải nộp lại
      amountDue = 0;
    } else if (share.isDead) {
      // Hụi chết: nộp đủ tiền gốc
      amountDue = deadAmountDue;
    } else {
      // Hụi sống: nộp tiền gốc trừ tiền thăm
      amountDue = liveAmountDue;
    }

    return {
      shareId: share.id,
      memberId: share.memberId,
      memberName: share.memberName,
      phone: share.phone,
      shareIndex: share.shareIndex,
      isLive: !share.isDead,
      isWinnerThisRound,
      amountDue,
      isPaid: isWinnerThisRound ? true : false, // Phần trúng tự động đánh dấu đã xong
      paidAt: isWinnerThisRound ? new Date().toISOString() : undefined,
      note: isWinnerThisRound ? 'Chân hốt kỳ này' : '',
    };
  });
}

/**
 * Tính toán thống kê gom tiền của một kỳ hụi
 */
export function getRoundCollectionStats(round: HuiRound) {
  let totalDue = 0;
  let totalCollected = 0;
  let paidCount = 0;
  let pendingCount = 0;

  round.payments.forEach((p) => {
    if (p.isWinnerThisRound) return; // Không tính phần trúng

    totalDue += p.amountDue;
    if (p.isPaid) {
      totalCollected += p.amountDue;
      paidCount += 1;
    } else {
      pendingCount += 1;
    }
  });

  const pendingAmount = Math.max(0, totalDue - totalCollected);
  const progressPercent = totalDue > 0 ? Math.round((totalCollected / totalDue) * 100) : 100;
  const isAllCollected = pendingCount === 0;

  return {
    totalDue,
    totalCollected,
    pendingAmount,
    paidCount,
    pendingCount,
    progressPercent,
    isAllCollected,
  };
}
