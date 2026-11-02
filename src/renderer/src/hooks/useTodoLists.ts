import { useState, useEffect } from 'react'
import { getGraphClient } from '../graphClient'
import { useAuth, type AuthAccount } from './useAuth'

export interface TodoList {
  id: string
  displayName: string
}

interface TodoListsResult {
  lists: TodoList[]
  error: string | null
}

export function useTodoLists(): TodoListsResult & { loading: boolean } {
  const { account } = useAuth()
  const [result, setResult] = useState<(TodoListsResult & { account: AuthAccount }) | null>(null)

  useEffect(() => {
    if (!account) return
    let active = true
    const client = getGraphClient()
    client
      .api('/me/todo/lists')
      .get()
      .then((res) => {
        if (active) setResult({ account, lists: res.value ?? [], error: null })
      })
      .catch((err) => {
        if (active) {
          setResult({
            account,
            lists: [],
            error: err instanceof Error ? err.message : 'Failed to load lists'
          })
        }
      })
    return () => {
      active = false
    }
  }, [account])

  const current = account && result?.account === account ? result : null
  return {
    lists: current?.lists ?? [],
    loading: account !== null && current === null,
    error: current?.error ?? null
  }
}
