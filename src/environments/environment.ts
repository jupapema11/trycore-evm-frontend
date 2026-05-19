declare global {
  interface Window {
    __env?: {
      apiUrl?: string;
    };
  }
}

export const environment = {
  production: typeof window !== 'undefined' && window.location.hostname !== 'localhost',
  apiUrl:
    (typeof window !== 'undefined' && window.__env?.apiUrl) ||
    'https://localhost:44391/api'
};
