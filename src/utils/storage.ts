/**
 * Quản lý lưu trữ ngoại tuyến LocalStorage & Sao lưu/Phục hồi dữ liệu
 */

import { AppSettings, HuiGroup, HuiShare, HuiMember, HuiRound, PaymentItem } from '../types/hui';

const STORAGE_KEYS = {
  GROUPS: 'so_hui_groups_v1',
  SETTINGS: 'so_hui_settings_v1',
  PIN: 'so_hui_pin_code_v1',
  LAST_UNLOCKED: 'so_hui_last_unlocked_v1',
};

export const DEFAULT_SETTINGS: AppSettings = {
  pinEnabled: false,
  pinCode: '',
  autoLockMinutes: 5,
  ownerName: 'Chủ Hụi',
  ownerPhone: '',
  fontSize: 'normal',
};

/**
 * Tạo dữ liệu mẫu thực tế của người Việt Nam để trải nghiệm ngay
 */
export function getSampleHuiData(): HuiGroup[] {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];

  const members: HuiMember[] = [
    { id: 'm1', name: 'Chị Mai (Trái cây)', phone: '0903123456', sharesCount: 2 },
    { id: 'm2', name: 'Anh Ba Hưng', phone: '0918765432', sharesCount: 1 },
    { id: 'm3', name: 'Cô Sáu Tiệm Vàng', phone: '0989112233', sharesCount: 2 },
    { id: 'm4', name: 'Chị Lan Tạp Hóa', phone: '0908889900', sharesCount: 1 },
    { id: 'm5', name: 'Bác Tư Thợ Mộc', phone: '0977665544', sharesCount: 1 },
    { id: 'm6', name: 'Em Hạnh Nail', phone: '0933221100', sharesCount: 1 },
    { id: 'm7', name: 'Chú Bảy Xe Ôm', phone: '0912334455', sharesCount: 1 },
    { id: 'm8', name: 'Chị Thảo Quần Áo', phone: '0988776655', sharesCount: 1 },
    { id: 'm9', name: 'Anh Năm Sửa Xe', phone: '0909556677', sharesCount: 1 },
    { id: 'm10', name: 'Cô Hồng Cafe', phone: '0944123789', sharesCount: 1 },
  ];

  // Tổng 12 phần
  const shares: HuiShare[] = [
    { id: 's1', memberId: 'm1', memberName: 'Chị Mai (Trái cây)', shareIndex: 1, phone: '0903123456', isDead: true, wonRoundNumber: 1, bidAmountWon: 0 },
    { id: 's2', memberId: 'm1', memberName: 'Chị Mai (Trái cây)', shareIndex: 2, phone: '0903123456', isDead: false },
    { id: 's3', memberId: 'm2', memberName: 'Anh Ba Hưng', shareIndex: 1, phone: '0918765432', isDead: true, wonRoundNumber: 2, bidAmountWon: 180000 },
    { id: 's4', memberId: 'm3', memberName: 'Cô Sáu Tiệm Vàng', shareIndex: 1, phone: '0989112233', isDead: false },
    { id: 's5', memberId: 'm3', memberName: 'Cô Sáu Tiệm Vàng', shareIndex: 2, phone: '0989112233', isDead: false },
    { id: 's6', memberId: 'm4', memberName: 'Chị Lan Tạp Hóa', shareIndex: 1, phone: '0908889900', isDead: true, wonRoundNumber: 3, bidAmountWon: 150000 },
    { id: 's7', memberId: 'm5', memberName: 'Bác Tư Thợ Mộc', shareIndex: 1, phone: '0977665544', isDead: false },
    { id: 's8', memberId: 'm6', memberName: 'Em Hạnh Nail', shareIndex: 1, phone: '0933221100', isDead: false },
    { id: 's9', memberId: 'm7', memberName: 'Chú Bảy Xe Ôm', shareIndex: 1, phone: '0912334455', isDead: false },
    { id: 's10', memberId: 'm8', memberName: 'Chị Thảo Quần Áo', shareIndex: 1, phone: '0988776655', isDead: false },
    { id: 's11', memberId: 'm9', memberName: 'Anh Năm Sửa Xe', shareIndex: 1, phone: '0909556677', isDead: false },
    { id: 's12', memberId: 'm10', memberName: 'Cô Hồng Cafe', shareIndex: 1, phone: '0944123789', isDead: false },
  ];

  // Kỳ 1: Đã xong
  const round1: HuiRound = {
    id: 'r1',
    roundNumber: 1,
    date: '2026-08-15',
    status: 'completed',
    bidAmount: 0,
    winnerMemberId: 'm1',
    winnerMemberName: 'Chị Mai (Trái cây)',
    winnerShareId: 's1',
    commissionAmount: 500000,
    firstRoundDeduction: 0,
    netWinnerPayout: 11000000 - 500000,
    isPayoutCompleted: true,
    payoutDate: '2026-08-15',
    payments: shares.map((s) => ({
      shareId: s.id,
      memberId: s.memberId,
      memberName: s.memberName,
      phone: s.phone,
      shareIndex: s.shareIndex,
      isLive: true,
      isWinnerThisRound: s.id === 's1',
      amountDue: s.id === 's1' ? 0 : 1000000,
      isPaid: true,
      paidAt: '2026-08-15',
    })),
  };

  // Kỳ 2: Đã xong (Anh Ba Hưng hốt giá 180k)
  const round2: HuiRound = {
    id: 'r2',
    roundNumber: 2,
    date: '2026-09-15',
    status: 'completed',
    bidAmount: 180000,
    winnerMemberId: 'm2',
    winnerMemberName: 'Anh Ba Hưng',
    winnerShareId: 's3',
    commissionAmount: 500000,
    firstRoundDeduction: 0,
    netWinnerPayout: 1 * 1000000 + 10 * 820000 - 500000,
    isPayoutCompleted: true,
    payoutDate: '2026-09-15',
    payments: shares.map((s) => {
      const isWinner = s.id === 's3';
      const wasDead = s.id === 's1';
      return {
        shareId: s.id,
        memberId: s.memberId,
        memberName: s.memberName,
        phone: s.phone,
        shareIndex: s.shareIndex,
        isLive: !wasDead,
        isWinnerThisRound: isWinner,
        amountDue: isWinner ? 0 : wasDead ? 1000000 : 820000,
        isPaid: true,
        paidAt: '2026-09-15',
      };
    }),
  };

  // Kỳ 3: Đang gom tiền! (Chị Lan Tạp Hóa hốt giá 150k)
  const round3Payments: PaymentItem[] = shares.map((s) => {
    const isWinner = s.id === 's6';
    const wasDead = s.id === 's1' || s.id === 's3';
    // Đã đóng một số người, một số chưa đóng để trải nghiệm gom hụi
    const isPaid = isWinner || s.id === 's1' || s.id === 's4' || s.id === 's7' || s.id === 's8';
    return {
      shareId: s.id,
      memberId: s.memberId,
      memberName: s.memberName,
      phone: s.phone,
      shareIndex: s.shareIndex,
      isLive: !wasDead,
      isWinnerThisRound: isWinner,
      amountDue: isWinner ? 0 : wasDead ? 1000000 : 850000,
      isPaid,
      paidAt: isPaid ? '2026-10-15' : undefined,
      note: isPaid ? (isWinner ? 'Chân hốt kỳ 3' : 'Đã đưa tiền mặt') : '',
    };
  });

  const round3: HuiRound = {
    id: 'r3',
    roundNumber: 3,
    date: '2026-10-15',
    status: 'collecting', // Đang gom tiền!
    bidAmount: 150000,
    winnerMemberId: 'm4',
    winnerMemberName: 'Chị Lan Tạp Hóa',
    winnerShareId: 's6',
    commissionAmount: 500000,
    firstRoundDeduction: 0,
    netWinnerPayout: 2 * 1000000 + 9 * 850000 - 500000, // 2 chết (2tr) + 9 sống (7.65tr) - 500k = 9.150.000 đ
    isPayoutCompleted: false,
    payments: round3Payments,
    notes: 'Kỳ tháng 10 - Chị Lan hốt sửa nhà',
  };

  const group1: HuiGroup = {
    id: 'grp-demo-1',
    name: 'Dây 1 Triệu - 12 Phần - Chợ Chiều',
    baseAmount: 1000000,
    totalShares: 12,
    cycle: 'monthly',
    startDate: '2026-08-15',
    commissionDefault: 500000,
    firstPotRule: 'owner_first',
    status: 'active',
    members,
    shares,
    rounds: [round1, round2, round3],
    currentRoundNumber: 3,
    createdAt: '2026-08-10',
  };

  // Dây thứ 2: Hụi tuần 500k
  const group2: HuiGroup = {
    id: 'grp-demo-2',
    name: 'Dây 500k - Hàng Tuần (Thứ 7)',
    baseAmount: 500000,
    totalShares: 10,
    cycle: 'weekly',
    startDate: dateStr,
    commissionDefault: 200000,
    firstPotRule: 'auction',
    status: 'active',
    members: members.slice(0, 7),
    shares: [
      { id: 's2-1', memberId: 'm1', memberName: 'Chị Mai (Trái cây)', shareIndex: 1, isDead: false },
      { id: 's2-2', memberId: 'm2', memberName: 'Anh Ba Hưng', shareIndex: 1, isDead: false },
      { id: 's2-3', memberId: 'm3', memberName: 'Cô Sáu Tiệm Vàng', shareIndex: 1, isDead: false },
      { id: 's2-4', memberId: 'm4', memberName: 'Chị Lan Tạp Hóa', shareIndex: 1, isDead: false },
      { id: 's2-5', memberId: 'm5', memberName: 'Bác Tư Thợ Mộc', shareIndex: 1, isDead: false },
      { id: 's2-6', memberId: 'm6', memberName: 'Em Hạnh Nail', shareIndex: 1, isDead: false },
      { id: 's2-7', memberId: 'm7', memberName: 'Chú Bảy Xe Ôm', shareIndex: 1, isDead: false },
      { id: 's2-8', memberId: 'm8', memberName: 'Chị Thảo Quần Áo', shareIndex: 1, isDead: false },
      { id: 's2-9', memberId: 'm9', memberName: 'Anh Năm Sửa Xe', shareIndex: 1, isDead: false },
      { id: 's2-10', memberId: 'm10', memberName: 'Cô Hồng Cafe', shareIndex: 1, isDead: false },
    ],
    rounds: [],
    currentRoundNumber: 0,
    createdAt: dateStr,
  };

  return [group1, group2];
}

