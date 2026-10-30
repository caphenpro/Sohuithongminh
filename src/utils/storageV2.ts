import type { AppSettings, HuiGroup } from '../types/hui';

const DB_NAME = 'so-hui-offline';
const DB_VERSION = 2;
const GROUPS_KEY = 'groups';
const SETTINGS_KEY = 'settings';
const LEGACY_GROUPS_KEY = 'so_hui_groups_v1';
const LEGACY_SETTINGS_KEY = 'so_hui_settings_v1';

export const DEFAULT_SETTINGS: AppSettings = {
  pinEnabled: false, pinCode: '', autoLockMinutes: 5,
  ownerName: 'Chủ Hụi', ownerPhone: '', fontSize: 'normal',
};

type AuditEntry = { action: string; at: string; details?: Record<string, unknown> };

let databasePromise: Promise<IDBDatabase> | undefined;
function openDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === 'undefined') return Promise.reject(new Error('Thiết bị không hỗ trợ IndexedDB.'));
  if (!databasePromise) databasePromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('records')) db.createObjectStore('records', { keyPath: 'key' });
      if (!db.objectStoreNames.contains('audit')) db.createObjectStore('audit', { keyPath: 'id', autoIncrement: true });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Không thể mở cơ sở dữ liệu.'));
  });
  return databasePromise;
}
function requestValue<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Lỗi cơ sở dữ liệu.'));
  });
}
async function readRecord<T>(key: string): Promise<T | undefined> {
  const db = await openDatabase();
  const tx = db.transaction('records', 'readonly');
  const row = await requestValue(tx.objectStore('records').get(key));
  return row?.value as T | undefined;
}
async function writeRecord(key: string, value: unknown): Promise<void> {
  const db = await openDatabase();
  const tx = db.transaction('records', 'readwrite');
  tx.objectStore('records').put({ key, value });
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('Không thể ghi dữ liệu.'));
    tx.onabort = () => reject(tx.error ?? new Error('Giao dịch bị hủy.'));
  });
}
async function audit(action: string, details?: Record<string, unknown>): Promise<void> {
  const db = await openDatabase();
  const tx = db.transaction('audit', 'readwrite');
  tx.objectStore('audit').add({ action, at: new Date().toISOString(), details } satisfies AuditEntry);
}

const bytesToBase64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));
const base64ToBytes = (value: string) => Uint8Array.from(atob(value), c => c.charCodeAt(0));
async function hashPin(pin: string): Promise<string> {
  if (!globalThis.crypto?.subtle) throw new Error('Cần HTTPS hoặc ứng dụng Android để thiết lập PIN an toàn.');
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(pin), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 210000, hash: 'SHA-256' }, material, 256);
  return `pbkdf2-sha256$210000$${bytesToBase64(salt)}$${bytesToBase64(new Uint8Array(bits))}`;
}
export async function verifyPin(pin: string, stored: string): Promise<boolean> {
  if (!stored) return false;
  if (!stored.startsWith('pbkdf2-sha256$')) return pin === stored; // one-time legacy verification; migration occurs at initialization
  try {
    const [, iterations, saltText, expectedText] = stored.split('$');
    const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(pin), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: base64ToBytes(saltText), iterations: Number(iterations), hash: 'SHA-256' }, material, 256);
    const actual = new Uint8Array(bits), expected = base64ToBytes(expectedText);
    return actual.length === expected.length && actual.every((value, index) => value === expected[index]);
  } catch { return false; }
}

