// ==========================
// Common Types (re used )
// ==========================

import {
  KKPhimMovie,
  KKPhimCategory,
  KKPhimCountry,
} from "src/types/KKPhim";

// Media type enum (mapping API type_list)
export enum MEDIA_TYPE {
  PhimBo = "phim-bo",
  PhimLe = "phim-le",
  TvShows = "tv-shows",
  HoatHinh = "hoat-hinh",
  PhimVietsub = "phim-vietsub",
  PhimThuyetMinh = "phim-thuyet-minh",
  PhimLongTieng = "phim-long-tieng",
}

// Dùng lại type gốc từ KKPhim
export type KKCategory = KKPhimCategory;
export type KKCountry = KKPhimCountry;

// Quality / Language chuẩn
export type KKQuality = "HD" | "FHD" | "CAM" | "SD";
export type KKLanguage = "Vietsub" | "Thuyết Minh" | "Lồng Tiếng";

// Pagination chung
export type PaginatedResult = {
  page: number;
  total_pages: number;
  total_results: number;
};

export type PaginatedMovieResult = PaginatedResult & {
  results: KKPhimMovie[];
};

// KKPhim pagination structure
export type KKPagination = {
  totalItems: number;
  totalItemsPerPage: number;
  currentPage: number;
  pageRanges: number;
};

// Convert KKPhim pagination sang common format
export const convertKKPaginationToCommon = (
  kkPagination: KKPagination
): PaginatedResult => ({
  page: kkPagination.currentPage,
  total_pages: Math.ceil(
    kkPagination.totalItems / kkPagination.totalItemsPerPage
  ),
  total_results: kkPagination.totalItems,
});

// Search/Filter parameters chung
export type SortField = "modified.time" | "_id" | "year";
export type SortType = "desc" | "asc";
export type SortLang = "vietsub" | "thuyet-minh" | "long-tieng";

export interface BaseFilterParams {
  page?: number;
  sort_field?: SortField;
  sort_type?: SortType;
  sort_lang?: SortLang;
  category?: string;
  country?: string;
  year?: number;
  limit?: number; // max 64
}

export interface CommonSearchParams extends BaseFilterParams {
  keyword: string;
}

// Movie status cho KKPhim
export type MovieStatus = "completed" | "ongoing" | "trailer";

// Episode info chung
export type EpisodeInfo = {
  current: string; // ví dụ: "Hoàn Tất (10/10)"
  total: string;   // ví dụ: "10"
};
