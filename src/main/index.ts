import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import {
  PublicClientApplication,
  CryptoProvider,
  LogLevel,
} from '@azure/msal-node'
import type { AccountInfo, AuthorizationCodeRequest } from '@azure/msal-node'

// ─── MSAL config ────────────────────────────────────────────────────────────

const CLIENT_ID = 'a2188c90-5fe8-4fbe-9b81-5a8b25fbc311'
const AUTHORITY = 'https://login.microsoftonline.com/119b093f-c16c-48eb-9198-47a87994423b'
const SCOPES = ['Mail.ReadWrite', 'Tasks.ReadWrite']
const REDIRECT_URI = 'http://localhost'

const msalClient = new PublicClientApplication({
  auth: {
    clientId: CLIENT_ID,
    authority: AUTHORITY,
  },
  system: {
    loggerOptions: {
      loggerCallback: () => {},
      piiLoggingEnabled: false,
      logLevel: LogLevel.Warning,
    },
  },
})

const cryptoProvider = new CryptoProvider()

// ─── Auth helpers ────────────────────────────────────────────────────────────

async function getFirstAccount(): Promise<AccountInfo | null> {
  const accounts = await msalClient.getTokenCache().getAllAccounts()
  return accounts.length > 0 ? accounts[0] : null
}

/** Open a popup BrowserWindow for interactive auth (PKCE). Returns when complete. */
async function interactiveLogin(): Promise<void> {
  const { verifier, challenge } = await cryptoProvider.generatePkceCodes()
  const nonce = cryptoProvider.createNewGuid()

  const authUrl = await msalClient.getAuthCodeUrl({
    scopes: SCOPES,
    redirectUri: REDIRECT_URI,
    codeChallenge: challenge,
    codeChallengeMethod: 'S256',
    nonce,
  })

  await new Promise<void>((resolve, reject) => {
    const authWindow = new BrowserWindow({
      width: 520,
      height: 680,
      show: true,
      autoHideMenuBar: true,
      webPreferences: { nodeIntegration: false, contextIsolation: true },
    })

    let handled = false

    const handleAuthRedirect = async (url: string) => {
      if (handled) return
      if (!url.startsWith(REDIRECT_URI)) return
      handled = true

      authWindow.removeAllListeners('closed')
      authWindow.close()

      try {
        const urlObj = new URL(url)
        const code = urlObj.searchParams.get('code')
        if (!code) throw new Error('No auth code in redirect')

        const tokenRequest: AuthorizationCodeRequest = {
          code,
          scopes: SCOPES,
          redirectUri: REDIRECT_URI,
          codeVerifier: verifier,
        }
        await msalClient.acquireTokenByCode(tokenRequest)
        resolve()
      } catch (err) {
        reject(err)
      }
    }

    // Azure AD may redirect via a 302 (will-redirect) or JS navigation (will-navigate)
    authWindow.webContents.on('will-redirect', (_event, url) => {
      handleAuthRedirect(url)
    })

    authWindow.webContents.on('will-navigate', (_event, url) => {
      handleAuthRedirect(url)
    })

    // When nothing is listening on localhost the load fails, but the URL carries the code
    authWindow.webContents.on('did-fail-load', (_event, _errorCode, _errorDesc, validatedURL) => {
      handleAuthRedirect(validatedURL)
    })

    authWindow.on('closed', () => {
      if (!handled) reject(new Error('Auth window closed before completing sign-in'))
    })

    authWindow.loadURL(authUrl)
  })
}

/** Get a valid access token, refreshing silently if possible. */
async function getAccessToken(): Promise<string> {
  const account = await getFirstAccount()
  if (!account) throw new Error('Not signed in')

  const result = await msalClient.acquireTokenSilent({
    scopes: SCOPES,
    account,
  })
  return result.accessToken
}

// ─── IPC handlers ────────────────────────────────────────────────────────────

ipcMain.handle('auth:login', async () => {
  await interactiveLogin()
})

ipcMain.handle('auth:logout', async () => {
  const account = await getFirstAccount()
  if (account) {
    await msalClient.getTokenCache().removeAccount(account)
  }
})

ipcMain.handle('auth:get-access-token', async () => {
  return getAccessToken()
})

ipcMain.handle('auth:get-account', async () => {
  const account = await getFirstAccount()
  if (!account) return null
  return { username: account.username, name: account.name ?? account.username }
})

// ─── Window ──────────────────────────────────────────────────────────────────

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1100,
    height: 720,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.webContents.setZoomFactor(1.5)
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// ─── App lifecycle ────────────────────────────────────────────────────────────

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.mailmon')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
