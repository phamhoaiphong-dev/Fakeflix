import axios from "axios";
import { API_CONFIG } from "./api";

const api = axios.create({
  baseURL: API_CONFIG.USE_PROXY ? API_CONFIG.PROXY_URL : "https://phimapi.com",
  timeout: 15000,
});

// Optional: Nếu muốn thêm client filter (không bắt buộc)
const ALLOWED_COUNTRIES = ["au-my", "han-quoc", "nhat-ban", "trung-quoc", "thai-lan", "hong-kong"];

api.interceptors.response.use((response) => {
  const filter = (items: any[] = []) =>
    items.filter((movie) => {
      const countries = (movie.country ?? []).map((c: any) => c.slug).filter(Boolean);
      return countries.length === 0 || countries.some((s: string) => ALLOWED_COUNTRIES.includes(s));
    });

  if (Array.isArray(response?.data?.items)) response.data.items = filter(response.data.items);
  if (Array.isArray(response?.data?.data?.items)) response.data.data.items = filter(response.data.data.items);
  if (Array.isArray(response?.data?.data)) response.data.data = filter(response.data.data);

  return response;
});

export default api;