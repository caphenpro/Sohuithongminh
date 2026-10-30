import React, { useEffect, useRef, useState } from 'react';
import { Download, Upload, Copy, Check, RotateCcw, AlertTriangle, X, Shield, FileText } from 'lucide-react';
import { downloadBackupFile, exportBackupData, importBackupData, saveHuiGroups, getAuditLog, type AuditEntry } from '../utils/storageV2';
import { getSampleHuiData } from '../utils/storage';

interface BackupRestoreModalProps { isOpen: boolean; onClose: () => void; onDataChanged: () => void; }
export const BackupRestoreModal: React.FC<BackupRestoreModalProps> = ({ isOpen, onClose, onDataChanged }) => {
  const [copied, setCopied] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [message, setMessage] = useState<{text:string;isError:boolean}|null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [busy, setBusy] = useState(false);
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  useEffect(() => {
    if (isOpen) void getAuditLog().then(setAuditEntries).catch(() => setAuditEntries([]));
  }, [isOpen, message]);
  const inputRef = useRef<HTMLInputElement>(null);
  if (!isOpen) return null;
  const reportError = (error: unknown) => setMessage({ text: error instanceof Error ? error.message : 'Thao tác thất bại.', isError: true });
  const download = async () => { try { setBusy(true); await downloadBackupFile(); setMessage({text:'Đã tạo file sao lưu JSON có kiểm tra SHA-256.',isError:false}); } catch(e) { reportError(e); } finally { setBusy(false); } };
  const copy = async () => { try { const data = await exportBackupData(); await navigator.clipboard.writeText(JSON.stringify(data)); setCopied(true); setMessage({text:'Đã sao chép dữ liệu sao lưu.',isError:false}); window.setTimeout(()=>setCopied(false),2500); } catch(e) { reportError(e); } };
  const restore = async (content: string) => { try { setBusy(true); const result = await importBackupData(content); setMessage({text:result.message,isError:!result.success}); if(result.success) onDataChanged(); } catch(e) { reportError(e); } finally { setBusy(false); } };
  const upload = async (event: React.ChangeEvent<HTMLInputElement>) => { const file=event.target.files?.[0]; if(!file)return; await restore(await file.text()); event.target.value=''; };
  const reset = async () => { try { setBusy(true); await saveHuiGroups(getSampleHuiData()); onDataChanged(); setConfirmReset(false); setMessage({text:'Đã nạp dữ liệu mẫu. Dữ liệu cũ đã bị thay thế; cần có bản sao lưu nếu muốn phục hồi.',isError:false}); } catch(e) { reportError(e); } finally { setBusy(false); } };
  return <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"><div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-5">
    <div className="flex justify-between items-center"><div className="flex gap-3 items-center"><Shield className="text-teal-700"/><div><h2 className="font-bold text-lg">Sao lưu & phục hồi</h2><p className="text-xs text-slate-500">IndexedDB · ngoại tuyến</p></div></div><button onClick={onClose}><X/></button></div>
    {message && <p className={`p-3 rounded-xl text-xs border ${message.isError?'bg-red-50 text-red-700 border-red-200':'bg-emerald-50 text-emerald-800 border-emerald-200'}`}>{message.text}</p>}
    <section className="space-y-3"><h3 className="font-bold text-sm">1. Xuất bản sao</h3><p className="text-xs text-slate-600">PIN không được đưa vào file sao lưu. Hãy lưu file ở nơi riêng tư.</p><div className="grid grid-cols-2 gap-2"><button disabled={busy} onClick={()=>void download()} className="p-3 rounded-xl bg-teal-700 text-white text-xs font-bold"><Download className="inline w-4 h-4 mr-1"/> Tải JSON</button><button onClick={()=>void copy()} className="p-3 rounded-xl bg-slate-800 text-white text-xs font-bold">{copied?<Check className="inline"/>:<Copy className="inline"/>} Sao chép</button></div></section>
    <section className="space-y-3 border-t pt-4"><h3 className="font-bold text-sm">2. Phục hồi bản sao</h3><input ref={inputRef} type="file" accept=".json,application/json" onChange={e=>void upload(e)} className="hidden"/><button disabled={busy} onClick={()=>inputRef.current?.click()} className="w-full p-3 border border-dashed border-teal-600 rounded-xl text-teal-800 text-xs font-semibold"><FileText className="inline mr-2"/>Chọn file JSON</button><textarea value={pasteText} onChange={e=>setPasteText(e.target.value)} rows={3} placeholder="Hoặc dán JSON…" className="w-full p-3 border rounded-xl text-xs font-mono"/><button disabled={busy||!pasteText.trim()} onClick={()=>void restore(pasteText.trim())} className="w-full p-3 bg-teal-700 text-white rounded-xl text-xs font-bold disabled:opacity-50"><Upload className="inline mr-1"/>Phục hồi từ nội dung</button></section>
    <section className="border-t pt-4 space-y-2">
      <h3 className="font-bold text-sm">3. Nhật ký thao tác gần đây</h3>
      <p className="text-xs text-slate-500">Ghi nhận tạo dây, mở kỳ, thu/hoàn tác tiền và bàn giao tiền.</p>
      {auditEntries.length === 0 ? <p className="text-xs text-slate-400">Chưa có thao tác được ghi nhận.</p> : auditEntries.slice(0,12).map((entry,index) => (
        <div key={entry.id ?? entry.at + index} className="flex justify-between gap-3 border-b border-slate-100 py-2 text-xs">
          <div className="min-w-0"><div className="font-semibold text-slate-700">{({
            'group.created':'Tạo dây hụi','round.opened':'Mở kỳ hụi','payment.collected':'Đã thu tiền',
            'payment.reversed':'Hoàn tác thu tiền','payout.completed':'Đã giao tiền hốt',
            'payout.reversed':'Hoàn tác bàn giao','backup.restored':'Phục hồi dữ liệu',
            'migration.localStorage.groups':'Di trú dữ liệu cũ'
          } as Record<string,string>)[entry.action] ?? entry.action}</div>
          <div className="text-slate-500 truncate">{String(entry.details?.groupName ?? entry.details?.memberName ?? entry.details?.winner ?? '')}</div></div>
          <time className="shrink-0 text-slate-400">{new Date(entry.at).toLocaleString('vi-VN')}</time>
        </div>
      ))}
    </section>
    <section className="border-t pt-4"><button onClick={()=>setConfirmReset(true)} className="text-xs text-slate-600"><RotateCcw className="inline mr-1"/>Nạp dữ liệu mẫu</button>{confirmReset&&<div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-3"><p className="text-xs text-amber-900"><AlertTriangle className="inline mr-1"/>Thay thế toàn bộ dây hụi hiện tại. Hãy sao lưu trước.</p><div className="flex gap-2"><button onClick={()=>setConfirmReset(false)} className="flex-1 p-2 border rounded-lg">Hủy</button><button disabled={busy} onClick={()=>void reset()} className="flex-1 p-2 bg-amber-700 text-white rounded-lg">Xác nhận</button></div></div>}</section>
  </div></div>;
};