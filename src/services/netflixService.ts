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
  MovieType,
} from "../types/KKPhim";
const BASE_URL =
  import.meta.env.MODE === "development"
    ? "https://phimapi.com"
    : "";

const API_V1_LIST = `${BASE_URL}/v1/api/danh-sach`;
const API_V1 = `${BASE_URL}/v1/api`;

const ALLOWED_COUNTRIES = [
  "au-my",       // US - UK
  "han-quoc",    // Hàn Quốc
  "nhat-ban",    // Nhật Bản
  "phap",        // Pháp
  "duc",         // Đức
  "hong-kong",   // Hồng Kông
  "thai-lan",    // Thái Lan
  "uc",          // Úc
  "trung-quoc",  // Trung Quốc
  "dai-loan",    // Đài Loan
  "canada",      // Canada
];
// ==========================================
// CORE MOVIE FETCHING (Netflix Categories)
// ==========================================

/**
 * Phim mới cập nhật (Trending Now)
 * Netflix equivalent: "Trending Now", "New Releases"
 */
export async function fetchTrending(page = 1): Promise<KKPhimMovie[]> {
  try {
    const res = await api.get(`${BASE_URL}/danh-sach/phim-moi-cap-nhat-v3`, {
      params: { page }
    });
    return res.data.items || [];
  } catch (err) {
    console.error("fetchTrending error:", err);
    return [];
  }
}

/**
 * Phim lẻ mới nhất (Top Movies)
 * Netflix equivalent: "Popular Movies", "Top Rated"
 */
export async function fetchTopRatedMovies(page = 1, params?: MovieListParams): Promise<KKPhimMovie[]> {
  try {
    const res = await api.get<KKPhimListResponse>(`${API_V1_LIST}/phim-le`, {
      params: {
        page,
        sort_field: params?.sort_field || "year",
        sort_type: params?.sort_type || "desc",
        sort_lang: params?.sort_lang,
        category: params?.category,
        country: params?.country,
        year: params?.year,
        limit: params?.limit || 20,
      },
    });
    return res.data.data.items || [];
  } catch (err) {
    console.error("fetchTopRatedMovies error:", err);
    return [];
  }
}

/**
 * Phim bộ / TV Shows
 * Netflix equivalent: "TV Shows", "Popular Series"
 */
export async function fetchTVShows(page = 1, params?: MovieListParams): Promise<KKPhimMovie[]> {
  try {
    const res = await api.get<KKPhimListResponse>(`${API_V1_LIST}/tv-shows`, {
      params: {
        page,
        sort_field: params?.sort_field || "modified.time",
        sort_type: params?.sort_type || "desc",
        sort_lang: params?.sort_lang,
        category: params?.category,
        country: params?.country,
        year: params?.year,
        limit: params?.limit || 20,
      },
    });
    return res.data.data.items || [];
  } catch (err) {
    console.error("fetchTVShows error:", err);
    return [];
  }
}

/**
 * Phim bộ đang hot (Trending TV Shows)
 */
export async function fetchTrendingTVShows(page = 1): Promise<KKPhimMovie[]> {
  try {
    const res = await api.get<KKPhimListResponse>(`${API_V1_LIST}/phim-bo`, {
      params: {
        page,
        sort_field: "modified.time",
        sort_type: "desc",
        limit: 20,
      },
    });
    return res.data.data.items || [];
  } catch (err) {
    console.error("fetchTrendingTVShows error:", err);
    return [];
  }
}

/**
 * Anime (Japanese Animation)
 * Netflix equivalent: "Anime"
 */
export async function fetchAnime(page = 1, params?: MovieListParams): Promise<KKPhimMovie[]> {
  try {
    const res = await api.get<KKPhimListResponse>(`${API_V1_LIST}/hoat-hinh`, {
      params: {
        page,
        sort_field: params?.sort_field || "modified.time",
        sort_type: params?.sort_type || "desc",
        country: params?.country || "nhat-ban",
        category: params?.category,
        year: params?.year,
        limit: params?.limit || 20,
      },
    });
    return res.data.data.items || [];
  } catch (err) {
    console.error("fetchAnime error:", err);
    return [];
  }
}

/**
 * Phim Vietsub (Vietnamese Subtitles)
 */
export async function fetchVietsub(page = 1, params?: MovieListParams): Promise<KKPhimMovie[]> {
  try {
    const res = await api.get<KKPhimListResponse>(`${API_V1_LIST}/phim-vietsub`, {
      params: {
        page,
        sort_field: params?.sort_field || "modified.time",
        sort_type: params?.sort_type || "desc",
        category: params?.category,
        country: params?.country,
        year: params?.year,
        limit: params?.limit || 20,
      },
    });
    return res.data.data.items || [];
  } catch (err) {
    console.error("fetchVietsub error:", err);
    return [];
  }
}

/**
 * Phim Thuyết Minh (Dubbed)
 */