/**
 * Tải danh sách dây hụi
 */
export function loadHuiGroups(): HuiGroup[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GROUPS);
    if (!raw) {
      const sample = getSampleHuiData();
      saveHuiGroups(sample);
      return sample;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (e) {
    console.error('Lỗi đọc dữ liệu hụi:', e);
  }
  return [];
}

/**
 * Lưu danh sách dây hụi
 */
export function saveHuiGroups(groups: HuiGroup[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
  } catch (e) {
    console.error('Lỗi lưu dữ liệu hụi:', e);
  }
}

/**
 * Tải cài đặt ứng dụng
 */
export function loadAppSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Lỗi đọc cài đặt:', e);
  }
  return DEFAULT_SETTINGS;
}

/**
 * Lưu cài đặt ứng dụng
 */
export function saveAppSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Lỗi lưu cài đặt:', e);
  }
}

/**
 * Xuất toàn bộ dữ liệu ra đối tượng JSON để sao lưu
 */
export function exportBackupData(): { timestamp: string; data: { groups: HuiGroup[]; settings: AppSettings } } {
  const groups = loadHuiGroups();
  const settings = loadAppSettings();
  return {
    timestamp: new Date().toISOString(),
    data: {
      groups,
      settings: { ...settings, pinCode: '' }, // Bỏ pinCode để bảo mật nếu chia sẻ file
    },
  };
}

