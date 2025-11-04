export const API_CONFIG = {
  PROXY_URL: 'https://api.isme.io.vn',
  USE_PROXY: true,
};

export function getApiUrl(path: string): string {
  // Đảm bảo path luôn có dấu "/" 
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_CONFIG.PROXY_URL}${cleanPath}`;
}
