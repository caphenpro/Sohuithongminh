/**
 * Thành phần hỗ trợ cài đặt ứng dụng PWA ngoại tuyến lên màn hình chính điện thoại
 */

import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, Check } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Kiểm tra xem đã cài đặt (standalone) chưa
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    // Nhận diện thiết bị iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(ua);
    setIsIOS(isIOSDevice);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }
  };

  if (isInstalled || dismissed) return null;

  return (
    <>
      <div className="bg-teal-800 text-white px-4 py-2.5 shadow-md flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <Smartphone className="w-4 h-4 text-teal-300 shrink-0" />
          <span className="truncate">
            Cài đặt App lên màn hình để mở nhanh & dùng khi không có mạng!
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {deferredPrompt && (
            <button
              onClick={handleInstallClick}
              className="bg-emerald-400 hover:bg-emerald-300 text-slate-900 font-bold px-3 py-1 rounded-lg flex items-center gap-1 transition"
            >
              <Download className="w-3.5 h-3.5" /> Cài đặt
            </button>
          )}

          {isIOS && !deferredPrompt && (
            <button
              onClick={() => setShowIOSGuide(true)}
              className="bg-teal-700 hover:bg-teal-600 text-white font-semibold px-2.5 py-1 rounded-lg transition"
            >
              Cài vào iPhone
            </button>
          )}

          <button
            onClick={() => setDismissed(true)}
            className="p-1 text-teal-300 hover:text-white"
            title="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Modal hướng dẫn cho iPhone */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-slate-900 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Cài đặt lên iPhone / iPad
            </h3>
            <ol className="text-xs text-slate-600 space-y-2.5 list-decimal pl-4">
              <li>
                Bấm vào nút <strong>Chia sẻ</strong> (biểu tượng hình vuông có mũi tên hướng lên) ở thanh dưới trình duyệt Safari.
              </li>
              <li>
                Cuộn xuống chọn <strong>Thêm vào MH chính (Add to Home Screen)</strong>.
              </li>
              <li>
                Bấm <strong>Thêm (Add)</strong> ở góc trên bên phải màn hình.
              </li>
            </ol>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 bg-teal-600 text-white text-xs font-bold rounded-xl"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}
    </>
  );
};
