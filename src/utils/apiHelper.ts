// src/utils/apiHelper.ts
import axios from "axios";

const api = axios.create({
  baseURL: "https://phimapi.com",
  timeout: 15000,
});

// Giữ interceptor lọc quốc gia
api.interceptors.response.use((response) => {
  if (Array.isArray(response?.data?.items)) {
    response.data.items = filterAllowedCountries(response.data.items);
  }
  if (Array.isArray(response?.data?.data?.items)) {
    response.data.data.items = filterAllowedCountries(response.data.data.items);
  }
  if (Array.isArray(response?.data?.data)) {
    response.data.data = filterAllowedCountries(response.data.data);
  }
  return response;
});

function filterAllowedCountries(items: any[] = []) {
  const ALLOWED_COUNTRIES = [
    "au-my", "han-quoc", "nhat-ban", "phap", "duc",
    "hong-kong", "thai-lan", "uc", "trung-quoc", "dai-loan", "canada"
  ];
  return items.filter((movie) => {
    const countries = movie.country?.map((c: any) => c.slug?.toLowerCase()) || [];
    if (countries.length === 0) return true;
    return countries.some((slug: string) => ALLOWED_COUNTRIES.includes(slug));
  });
}

export default api;