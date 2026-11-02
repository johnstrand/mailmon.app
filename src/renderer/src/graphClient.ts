import { Client } from '@microsoft/microsoft-graph-client';

function createAuthProvider() {
  return {
    getAccessToken: async (): Promise<string> => {
      return window.electronAuth.getAccessToken();
    },
  };
}

export function getGraphClient(): Client {
  return Client.initWithMiddleware({
    authProvider: createAuthProvider(),
  });
}

export async function getAccessToken(): Promise<string> {
  return window.electronAuth.getAccessToken();
}
