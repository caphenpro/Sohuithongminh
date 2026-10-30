# Sổ Hụi Thông Minh

Ứng dụng quản lý dây hụi, chân hụi, kỳ khui, thu tiền và bàn giao tiền. Dự án hỗ trợ Web/PWA và đóng gói Android bằng Capacitor.

## Nền tảng
- React + TypeScript + Vite.
- IndexedDB lưu dữ liệu ngoại tuyến; tự di trú dữ liệu LocalStorage phiên bản cũ khi khởi động.
- PBKDF2-SHA-256 với salt ngẫu nhiên để lưu mã PIN, không lưu PIN dạng rõ.
- Nhật ký thao tác cơ bản.
- Sao lưu JSON có phiên bản schema và checksum SHA-256.
- Capacitor Android.

## Chạy web
```bash
npm install
npm run dev
```

## Kiểm tra và build
```bash
npm run lint
npm run build
```

## Android
Cần Node.js 22, JDK 21 và Android SDK.
```bash
npm install
npm run build
npx cap add android
npx cap sync android
cd android
./gradlew assembleDebug
```
APK debug: `android/app/build/outputs/apk/debug/app-debug.apk`.

Workflow GitHub Actions **Build Android APK** tự tạo Android project và tải APK dưới dạng artifact. APK debug chỉ phục vụ kiểm thử; phát hành Google Play cần cấu hình ký AAB riêng.

## Dữ liệu và bảo mật
- Dữ liệu hiện được lưu cục bộ trong IndexedDB; không có đồng bộ đám mây.
- PIN được băm PBKDF2; PIN không thay thế mã hóa dữ liệu.
- Sao lưu không chứa PIN. Hãy giữ file sao lưu ở nơi an toàn.
- Khi nâng cấp, ứng dụng cố gắng di trú dữ liệu LocalStorage cũ; không tự chèn dữ liệu mẫu vào sổ mới.

## Lưu ý nghiệp vụ
Công thức thu hụi phụ thuộc thỏa thuận của từng dây. Người dùng cần đối chiếu quy tắc thăm, thảo, kỳ đầu và các khoản khấu trừ trước khi ghi nhận giao dịch thực tế.
