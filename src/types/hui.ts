/**
 * Định nghĩa cấu trúc dữ liệu cho Sổ Hụi Thông Minh
 */

export type HuiCycle = 'daily' | 'weekly' | 'biweekly' | 'monthly';

export interface HuiShare {
  id: string; // ID của chân hụi (unique)
  memberId: string;
  memberName: string;
  shareIndex: number; // Ví dụ: Chị Lan có 2 chân -> chân 1, chân 2
  phone?: string;
  isDead: boolean; // Đã hốt chưa
  wonRoundNumber?: number; // Hốt ở kỳ số mấy
  bidAmountWon?: number; // Tiền thăm lúc hốt
}

export interface HuiMember {
  id: string;
  name: string;
  phone?: string;
  sharesCount: number; // Số chân hụi người này tham gia
}

export interface PaymentItem {
  shareId: string;
  memberId: string;
  memberName: string;
  phone?: string;
  shareIndex: number;
  isLive: boolean; // Hụi sống (chưa hốt) hay hụi chết (đã hốt ở các kỳ trước)
  isWinnerThisRound: boolean; // Có phải người hốt kỳ này không
  amountDue: number; // Số tiền phải đóng
  isPaid: boolean; // Đã đóng chưa
  paidAt?: string; // Thời gian đóng
  note?: string; // Ghi chú (VD: đã chuyển khoản, gửi tiền mặt...)
}

export interface HuiRound {
  id: string;
  roundNumber: number; // Kỳ thứ mấy (1, 2, 3...)
  date: string; // Ngày khui kỳ này (YYYY-MM-DD)
  status: 'pending' | 'collecting' | 'completed';
  bidAmount: number; // Số tiền thăm / Giá kêu trúng kỳ này
  winnerMemberId?: string; // ID người hốt
  winnerMemberName?: string; // Tên người hốt
  winnerShareId?: string; // ID chân hụi trúng
  commissionAmount: number; // Tiền thảo (hoa hồng chủ hụi)
  firstRoundDeduction: number; // Tiền đầu nếu có
  payments: PaymentItem[]; // Danh sách nộp tiền của từng chân hụi
  netWinnerPayout: number; // Số tiền người hốt thực nhận
  isPayoutCompleted: boolean; // Đã giao tiền cho người hốt chưa
  payoutDate?: string; // Ngày giao tiền cho người hốt
  notes?: string;
}

export interface HuiGroup {
  id: string;
  name: string; // Tên dây hụi (VD: Dây 1 triệu - 20 phần - Chợ Chiều)
  baseAmount: number; // Số tiền 1 phần (VD: 1.000.000 đ)
  totalShares: number; // Tổng số phần (VD: 20 phần)
  cycle: HuiCycle; // Chu kỳ (ngày, tuần, nửa tháng, tháng)
  startDate: string; // Ngày bắt đầu
  commissionDefault: number; // Tiền thảo mặc định mỗi kỳ
  firstPotRule: 'auction' | 'owner_first'; // Kỳ đầu: đấu thăm hay chủ hụi nhận trước
  status: 'active' | 'completed';
  members: HuiMember[];
  shares: HuiShare[];
  rounds: HuiRound[];
  currentRoundNumber: number;
  createdAt: string;
}

export interface AppSettings {
  pinEnabled: boolean;
  pinCode: string; // 4 số
  autoLockMinutes: number; // Khóa sau số phút không dùng
  ownerName: string; // Tên chủ hụi
  ownerPhone: string;
  fontSize: 'normal' | 'large'; // Hỗ trợ chữ cực to cho người lớn tuổi
}

export interface HuiSummaryStats {
  totalActiveGroups: number;
  totalCompletedGroups: number;
  todayDueAmount: number; // Tiền cần thu các kỳ đang mở
  todayCollectedAmount: number; // Tiền đã thu
  todayPendingAmount: number; // Tiền còn thiếu
  collectionRate: number; // % đã thu
}
