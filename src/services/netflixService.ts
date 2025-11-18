import api from "../utils/apiHelper";
import type {
  KKPhimMovie,
  KKPhimListResponse,
  KKPhimDetailResponse,
  KKPhimSearchResponse,
  KKPhimCategoriesResponse,
  KKPhimCountriesResponse,
  MovieListParams,
  SearchParams,
} from "../types/KKPhim";
import { getApiUrl } from "../utils/api";

const BASE_URL = "https://phimapi.com";

// Các quốc gia hợp lệ để tránh phim sai dữ liệu
const ALLOWED_COUNTRIES = [
  "au-my",
  "han-quoc",
  "nhat-ban",
  "trung-quoc",
  "phap",      
  "an-do",     
  "hong-kong",
  "thai-lan",
  "dai-loan",  
] as const;

// ==========================================
// REUSABLE LIST FETCHER
// ==========================================

type ListType =
  | "phim-le"
  | "phim-bo"
  | "tv-shows"
  | "hoat-hinh"
  | "phim-vietsub"
  | "phim-thuyet-minh"
  | "phim-long-tieng";

async function fetchList(
  type: ListType,
  page = 1,
  params: Partial<MovieListParams & { limit?: number }> = {}
): Promise<KKPhimMovie[]> {
  try {
    const country =
      params.country && ALLOWED_COUNTRIES.includes(params.country as any)
        ? params.country
        : undefined;

    const res = await api.get<KKPhimListResponse>(
      getApiUrl(`/v1/api/danh-sach/${type}`),
      {
        params: {
          page,
          sort_field: params.sort_field || "modified.time",
          sort_type: params.sort_type || "desc",
          sort_lang: params.sort_lang,
          category: params.category,
          country,
          year: params.year,
          limit: Math.min(params.limit || 20, 64),
        },
      }
    );

    let items = res.data?.data?.items || [];

    // ✅ Lọc client-side nếu backend trả sai
    if (country) {
      items = items.filter((m) =>
        m.country?.some((c) => c.slug === country)
      );
    }
    if (params.category) {
      items = items.filter((m) =>
        m.category?.some((c) => c.slug === params.category)
      );
    }

    return items;
  } catch (err) {
    console.error(`fetchList(${type}) error:`, err);
    return [];
  }
}

// ==========================================
// CORE FETCHERS
// ==========================================

export async function fetchTrending(page = 1): Promise<KKPhimMovie[]> {
  try {
    const res = await api.get(getApiUrl('/danh-sach/phim-moi-cap-nhat-v3'), { params: { page } });
    return res.data.items || [];
  } catch (err) {
    console.error("fetchTrending error:", err);
    return [];
  }
}

export const fetchTopRatedMovies = (page = 1, params?: MovieListParams) =>
  fetchList("phim-le", page, { ...params, sort_field: "year", sort_type: "desc" });

export const fetchTVShows = (page = 1, params?: MovieListParams) =>
  fetchList("tv-shows", page, params);

export const fetchTrendingTVShows = (page = 1) =>
  fetchList("phim-bo", page, { limit: 20, sort_field: "modified.time", sort_type: "desc" });

export const fetchAnime = (page = 1, params?: MovieListParams) =>
  fetchList("hoat-hinh", page, { ...params, country: "nhat-ban" });

export const fetchVietsub = (page = 1, params?: MovieListParams) =>
  fetchList("phim-vietsub", page, params);

export const fetchThuyetMinh = (page = 1, params?: MovieListParams) =>
  fetchList("phim-thuyet-minh", page, params);

export const fetchLongTieng = (page = 1, params?: MovieListParams) =>
  fetchList("phim-long-tieng", page, params);

// ==========================================
// FILTER BY GENRE / COUNTRY / YEAR
// ==========================================

export const fetchByGenre = (slug: string, page = 1, params?: MovieListParams) =>
  fetchList("phim-le", page, { ...params, category: slug });

export const fetchByCountry = (slug: string, page = 1, params?: MovieListParams) => {
  if (!ALLOWED_COUNTRIES.includes(slug as any)) return Promise.resolve([]);
  return fetchList("phim-le", page, { ...params, country: slug });
};

export const fetchByYear = (year: number, page = 1, params?: MovieListParams) =>
  fetchList("phim-le", page, { ...params, year });

// ==========================================
// NETFLIX-STYLE FILTERS
// ==========================================

