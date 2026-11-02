import { useEffect, useState, useCallback } from 'react'
import { AuthContext, type AuthAccount } from '../hooks/useAuth'

export function AuthProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [account, setAccount] = useState<AuthAccount | null>(null)

  useEffect(() => {
    window.electronAuth.getAccount().then((acc) => {
      setAccount(acc)
    })
  }, [])

  const login = useCallback(async () => {
    await window.electronAuth.login()
    const acc = await window.electronAuth.getAccount()
    setAccount(acc)
  }, [])

  const logout = useCallback(async () => {
    await window.electronAuth.logout()
    setAccount(null)
  }, [])

  return (
    <AuthContext.Provider value={{ account, isAuthenticated: account !== null, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
