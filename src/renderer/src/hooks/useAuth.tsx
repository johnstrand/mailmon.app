import { createContext, useContext } from 'react'

export interface AuthAccount {
  username: string
  name: string
}

interface AuthContextValue {
  account: AuthAccount | null
  isAuthenticated: boolean
  login: () => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue>({
  account: null,
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {}
})

export function useAuth(): AuthContextValue {
  return useContext(AuthContext)
}
