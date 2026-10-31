/**
 * Tiện ích xuất văn bản Zalo/Messenger và vẽ hình ảnh Bảng Kê Thu Hụi bằng HTML5 Canvas
 * Chạy 100% Offline trên điện thoại, không cần Internet hay thư viện ngoài
 */

import { HuiGroup, HuiRound } from '../types/hui';
import { formatDateVN, formatVND } from './formatters';
import { Capacitor, registerPlugin } from '@capacitor/core';

/**
 * Tạo nội dung tin nhắn gửi vào nhóm Zalo / Messenger
 */
export function generateZaloShareText(group: HuiGroup, round: HuiRound): string {
  const dateFormatted = formatDateVN(round.date);
  const liveDue = Math.max(0, group.baseAmount - round.bidAmount);
  const deadDue = group.baseAmount;

  const unpaidItems = round.payments.filter((p) => !p.isPaid && !p.isWinnerThisRound);
  const paidItems = round.payments.filter((p) => p.isPaid && !p.isWinnerThisRound);

  let text = `📋 BẢNG THU HỤI - KỲ ${round.roundNumber}/${group.totalShares}\n`;
  text += `🔹 Dây hụi: ${group.name}\n`;
  text += `📅 Ngày khui: ${dateFormatted}\n`;
  text += `🎯 Giá 1 phần: ${formatVND(group.baseAmount)}\n`;
  text += `💰 Giá kêu trúng (thăm): ${formatVND(round.bidAmount)}\n`;
  text += `🏆 Người hốt: ${round.winnerMemberName || 'Chưa xác định'}\n`;
  text += `💵 Tiền người hốt thực nhận: ${formatVND(round.netWinnerPayout)}\n`;
  text += `──────────────────\n`;
  text += `📌 Hụi sống đóng: ${formatVND(liveDue)}/phần\n`;
  text += `📌 Hụi chết đóng: ${formatVND(deadDue)}/phần\n`;
  text += `──────────────────\n`;

  if (unpaidItems.length > 0) {
    text += `🔴 CHƯA ĐÓNG (${unpaidItems.length} phần):\n`;
    unpaidItems.forEach((item, index) => {
      const shareTag = group.shares.filter((s) => s.memberId === item.memberId).length > 1
        ? ` (Chân ${item.shareIndex})`
        : '';
      const typeTag = item.isLive ? 'Sống' : 'Chết';
      text += `${index + 1}. ${item.memberName}${shareTag} [${typeTag}]: ${formatVND(item.amountDue)}\n`;
    });
    text += `──────────────────\n`;
  }

  if (paidItems.length > 0) {
    text += `🟢 ĐÃ ĐÓNG (${paidItems.length} phần):\n`;
    paidItems.forEach((item, index) => {
      const shareTag = group.shares.filter((s) => s.memberId === item.memberId).length > 1
        ? ` (Chân ${item.shareIndex})`
        : '';
      text += `${index + 1}. ${item.memberName}${shareTag}: ${formatVND(item.amountDue)} ✔\n`;
    });
    text += `──────────────────\n`;
  }

  text += `Cả nhà thu xếp đóng tiền sớm để chủ hụi giao đủ cho người hốt nhé! Xin cảm ơn cả nhà! 🙏`;
  return text;
}

/**
 * Vẽ bảng kê thu hụi ra hình ảnh Canvas chất lượng cao và trả về URL ảnh / tải về
 */