/**
 * Phục hồi dữ liệu từ JSON string
 */
export function importBackupData(jsonString: string): { success: boolean; message: string; count?: number } {
  try {
    const parsed = JSON.parse(jsonString);
    let groupsToImport: HuiGroup[] | null = null;

    if (Array.isArray(parsed)) {
      groupsToImport = parsed;
    } else if (parsed && parsed.data && Array.isArray(parsed.data.groups)) {
      groupsToImport = parsed.data.groups;
      if (parsed.data.settings) {
        const cur = loadAppSettings();
        saveAppSettings({ ...cur, ...parsed.data.settings });
      }
    }

    if (!groupsToImport || !Array.isArray(groupsToImport)) {
      return { success: false, message: 'Định dạng file sao lưu không hợp lệ.' };
    }

    saveHuiGroups(groupsToImport);
    return {
      success: true,
      message: `Đã phục hồi thành công ${groupsToImport.length} dây hụi!`,
      count: groupsToImport.length,
    };
  } catch (e) {
    return { success: false, message: 'Không thể đọc file: Dữ liệu JSON bị lỗi.' };
  }
}

/**
 * Tải xuống file sao lưu về điện thoại
 */
export function downloadBackupFile(): void {
  const backup = exportBackupData();
  const jsonStr = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');

  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
  a.href = url;
  a.download = `SoHui_SaoLuu_${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