export async function fetchThuyetMinh(page = 1, params?: MovieListParams): Promise<KKPhimMovie[]> {
  try {
    const res = await api.get<KKPhimListResponse>(`${API_V1_LIST}/phim-thuyet-minh`, {
      params: {
        page,
        sort_field: params?.sort_field || "modified.time",
        sort_type: params?.sort_type || "desc",
        category: params?.category,
        country: params?.country,
        year: params?.year,
        limit: params?.limit || 20,
      },
    });
    return res.data.data.items || [];
  } catch (err) {
    console.error("fetchThuyetMinh error:", err);
    return [];
  }
}

/**
 * Phim Lồng Tiếng (Voice Over)
 */
export async function fetchLongTieng(page = 1, params?: MovieListParams): Promise<KKPhimMovie[]> {
  try {
    const res = await api.get<KKPhimListResponse>(`${API_V1_LIST}/phim-long-tieng`, {
      params: {
        page,
        sort_field: params?.sort_field || "modified.time",
        sort_type: params?.sort_type || "desc",
        category: params?.category,
        country: params?.country,
        year: params?.year,
        limit: params?.limit || 20,
      },
    });
    return res.data.data.items || [];
  } catch (err) {
    console.error("fetchLongTieng error:", err);
    return [];
  }
}

// ==========================================
// FILTER BY CATEGORY & COUNTRY (SIMPLIFIED - Không combo params)
// ==========================================

/**
 * Lấy phim theo thể loại (Genre-based)
 * Chỉ lọc category, bỏ country để tránh lỗi 500
 */
export async function fetchByGenre(
  slug: string,
  page = 1,
  params?: MovieListParams
): Promise<KKPhimMovie[]> {
  try {
    const res = await api.get<KKPhimListResponse>(`${API_V1_LIST}/phim-le`, {
      params: {
        page,
        sort_field: params?.sort_field || "modified.time",
        sort_type: params?.sort_type || "desc",
        category: slug,
        limit: params?.limit || 20,
      },
    });
    return res.data.data.items || [];
  } catch (err) {
    console.error("fetchByGenre error:", err);
    return [];
  }
}

/**
 * Lấy phim theo quốc gia (Country-based)
 * Chỉ lọc country, bỏ category để tránh lỗi 500
 */
export async function fetchByCountry(
  slug: string,
  page = 1,
  params?: MovieListParams
): Promise<KKPhimMovie[]> {
  try {
    const res = await api.get<KKPhimListResponse>(`${API_V1_LIST}/phim-le`, {
      params: {
        page,
        sort_field: params?.sort_field || "modified.time",
        sort_type: params?.sort_type || "desc",
        country: slug,
        limit: params?.limit || 20,
      },
    });
    return res.data.data.items || [];
  } catch (err) {
    console.error("fetchByCountry error:", err);
    return [];
  }
}

/**
 * Lấy phim theo năm (Year-based)
 */
export async function fetchByYear(
  year: number,
  page = 1,
  params?: MovieListParams
): Promise<KKPhimMovie[]> {
  try {
    const res = await api.get<KKPhimListResponse>(`${API_V1_LIST}/phim-le`, {
      params: {
        page,
        sort_field: params?.sort_field || "modified.time",
        sort_type: params?.sort_type || "desc",
        year,
        limit: params?.limit || 20,
      },
    });
    return res.data.data.items || [];
  } catch (err) {
    console.error("fetchByYear error:", err);
    return [];
  }
}

// ==========================================
// NETFLIX-STYLE COMBINED FILTERS (Client-side filtering)
// ==========================================

/**
 * Phim hành động Mỹ (US Action Movies)
 * Lấy phim hành động, sau đó filter Mỹ trên client
 */
export async function fetchUSActionMovies(page = 1): Promise<KKPhimMovie[]> {
  try {
    const actionMovies = await fetchByGenre("hanh-dong", page);

    // Client-side filter for US movies
    return actionMovies.filter((movie) => {
      const countries = movie.country?.map((c: any) => c.slug?.toLowerCase()) || [];
      return countries.includes("au-my") || countries.includes("my");
    });
  } catch (err) {
    console.error("fetchUSActionMovies error:", err);
    return [];
  }
}

/**
 * Phim tâm lý Hàn Quốc (Korean Dramas)
 * Lấy phim Hàn Quốc, sau đó filter tâm lý trên client
 */
export async function fetchKoreanDramas(page = 1): Promise<KKPhimMovie[]> {
  try {
    const koreanMovies = await fetchByCountry("han-quoc", page);

    // Client-side filter for drama/psychology categories
    return koreanMovies.filter((movie) => {
      const categories = movie.category?.map((c: any) => c.slug?.toLowerCase()) || [];
      return categories.includes("tam-ly") || categories.includes("kinh-thanh");
    });
  } catch (err) {
    console.error("fetchKoreanDramas error:", err);
    return [];
  }
}