export async function generateReceiptImage(
  group: HuiGroup,
  round: HuiRound
): Promise<string> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const scale = 2; // Độ nét cao Retina 2x
  const width = 800 * scale;

  const headerHeight = 290 * scale;
  const rowHeight = 44 * scale;
  const rowsCount = round.payments.length;
  const footerHeight = 160 * scale;
  const totalHeight = headerHeight + rowsCount * rowHeight + footerHeight;

  canvas.width = width;
  canvas.height = totalHeight;
  ctx.scale(scale, scale);

  const logicalWidth = 800;

  // Nền tổng thể
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, logicalWidth, totalHeight / scale);

  // Khung viền và giấy trắng
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(20, 20, logicalWidth - 40, (totalHeight / scale) - 40);

  // Header xanh Teal
  ctx.fillStyle = '#0f766e';
  ctx.fillRect(20, 20, logicalWidth - 40, 110);

  // Tiêu đề App
  ctx.fillStyle = '#5eead4';
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.fillText('SỔ HỤI NGOẠI TUYẾN THÔNG MINH', 40, 48);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.fillText(`BẢNG THU TIỀN KỲ ${round.roundNumber}/${group.totalShares}`, 40, 78);

  ctx.font = '15px system-ui, sans-serif';
  ctx.fillStyle = '#ccfbf1';
  ctx.fillText(`${group.name} · Ngày khui: ${formatDateVN(round.date)}`, 40, 106);

  // Thẻ thông tin người trúng & giá kêu
  ctx.fillStyle = '#f0fdf4';
  ctx.strokeStyle = '#bbf7d0';
  ctx.lineWidth = 1;
  ctx.fillRect(40, 145, logicalWidth - 80, 115);
  ctx.strokeRect(40, 145, logicalWidth - 80, 115);

  ctx.fillStyle = '#166534';
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.fillText(`🏆 Người hốt: ${round.winnerMemberName || 'Chưa xác định'}`, 55, 175);

  ctx.fillStyle = '#374151';
  ctx.font = '14px system-ui, sans-serif';
  ctx.fillText(`Giá kêu trúng (thăm): ${formatVND(round.bidAmount)}`, 55, 202);
  ctx.fillText(`Hụi sống đóng: ${formatVND(Math.max(0, group.baseAmount - round.bidAmount))}`, 55, 226);

  ctx.fillStyle = '#0f766e';
  ctx.font = 'bold 14px system-ui, sans-serif';
  ctx.fillText(`Tiền thảo chủ hụi: ${formatVND(round.commissionAmount)}`, 420, 202);

  ctx.fillStyle = '#b91c1c';
  ctx.font = 'bold 17px system-ui, sans-serif';
  ctx.fillText(`Thực nhận: ${formatVND(round.netWinnerPayout)}`, 420, 235);

  // Tiêu đề bảng danh sách
  const tableTop = 275;
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(40, tableTop, logicalWidth - 80, 36);

  ctx.fillStyle = '#334155';
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.fillText('STT', 55, tableTop + 23);
  ctx.fillText('HỌ TÊN CON HỤI', 110, tableTop + 23);
  ctx.fillText('LOẠI HỤI', 390, tableTop + 23);
  ctx.fillText('SỐ TIỀN PHẢI NỘP', 510, tableTop + 23);
  ctx.fillText('TRẠNG THÁI', 670, tableTop + 23);

  // Từng hàng
  let currentY = tableTop + 36;
  round.payments.forEach((p, idx) => {
    // Màu nền xen kẽ
    ctx.fillStyle = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
    ctx.fillRect(40, currentY, logicalWidth - 80, 44);

    // Kẻ đường mờ
    ctx.strokeStyle = '#f1f5f9';
    ctx.beginPath();
    ctx.moveTo(40, currentY + 44);
    ctx.lineTo(logicalWidth - 40, currentY + 44);
    ctx.stroke();

    // STT
    ctx.fillStyle = '#64748b';
    ctx.font = '13px system-ui, sans-serif';
    ctx.fillText(String(idx + 1), 55, currentY + 27);

    // Tên con hụi
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 14px system-ui, sans-serif';
    const shareIndexTag = group.shares.filter((s) => s.memberId === p.memberId).length > 1
      ? ` (Chân ${p.shareIndex})`
      : '';
    ctx.fillText(`${p.memberName}${shareIndexTag}`, 110, currentY + 27);

    // Loại hụi
    if (p.isWinnerThisRound) {
      ctx.fillStyle = '#16a34a';
      ctx.font = 'bold 13px system-ui, sans-serif';
      ctx.fillText('🏆 HỐT KỲ NÀY', 390, currentY + 27);
    } else if (p.isLive) {
      ctx.fillStyle = '#0284c7';
      ctx.font = '13px system-ui, sans-serif';
      ctx.fillText('Hụi sống', 390, currentY + 27);
    } else {
      ctx.fillStyle = '#9333ea';
      ctx.font = '13px system-ui, sans-serif';
      ctx.fillText('Hụi chết', 390, currentY + 27);
    }

    // Số tiền
    ctx.fillStyle = p.isWinnerThisRound ? '#94a3b8' : '#0f172a';
    ctx.font = 'bold 14px system-ui, sans-serif';
    ctx.fillText(p.isWinnerThisRound ? '0 đ (Trúng)' : formatVND(p.amountDue), 510, currentY + 27);

    // Trạng thái
    if (p.isWinnerThisRound) {
      ctx.fillStyle = '#15803d';
      ctx.font = 'bold 13px system-ui, sans-serif';
      ctx.fillText('✔ Người nhận', 670, currentY + 27);
    } else if (p.isPaid) {
      ctx.fillStyle = '#15803d';
      ctx.font = 'bold 13px system-ui, sans-serif';
      ctx.fillText('✔ Đã đóng', 670, currentY + 27);
    } else {
      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 13px system-ui, sans-serif';
      ctx.fillText('⏳ Chưa nộp', 670, currentY + 27);
    }

    currentY += 44;
  });

  // Footer tổng kết
  const footerY = currentY + 25;
  const unpaidCount = round.payments.filter((p) => !p.isPaid && !p.isWinnerThisRound).length;
  const paidCount = round.payments.filter((p) => p.isPaid && !p.isWinnerThisRound).length;
  const totalAmount = round.payments.reduce((acc, cur) => cur.isWinnerThisRound ? acc : acc + cur.amountDue, 0);
  const collectedAmount = round.payments.reduce((acc, cur) => cur.isPaid && !cur.isWinnerThisRound ? acc + cur.amountDue : acc, 0);

  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(40, footerY, logicalWidth - 80, 80);

  ctx.fillStyle = '#334155';
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillText(`Tổng phần cần thu: ${paidCount + unpaidCount} phần · Đã thu: ${paidCount} phần · Còn thiếu: ${unpaidCount} phần`, 60, footerY + 32);

  ctx.fillStyle = '#0f766e';
  ctx.font = 'bold 16px system-ui, sans-serif';
  ctx.fillText(`Tiến độ thu: ${formatVND(collectedAmount)} / ${formatVND(totalAmount)} (${Math.round((collectedAmount / (totalAmount || 1)) * 100)}%)`, 60, footerY + 60);

  return canvas.toDataURL('image/png');
}

