import { useState, useEffect } from 'react';
import { getGraphClient } from '../graphClient';
import { useAuth } from './useAuth';

export interface TodoList {
  id: string;
  displayName: string;
}

export function useTodoLists() {
  const { isAuthenticated } = useAuth();

  const [lists, setLists] = useState<TodoList[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    const client = getGraphClient();
    client
      .api('/me/todo/lists')
      .get()
      .then((res) => setLists(res.value ?? []))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load lists'))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  return { lists, loading, error };
}
