/**
 * SỔ HỤI OFFLINE - QUẢN LÝ & GOM HỤI THÔNG MINH
 * Ứng dụng ngoại tuyến 100%, bảo mật tại chỗ bằng PIN, tự động tính toán hụi sống - hụi chết
 */

import React, { useState, useEffect, useMemo } from 'react';
import { HuiGroup, HuiRound, AppSettings } from './types/hui';
import {
  loadHuiGroups,
  saveHuiGroups,
  loadAppSettings,
  saveAppSettings,
} from './utils/storage';
import { PinLockScreen } from './components/PinLockScreen';
import { PinSettingsModal } from './components/PinSettingsModal';
import { BackupRestoreModal } from './components/BackupRestoreModal';
import { CreateHuiModal } from './components/CreateHuiModal';
import { HuiGroupListScreen } from './components/HuiGroupListScreen';
import { HuiDetailScreen } from './components/HuiDetailScreen';
import { PaymentRoundScreen } from './components/PaymentRoundScreen';
import { PWAInstallBanner } from './components/PWAInstallBanner';

export default function App() {
  const [groups, setGroups] = useState<HuiGroup[]>([]);
  const [settings, setSettings] = useState<AppSettings>(loadAppSettings);
  const [isLocked, setIsLocked] = useState<boolean>(false);

  // Điều hướng màn hình
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedRoundId, setSelectedRoundId] = useState<string | null>(null);

  // Trạng thái modal
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showBackupModal, setShowBackupModal] = useState<boolean>(false);
  const [showPinModal, setShowPinModal] = useState<boolean>(false);

  // Tải dữ liệu ban đầu
  useEffect(() => {
    const loadedGroups = loadHuiGroups();
    setGroups(loadedGroups);

    const loadedSettings = loadAppSettings();
    setSettings(loadedSettings);

    if (loadedSettings.pinEnabled && loadedSettings.pinCode) {
      setIsLocked(true);
    }
  }, []);

  // Lưu tự động mỗi khi danh sách dây hụi thay đổi
  const handleUpdateGroups = (newGroups: HuiGroup[]) => {
    setGroups(newGroups);
    saveHuiGroups(newGroups);
  };

  // Cập nhật cài đặt
  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveAppSettings(newSettings);
  };

  // Tìm dây hụi và kỳ đang được chọn
  const selectedGroup = useMemo(() => {
    return groups.find((g) => g.id === selectedGroupId) || null;
  }, [groups, selectedGroupId]);

  const selectedRound = useMemo(() => {
    if (!selectedGroup) return null;
    return selectedGroup.rounds.find((r) => r.id === selectedRoundId) || null;
  }, [selectedGroup, selectedRoundId]);

  // Thu thập danh sách tên con hụi quen thuộc để gợi ý khi tạo dây mới
  const existingMembersPool = useMemo(() => {
    const namesSet = new Set<string>();
    groups.forEach((g) => {
      g.members.forEach((m) => {
        if (m.name.trim()) namesSet.add(m.name.trim());
      });
    });
    return Array.from(namesSet);
  }, [groups]);

  // Hành động thêm dây hụi mới
  const handleSaveNewGroup = (newGroup: HuiGroup) => {
    const updated = [newGroup, ...groups];
    handleUpdateGroups(updated);
    // Mở xem chi tiết dây vừa tạo
    setSelectedGroupId(newGroup.id);
  };

  // Hành động cập nhật một dây hụi (thêm kỳ mới, đổi trạng thái)
  const handleUpdateSingleGroup = (updatedGroup: HuiGroup) => {
    const updated = groups.map((g) => (g.id === updatedGroup.id ? updatedGroup : g));
    handleUpdateGroups(updated);
  };

  // Hành động cập nhật một kỳ hụi (đánh dấu nộp tiền, giao tiền)
  const handleUpdateRound = (updatedRound: HuiRound) => {
    if (!selectedGroup) return;

    const updatedRounds = selectedGroup.rounds.map((r) =>
      r.id === updatedRound.id ? updatedRound : r
    );

    // Kiểm tra xem tất cả các kỳ đã hoàn thành chưa
    const isGroupCompleted =
      updatedRounds.length === selectedGroup.totalShares &&
      updatedRounds.every((r) => r.status === 'completed');

    const updatedGroup: HuiGroup = {
      ...selectedGroup,
      rounds: updatedRounds,
      status: isGroupCompleted ? 'completed' : 'active',
    };

    handleUpdateSingleGroup(updatedGroup);
  };

  // Mở thẳng vào bảng gom tiền của một kỳ
  const handleSelectActiveRound = (group: HuiGroup, round: HuiRound) => {
    setSelectedGroupId(group.id);
    setSelectedRoundId(round.id);
  };

  // Mở khóa ứng dụng thành công
  const handleUnlockSuccess = () => {
    setIsLocked(false);
  };

  // Khóa ứng dụng
  const handleLockApp = () => {
    setIsLocked(true);
  };

  // Nếu đang khóa PIN: Hiển thị màn hình nhập PIN
  if (isLocked && settings.pinEnabled && settings.pinCode) {
    return (
      <PinLockScreen
        correctPin={settings.pinCode}
        onSuccess={handleUnlockSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-200/80 font-sans antialiased text-slate-900 flex justify-center">
      {/* Container chuẩn điện thoại / máy tính bảng */}
      <div className="w-full max-w-2xl min-h-screen bg-slate-100 shadow-2xl relative flex flex-col">
        {/* Banner cài đặt PWA nếu chưa cài */}
        <PWAInstallBanner />

        {/* ĐIỀU HƯỚNG 3 MÀN HÌNH CHÍNH */}
        {selectedGroup && selectedRound ? (
          /* MÀN HÌNH 3: Bảng thu tiền kỳ hiện tại (Quan trọng nhất) */
          <PaymentRoundScreen
            group={selectedGroup}
            round={selectedRound}
            onBack={() => setSelectedRoundId(null)}
            onUpdateRound={handleUpdateRound}
          />
        ) : selectedGroup ? (
          /* MÀN HÌNH 2: Chi tiết Dây Hụi (Quản lý các Kỳ) */
          <HuiDetailScreen
            group={selectedGroup}
            onBack={() => setSelectedGroupId(null)}
            onSelectRound={(round) => setSelectedRoundId(round.id)}
            onUpdateGroup={handleUpdateSingleGroup}
          />
        ) : (
          /* MÀN HÌNH 1: Danh sách Dây Hụi (Trang chủ) */
          <HuiGroupListScreen
            groups={groups}
            settings={settings}
            onSelectGroup={(g) => setSelectedGroupId(g.id)}
            onSelectActiveRound={handleSelectActiveRound}
            onOpenCreateModal={() => setShowCreateModal(true)}
            onOpenBackupModal={() => setShowBackupModal(true)}
            onOpenPinModal={() => setShowPinModal(true)}
            onLockApp={handleLockApp}
          />
        )}

        {/* MODAL TẠO DÂY HỤI MỚI */}
        <CreateHuiModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSaveGroup={handleSaveNewGroup}
          existingMembersPool={existingMembersPool}
        />

        {/* MODAL SAO LƯU & PHỤC HỒI DỮ LIỆU ZALO/THẺ NHỚ */}
        <BackupRestoreModal
          isOpen={showBackupModal}
          onClose={() => setShowBackupModal(false)}
          onDataChanged={() => {
            setGroups(loadHuiGroups());
            setSettings(loadAppSettings());
          }}
        />

        {/* MODAL CÀI ĐẶT MÃ PIN */}
        <PinSettingsModal
          isOpen={showPinModal}
          onClose={() => setShowPinModal(false)}
          settings={settings}
          onSaveSettings={handleUpdateSettings}
        />
      </div>
    </div>
  );
}