export const fetchUSActionMovies = (page = 1) =>
  fetchByGenre("hanh-dong", page, { country: "au-my" });

export const fetchKoreanDramas = (page = 1) =>
  fetchByCountry("han-quoc", page, { category: "tam-ly" });

export const fetchLatestAnime = (page = 1) =>
  fetchAnime(page, { sort_field: "modified.time", sort_type: "desc" });

export const fetchAsianHorror = (page = 1) =>
  fetchByGenre("kinh-di", page, {
    country: ["trung-quoc", "nhat-ban", "han-quoc", "thai-lan"].join(","),
  });

// ==========================================
// SEARCH (DÙNG BACKEND FILTER)
// ==========================================

export async function searchMovies(searchParams: SearchParams): Promise<KKPhimMovie[]> {
  try {
    const country =
      searchParams.country && ALLOWED_COUNTRIES.includes(searchParams.country as any)
        ? searchParams.country
        : undefined;

    const res = await api.get<KKPhimSearchResponse>(getApiUrl("/v1/api/tim-kiem"), {
      params: {
        keyword: searchParams.keyword,
        page: searchParams.page || 1,
        sort_field: searchParams.sort_field || "modified.time",
        sort_type: searchParams.sort_type || "desc",
        sort_lang: searchParams.sort_lang,
        category: searchParams.category,
        country,
        year: searchParams.year,
        limit: Math.min(searchParams.limit || 20, 64),
      },
    });

    return res.data?.data?.items || [];
  } catch (err) {
    console.error("searchMovies error:", err);
    return [];
  }
}

// ==========================================
// MOVIE DETAILS
// ==========================================

export async function fetchMovieDetail(slug: string): Promise<KKPhimDetailResponse | null> {
  try {
    const res = await api.get<KKPhimDetailResponse>(getApiUrl(`/phim/${slug}`), {
      params: { _t: Date.now() },
      headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
    });
    return res.data;
  } catch (err) {
    console.error("fetchMovieDetail error:", err);
    return null;
  }
}

export async function fetchByTMDB(
  type: "tv" | "movie",
  id: string
): Promise<KKPhimDetailResponse | null> {
  try {
    const res = await api.get<KKPhimDetailResponse>(getApiUrl(`/tmdb/${type}/${id}`));
    return res.data;
  } catch (err) {
    console.error("fetchByTMDB error:", err);
    return null;
  }
}

// ==========================================
// METADATA
// ==========================================

export async function fetchCategories() {
  try {
    const res = await api.get<KKPhimCategoriesResponse>(getApiUrl("/the-loai"));
    return res.data?.data?.items || [];
  } catch (err) {
    console.error("fetchCategories error:", err);
    return [];
  }
}

export async function fetchCountries() {
  try {
    const res = await api.get<KKPhimCountriesResponse>(getApiUrl("/quoc-gia"));
    return (res.data?.data?.items || []).filter((c: any) =>
      ALLOWED_COUNTRIES.includes(c.slug)
    );
  } catch (err) {
    console.error("fetchCountries error:", err);
    return [];
  }
}

// ==========================================
// UTILITY
// ==========================================

export function convertToWebP(imageUrl: string): string {
  if (!imageUrl) return "";
  return `${BASE_URL}/image.php?url=${encodeURIComponent(imageUrl)}`;
}

// ==========================================
// HOMEPAGE COMBINED FETCH
// ==========================================

export async function fetchNetflixHomepage() {
  try {
    const [
      trending,
      topMovies,
      tvShows,
      anime,
      vietsub,
      thuyetMinh,
      koreanDramas,
      usAction,
    ] = await Promise.all([
      fetchTrending(1),
      fetchTopRatedMovies(1),
      fetchTrendingTVShows(1),
      fetchLatestAnime(1),
      fetchVietsub(1),
      fetchThuyetMinh(1),
      fetchKoreanDramas(1),
      fetchUSActionMovies(1),
    ]);

    return {
      trending,
      topMovies,
      tvShows,
      anime,
      vietsub,
      thuyetMinh,
      koreanDramas,
      usAction,
    };
  } catch (err) {
    console.error("fetchNetflixHomepage error:", err);
    return {
      trending: [],
      topMovies: [],
      tvShows: [],
      anime: [],
      vietsub: [],
      thuyetMinh: [],
      koreanDramas: [],
      usAction: [],
    };
  }
}
