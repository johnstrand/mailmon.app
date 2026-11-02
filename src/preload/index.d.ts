import { ElectronAPI } from '@electron-toolkit/preload'

export interface ElectronAuthAccount {
  username: string;
  name: string;
}

export interface ElectronAuth {
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string>;
  getAccount: () => Promise<ElectronAuthAccount | null>;
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: unknown
    electronAuth: ElectronAuth
  }
}