export async function initializeStorage(): Promise<void> {
  const [groups, settings] = await Promise.all([readRecord<HuiGroup[]>(GROUPS_KEY), readRecord<AppSettings>(SETTINGS_KEY)]);
  if (groups === undefined) {
    let legacy: HuiGroup[] = [];
    try { const raw = localStorage.getItem(LEGACY_GROUPS_KEY); if (raw) { const parsed = JSON.parse(raw); if (Array.isArray(parsed)) legacy = parsed; } } catch { /* preserve empty state; invalid legacy data is not overwritten */ }
    await writeRecord(GROUPS_KEY, legacy);
    if (legacy.length) await audit('migration.localStorage.groups', { count: legacy.length });
  }
  if (settings === undefined) {
    let legacy = DEFAULT_SETTINGS;
    try { const raw = localStorage.getItem(LEGACY_SETTINGS_KEY); if (raw) legacy = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }; } catch { /* use defaults */ }
    if (legacy.pinCode && !legacy.pinCode.startsWith('pbkdf2-sha256$')) legacy.pinCode = await hashPin(legacy.pinCode);
    await writeRecord(SETTINGS_KEY, legacy);
    await audit('migration.localStorage.settings');
  }
}
export async function loadHuiGroups(): Promise<HuiGroup[]> {
  await initializeStorage();
  return (await readRecord<HuiGroup[]>(GROUPS_KEY)) ?? [];
}
export async function saveHuiGroups(groups: HuiGroup[]): Promise<void> {
  if (!Array.isArray(groups)) throw new Error('Danh sách dây hụi không hợp lệ.');
  await writeRecord(GROUPS_KEY, groups);
  await audit('groups.saved', { count: groups.length });
}
export async function loadAppSettings(): Promise<AppSettings> {
  await initializeStorage();
  return { ...DEFAULT_SETTINGS, ...(await readRecord<AppSettings>(SETTINGS_KEY)) };
}
export async function saveAppSettings(settings: AppSettings): Promise<AppSettings> {
  const safe = { ...settings };
  if (safe.pinEnabled && safe.pinCode && !safe.pinCode.startsWith('pbkdf2-sha256$')) safe.pinCode = await hashPin(safe.pinCode);
  if (!safe.pinEnabled) safe.pinCode = '';
  await writeRecord(SETTINGS_KEY, safe);
  await audit('settings.saved', { pinEnabled: safe.pinEnabled });
  return safe;
}
export async function getAuditLog(): Promise<AuditEntry[]> {
  const db = await openDatabase();
  const tx = db.transaction('audit', 'readonly');
  return requestValue(tx.objectStore('audit').getAll()) as Promise<AuditEntry[]>;
}
export type BackupPayload = { schemaVersion: 2; createdAt: string; data: { groups: HuiGroup[]; settings: AppSettings }; sha256: string };
async function digest(value: string): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return bytesToBase64(new Uint8Array(hash));
}
export async function exportBackupData(): Promise<BackupPayload> {
  const [groups, settings] = await Promise.all([loadHuiGroups(), loadAppSettings()]);
  const data = { groups, settings: { ...settings, pinCode: '' } };
  const canonical = JSON.stringify(data);
  return { schemaVersion: 2, createdAt: new Date().toISOString(), data, sha256: await digest(canonical) };
}
export async function importBackupData(json: string): Promise<{ success: boolean; message: string; count?: number }> {
  try {
    const parsed = JSON.parse(json);
    const groups = Array.isArray(parsed) ? parsed : parsed?.data?.groups;
    if (!Array.isArray(groups)) return { success: false, message: 'File sao lưu không có danh sách dây hụi hợp lệ.' };
    for (const group of groups) {
      if (!group || typeof group.id !== 'string' || typeof group.name !== 'string' ||
          !Array.isArray(group.members) || !Array.isArray(group.shares) || !Array.isArray(group.rounds) ||
          !Number.isFinite(group.baseAmount) || group.baseAmount <= 0 ||
          !Number.isInteger(group.totalShares) || group.totalShares !== group.shares.length) {
        return { success: false, message: 'Dữ liệu không hợp lệ: kiểm tra ID, số tiền, thành viên và số chân của từng dây.' };
      }
      const ids = group.shares.map((share: { id?: string }) => share.id);
      if (ids.some((id: unknown) => typeof id !== 'string') || new Set(ids).size !== ids.length)
        return { success: false, message: `Dây "${group.name}" có mã chân hụi trùng hoặc thiếu.` };
    }
    if (parsed?.schemaVersion === 2 && parsed.sha256) {
      const expected = await digest(JSON.stringify(parsed.data));
      if (expected !== parsed.sha256) return { success: false, message: 'Kiểm tra SHA-256 thất bại. File có thể đã bị thay đổi hoặc hỏng.' };
    }
    const db = await openDatabase();
    const tx = db.transaction('records', 'readwrite');
    tx.objectStore('records').put({ key: GROUPS_KEY, value: groups });
    if (parsed?.data?.settings) {
      const current = { ...DEFAULT_SETTINGS, ...(await loadAppSettings()), ...parsed.data.settings, pinCode: (await loadAppSettings()).pinCode };
      tx.objectStore('records').put({ key: SETTINGS_KEY, value: current });
    }
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error('Không thể phục hồi dữ liệu.'));
      tx.onabort = () => reject(tx.error ?? new Error('Giao dịch phục hồi bị hủy.'));
    });
    await audit('backup.restored', { count: groups.length });
    return { success: true, message: `Đã phục hồi ${groups.length} dây hụi sau khi kiểm tra dữ liệu.`, count: groups.length };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'File sao lưu không đọc được.' };
  }
}
export async function downloadBackupFile(): Promise<void> {
  const backup = await exportBackupData();
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  const now = new Date();
  anchor.href = url;
  anchor.download = `SoHui_SaoLuu_${now.toISOString().replace(/[:.]/g, '-')}.json`;
  document.body.appendChild(anchor); anchor.click(); anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
