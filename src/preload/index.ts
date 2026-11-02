import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const electronAuth = {
  login: (): Promise<void> => ipcRenderer.invoke('auth:login'),
  logout: (): Promise<void> => ipcRenderer.invoke('auth:logout'),
  getAccessToken: (): Promise<string> => ipcRenderer.invoke('auth:get-access-token'),
  getAccount: (): Promise<{ username: string; name: string } | null> =>
    ipcRenderer.invoke('auth:get-account'),
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', {})
    contextBridge.exposeInMainWorld('electronAuth', electronAuth)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = {}
  // @ts-ignore (define in dts)
  window.electronAuth = electronAuth
}