/**
 * Anime mới nhất (Latest Anime)
 */
export async function fetchLatestAnime(page = 1): Promise<KKPhimMovie[]> {
  return fetchAnime(page, {
    sort_field: "modified.time",
    sort_type: "desc",
  });
}

/**
 * Phim kinh dị châu Á (Asian Horror)
 */
export async function fetchAsianHorror(page = 1): Promise<KKPhimMovie[]> {
  return fetchByGenre("kinh-di", page);
}

// ==========================================
// SEARCH
// ==========================================

/**
 * Tìm kiếm phim với filter đầy đủ
 */
export async function searchMovies(searchParams: SearchParams): Promise<KKPhimMovie[]> {
  try {
    const res = await api.get<KKPhimSearchResponse>(`${API_V1}/tim-kiem`, {
      params: {
        keyword: searchParams.keyword,
        page: searchParams.page || 1,
        sort_field: searchParams.sort_field || "modified.time",
        sort_type: searchParams.sort_type || "desc",
        sort_lang: searchParams.sort_lang,
        category: searchParams.category,
        country: searchParams.country,
        year: searchParams.year,
        limit: searchParams.limit || 20,
      },
    });

    // KKPhimSearchResponse có structure: data.items (có thể null)
    let items = res.data?.data?.items || [];

    // Áp dụng lọc quốc gia
    items = filterAllowedCountries(items);

    return items;
  } catch (err) {
    console.error("searchMovies error:", err);
    return [];
  }
}
// ==========================================
// MOVIE DETAILS
// ==========================================

/**
 * Lấy thông tin chi tiết phim + episodes
 */
export async function fetchMovieDetail(slug: string): Promise<KKPhimDetailResponse | null> {
  try {
    const res = await api.get<KKPhimDetailResponse>(`${BASE_URL}/phim/${slug}`, {
      // BỎ cache: 'no-store'
      // Thay bằng query param để phá cache
      params: {
        _t: Date.now()  // URL luôn khác → không bị 304
      },
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    return res.data;
  } catch (err) {
    console.error("fetchMovieDetail error:", err);
    return null;
  }
}

/**
 * Lấy thông tin phim theo TMDB ID
 */
export async function fetchByTMDB(type: "tv" | "movie", id: string): Promise<KKPhimDetailResponse | null> {
  try {
    const res = await api.get<KKPhimDetailResponse>(`${BASE_URL}/tmdb/${type}/${id}`);
    return res.data;
  } catch (err) {
    console.error("fetchByTMDB error:", err);
    return null;
  }
}

// ==========================================
// METADATA (Categories & Countries)
// ==========================================

/**
 * Lấy danh sách tất cả thể loại
 */
export async function fetchCategories() {
  try {
    const res = await api.get<KKPhimCategoriesResponse>(`${BASE_URL}/the-loai`);
    return res.data.data.items || [];
  } catch (err) {
    console.error("fetchCategories error:", err);
    return [];
  }
}

/**
 * Lấy danh sách tất cả quốc gia
 */
export async function fetchCountries() {
  try {
    const res = await api.get<KKPhimCountriesResponse>(`${BASE_URL}/quoc-gia`);
    return res.data.data.items || [];
  } catch (err) {
    console.error("fetchCountries error:", err);
    return [];
  }
}

// ==========================================
// UTILITY: Convert Image to WebP
// ==========================================

/**
 * Chuyển đổi URL ảnh sang WebP để tối ưu tốc độ
 */
export function convertToWebP(imageUrl: string): string {
  if (!imageUrl) return "";
  return `${BASE_URL}/image.php?url=${encodeURIComponent(imageUrl)}`;
}

// ==========================================
// NETFLIX-STYLE HOMEPAGE DATA
// ==========================================

/**
 * Fetch tất cả data cho homepage kiểu Netflix
 * Returns: {
 *   trending, topMovies, tvShows, anime, 
 *   vietsub, thuyetMinh, koreanDramas, usAction
 * }
 */
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

function filterAllowedCountries(items: any[] = []) {
  return items.filter((movie) => {
    const countries =
      movie.country?.map((c: any) => c.slug?.toLowerCase()) || [];

    if (countries.length === 0) return true;

    return countries.some((slug: string) =>
      ALLOWED_COUNTRIES.includes(slug)
    );
  });
}



api.interceptors.response.use((response) => {
  // Hỗ trợ nhiều response structures
  if (Array.isArray(response?.data?.items)) {
    response.data.items = filterAllowedCountries(response.data.items);
  }
  if (Array.isArray(response?.data?.data?.items)) {
    response.data.data.items = filterAllowedCountries(response.data.data.items);
  }
  // Thêm cho search endpoint nếu có structure khác
  if (Array.isArray(response?.data?.data)) {
    response.data.data = filterAllowedCountries(response.data.data);
  }
  return response;
});