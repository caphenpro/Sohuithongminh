import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'vn.caphenpro.sohuithongminh',
  appName: 'So Hụi Thông Minh',
  webDir: 'dist',
  bundledWebRuntime: false,
  android: { allowMixedContent: false },
  server: { androidScheme: 'https' },
};

export default config;