/**
 * Native Android export bridge. Android handles Downloads through MediaStore and
 * sharing through ACTION_SEND + FileProvider, so no broad storage permission is needed.
 */

interface ReceiptExportPlugin {
  saveToDownloads(options: { base64: string; fileName: string }): Promise<{ uri: string }>;
  shareImage(options: { base64: string; fileName: string; title: string; text: string }): Promise<void>;
}

const NativeReceiptExport = registerPlugin<ReceiptExportPlugin>('ReceiptExport');

function receiptFileName(group: HuiGroup, round: HuiRound): string {
  const safeGroupName = group.name.trim().replace(/[^\p{L}\p{N}_-]+/gu, '_').replace(/^_+|_+$/g, '') || 'Day_Hui';
  return `BangThuHui_Ky_${round.roundNumber}_${safeGroupName}.png`;
}

async function generateReceiptBase64(group: HuiGroup, round: HuiRound): Promise<string> {
  const dataUrl = await generateReceiptImage(group, round);
  if (!dataUrl || !dataUrl.startsWith('data:image/png;base64,')) {
    throw new Error('Không thể tạo ảnh bảng kê PNG. Vui lòng thử lại.');
  }
  return dataUrl.substring(dataUrl.indexOf(',') + 1);
}

/** Lưu ảnh trực tiếp vào Download/SoHuiThongMinh trên Android. */
export async function downloadReceiptImageFile(group: HuiGroup, round: HuiRound): Promise<void> {
  const fileName = receiptFileName(group, round);
  const base64 = await generateReceiptBase64(group, round);

  if (Capacitor.isNativePlatform()) {
    await NativeReceiptExport.saveToDownloads({ base64, fileName });
    return;
  }

  const blob = await (await fetch(`data:image/png;base64,${base64}`)).blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

/** Mở bảng chia sẻ Android gốc với tệp PNG đính kèm, tương thích Zalo/Messenger. */
export async function shareReceiptImage(group: HuiGroup, round: HuiRound): Promise<'shared' | 'downloaded'> {
  const fileName = receiptFileName(group, round);
  const base64 = await generateReceiptBase64(group, round);

  if (Capacitor.isNativePlatform()) {
    await NativeReceiptExport.shareImage({
      base64,
      fileName,
      title: `Bảng thu hụi kỳ ${round.roundNumber}`,
      text: `Bảng thu hụi - ${group.name}`,
    });
    return 'shared';
  }

  const blob = await (await fetch(`data:image/png;base64,${base64}`)).blob();
  const file = new File([blob], fileName, { type: 'image/png' });
  if (typeof navigator.share === 'function' && typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
    await navigator.share({ files: [file], title: `Bảng thu hụi kỳ ${round.roundNumber}`, text: `Bảng thu hụi - ${group.name}` });
    return 'shared';
  }
  await downloadReceiptImageFile(group, round);
  return 'downloaded';
}
