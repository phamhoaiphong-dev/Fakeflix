// src/services/movieService.ts
import {
  KKPhimMovie,
  KKPhimDetailResponse,
  KKPhimListResponse,
  KKPhimSearchResponse,
  KKPhimCategoriesResponse,
  KKPhimCountriesResponse,
  MovieListParams,
  SearchParams,
} from "../types/KKPhim";

class KKPhimAPI {
  private baseURL = "https://phimapi.com";

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    try {
      return await response.json();
    } catch {
      throw new Error("Failed to parse JSON response");
    }
  }

  private buildURL(endpoint: string, params?: Record<string, any>): string {
    const url = new URL(endpoint, this.baseURL);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    return url.toString();
  }

  // ===== DANH SÁCH TỔNG QUÁT =====
  async getMoviesByApiString(apiString: string, params?: MovieListParams): Promise<KKPhimListResponse> {
    // phim-moi-cap-nhat dùng endpoint riêng
    const isNewMovies = apiString.startsWith("phim-moi");
    const endpoint = isNewMovies
      ? `/danh-sach/${apiString}`
      : `/v1/api/danh-sach/${apiString}`;
    const url = this.buildURL(endpoint, params);

    const res = await fetch(url);
    return this.handleResponse<KKPhimListResponse>(res);
  }

  // ===== CHI TIẾT PHIM =====
  async getMovieDetail(slug: string): Promise<KKPhimDetailResponse> {
    const res = await fetch(`${this.baseURL}/phim/${slug}`);
    return this.handleResponse<KKPhimDetailResponse>(res);
  }

  async searchMovies(params: SearchParams): Promise<KKPhimSearchResponse> {
    const url = this.buildURL("/v1/api/tim-kiem", params);
    const res = await fetch(url);
    return this.handleResponse<KKPhimSearchResponse>(res);
  }

  async getCategories(): Promise<KKPhimCategoriesResponse> {
    const res = await fetch(`${this.baseURL}/the-loai`);
    return this.handleResponse<KKPhimCategoriesResponse>(res);
  }

  async getCountries(): Promise<KKPhimCountriesResponse> {
    const res = await fetch(`${this.baseURL}/quoc-gia`);
    return this.handleResponse<KKPhimCountriesResponse>(res);
  }

  async getMoviesByCategory(categorySlug: string, params?: Omit<MovieListParams, "category">): Promise<KKPhimListResponse> {
    const url = this.buildURL(`/v1/api/the-loai/${categorySlug}`, params);
    const res = await fetch(url);
    return this.handleResponse<KKPhimListResponse>(res);
  }

  async getMoviesByCountry(countrySlug: string, params?: Omit<MovieListParams, "country">): Promise<KKPhimListResponse> {
    const url = this.buildURL(`/v1/api/quoc-gia/${countrySlug}`, params);
    const res = await fetch(url);
    return this.handleResponse<KKPhimListResponse>(res);
  }

  async getMoviesByYear(year: number, params?: Omit<MovieListParams, "year">): Promise<KKPhimListResponse> {
    const url = this.buildURL(`/v1/api/nam/${year}`, params);
    const res = await fetch(url);
    return this.handleResponse<KKPhimListResponse>(res);
  }

  getWebPImageURL(imageUrl: string): string {
    return this.buildURL("/image.php", { url: imageUrl });
  }
}

// singleton
const kkPhimAPI = new KKPhimAPI();

// ===== EXPORT UTILS =====
const extractItems = (res: KKPhimListResponse | KKPhimSearchResponse | KKPhimMovie[]) => {
  if (Array.isArray(res)) return res;
  return (res as any).items || [];
};

// ===== EXPORT HÀM DÙNG NGOÀI =====
export const getMoviesByApiString = async (apiString: string, params?: MovieListParams) =>
  extractItems(await kkPhimAPI.getMoviesByApiString(apiString, params));

export const getMovieDetail = (slug: string) => kkPhimAPI.getMovieDetail(slug);
export const searchMovies = async (params: SearchParams) =>
  extractItems(await kkPhimAPI.searchMovies(params));
export const getCategories = () => kkPhimAPI.getCategories();
export const getCountries = () => kkPhimAPI.getCountries();
export const getMoviesByCategory = (slug: string, params?: Omit<MovieListParams, "category">) =>
  kkPhimAPI.getMoviesByCategory(slug, params);
export const getMoviesByCountry = (slug: string, params?: Omit<MovieListParams, "country">) =>
  kkPhimAPI.getMoviesByCountry(slug, params);
export const getMoviesByYear = (year: number, params?: Omit<MovieListParams, "year">) =>
  kkPhimAPI.getMoviesByYear(year);
export const getWebPImageURL = (url: string) => kkPhimAPI.getWebPImageURL(url);

export default kkPhimAPI;
