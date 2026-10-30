/**
 * Các hàm tiện ích định dạng tiền tệ và ngày tháng tiếng Việt
 */

import { HuiCycle } from '../types/hui';

/**
 * Định dạng tiền tệ VND đầy đủ: 1.000.000 đ
 */
export function formatVND(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '0 đ';
  return new Intl.NumberFormat('vi-VN', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(amount) + ' đ';
}

/**
 * Định dạng tiền tệ ngắn gọn: 1 triệu, 500k, 2.5 tr
 */
export function formatCompactVND(amount: number): string {
  if (isNaN(amount) || amount === 0) return '0 đ';
  if (amount >= 1_000_000_000) {
    const val = amount / 1_000_000_000;
    return `${Number.isInteger(val) ? val : val.toFixed(1)} tỷ`;
  }
  if (amount >= 1_000_000) {
    const val = amount / 1_000_000;
    return `${Number.isInteger(val) ? val : val.toFixed(1)} tr`;
  }
  if (amount >= 1_000) {
    const val = amount / 1_000;
    return `${Number.isInteger(val) ? val : val.toFixed(0)}k`;
  }
  return `${amount} đ`;
}

/**
 * Định dạng ngày YYYY-MM-DD -> DD/MM/YYYY
 */
export function formatDateVN(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const [year, month, day] = dateStr.split('T')[0].split('-');
    if (day && month && year) {
      return `${day}/${month}/${year}`;
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    }
  } catch {
    // fallback
  }
  return dateStr;
}

/**
 * Lấy nhãn chu kỳ hụi
 */
export function getCycleLabel(cycle: HuiCycle): string {
  switch (cycle) {
    case 'daily':
      return 'Mỗi ngày (Hụi ngày)';
    case 'weekly':
      return 'Hàng tuần (Hụi tuần)';
    case 'biweekly':
      return '15 ngày (Hụi nửa tháng)';
    case 'monthly':
      return 'Hàng tháng (Hụi tháng)';
    default:
      return 'Chu kỳ';
  }
}

export function getShortCycleLabel(cycle: HuiCycle): string {
  switch (cycle) {
    case 'daily':
      return 'Ngày';
    case 'weekly':
      return 'Tuần';
    case 'biweekly':
      return '15 ngày';
    case 'monthly':
      return 'Tháng';
    default:
      return '';
  }
}

/**
 * Chuyển đổi input chuỗi số (có dấu phẩy, chấm) thành số nguyên
 */
export function parseNumberInput(input: string | number): number {
  if (typeof input === 'number') return Math.max(0, input);
  if (!input) return 0;
  // Loại bỏ ký tự không phải số
  const clean = input.toString().replace(/[^\d]/g, '');
  const parsed = parseInt(clean, 10);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Lấy ngày hôm nay định dạng YYYY-MM-DD
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
