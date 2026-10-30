import React, { useEffect, useMemo, useState } from 'react';
import { HuiGroup, HuiRound, AppSettings } from './types/hui';
import { initializeStorage, loadHuiGroups, saveHuiGroups, loadAppSettings, saveAppSettings, verifyPin } from './utils/storageV2';
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
  const [settings, setSettings] = useState<AppSettings>({ pinEnabled: false, pinCode: '', autoLockMinutes: 5, ownerName: 'Chủ Hụi', ownerPhone: '', fontSize: 'normal' });
  const [isReady, setIsReady] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedRoundId, setSelectedRoundId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      await initializeStorage();
      const [loadedGroups, loadedSettings] = await Promise.all([loadHuiGroups(), loadAppSettings()]);
      if (!active) return;
      setGroups(loadedGroups);
      setSettings(loadedSettings);
      setIsLocked(Boolean(loadedSettings.pinEnabled && loadedSettings.pinCode));
      setIsReady(true);
    })().catch((error) => {
      console.error('Không thể khởi tạo sổ hụi:', error);
      if (active) setIsReady(true);
    });
    return () => { active = false; };
  }, []);

  // Tự khóa khi ứng dụng chuyển nền hoặc hết thời gian không hoạt động.
  useEffect(() => {
    if (!settings.pinEnabled || !isReady || isLocked) return;
    const timeoutMs = Math.max(1, settings.autoLockMinutes || 5) * 60_000;
    let timer = window.setTimeout(() => setIsLocked(true), timeoutMs);
    const reset = () => { window.clearTimeout(timer); timer = window.setTimeout(() => setIsLocked(true), timeoutMs); };
    const onVisibility = () => { if (document.visibilityState === 'hidden') setIsLocked(true); else reset(); };
    ['pointerdown', 'keydown', 'touchstart'].forEach((event) => window.addEventListener(event, reset, { passive: true }));
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.clearTimeout(timer);
      ['pointerdown', 'keydown', 'touchstart'].forEach((event) => window.removeEventListener(event, reset));
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [settings.pinEnabled, settings.autoLockMinutes, isReady, isLocked]);

  const handleUpdateGroups = (newGroups: HuiGroup[]) => {
    setGroups(newGroups);
    void saveHuiGroups(newGroups).catch((error) => console.error('Không thể lưu dữ liệu:', error));
  };
  const handleUpdateSettings = async (newSettings: AppSettings) => {
    const stored = await saveAppSettings(newSettings);
    setSettings(stored);
  };
  const selectedGroup = useMemo(() => groups.find((g) => g.id === selectedGroupId) || null, [groups, selectedGroupId]);
  const selectedRound = useMemo(() => selectedGroup?.rounds.find((r) => r.id === selectedRoundId) || null, [selectedGroup, selectedRoundId]);
  const existingMembersPool = useMemo(
    () => Array.from(new Set(groups.flatMap((g) => g.members.map((m) => m.name.trim()).filter(Boolean)))),
    [groups]
  );

  const handleSaveNewGroup = (newGroup: HuiGroup) => {
    handleUpdateGroups([newGroup, ...groups]);
    setSelectedGroupId(newGroup.id);
  };
  const handleUpdateSingleGroup = (updatedGroup: HuiGroup) => {
    handleUpdateGroups(groups.map((g) => g.id === updatedGroup.id ? updatedGroup : g));
  };
  const handleUpdateRound = (updatedRound: HuiRound) => {
    if (!selectedGroup) return;
    const updatedRounds = selectedGroup.rounds.map((r) => r.id === updatedRound.id ? updatedRound : r);
    const isGroupCompleted = updatedRounds.length === selectedGroup.totalShares && updatedRounds.every((r) => r.status === 'completed');
    handleUpdateSingleGroup({ ...selectedGroup, rounds: updatedRounds, status: isGroupCompleted ? 'completed' : 'active' });
  };
  const refreshData = async () => {
    const [nextGroups, nextSettings] = await Promise.all([loadHuiGroups(), loadAppSettings()]);
    setGroups(nextGroups); setSettings(nextSettings);
  };

  if (!isReady) return <div className="min-h-screen flex items-center justify-center bg-slate-100 text-teal-800 font-semibold">Đang mở sổ hụi an toàn…</div>;
  if (isLocked && settings.pinEnabled && settings.pinCode) {
    return <PinLockScreen verifyPin={(pin) => verifyPin(pin, settings.pinCode)} onSuccess={() => setIsLocked(false)} />;
  }

  return (
    <div className="min-h-screen bg-slate-200/80 font-sans antialiased text-slate-900 flex justify-center">
      <div className="w-full max-w-2xl min-h-screen bg-slate-100 shadow-2xl relative flex flex-col">
        <PWAInstallBanner />
        {selectedGroup && selectedRound ? (
          <PaymentRoundScreen group={selectedGroup} round={selectedRound} onBack={() => setSelectedRoundId(null)} onUpdateRound={handleUpdateRound} />
        ) : selectedGroup ? (
          <HuiDetailScreen group={selectedGroup} onBack={() => setSelectedGroupId(null)} onSelectRound={(round) => setSelectedRoundId(round.id)} onUpdateGroup={handleUpdateSingleGroup} />
        ) : (
          <HuiGroupListScreen groups={groups} settings={settings}
            onSelectGroup={(g) => setSelectedGroupId(g.id)}
            onSelectActiveRound={(group, round) => { setSelectedGroupId(group.id); setSelectedRoundId(round.id); }}
            onOpenCreateModal={() => setShowCreateModal(true)}
            onOpenBackupModal={() => setShowBackupModal(true)}
            onOpenPinModal={() => setShowPinModal(true)}
            onLockApp={() => setIsLocked(true)} />
        )}
        <CreateHuiModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onSaveGroup={handleSaveNewGroup} existingMembersPool={existingMembersPool} />
        <BackupRestoreModal isOpen={showBackupModal} onClose={() => setShowBackupModal(false)} onDataChanged={() => { void refreshData(); }} />
        <PinSettingsModal isOpen={showPinModal} onClose={() => setShowPinModal(false)} settings={settings} onSaveSettings={handleUpdateSettings} />
      </div>
    </div>
  );
}