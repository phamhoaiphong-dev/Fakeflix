export const API_CONFIG = {
  PROXY_URL: 'https://api.isme.io.vn',
  USE_PROXY: true,
};

export function getApiUrl(path: string): string {
  const cleanPath = path.replace(/^\/api/, '').replace(/^\/+/, '');
  return `${API_CONFIG.PROXY_URL}/${cleanPath}`;
}
