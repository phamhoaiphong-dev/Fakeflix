// src/store/slices/kkphim.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { KKPhimMovie, KKPhimDetailResponse, KKPhimListResponse, SearchParams, MovieListParams } from "src/types/KKPhim";
import { MEDIA_TYPE, PaginatedMovieResult } from "src/types/Types";

export const kkphimApi = createApi({
  reducerPath: "kkphimApi",
  baseQuery: fetchBaseQuery({
    baseUrl: '/api', // ✅ Sử dụng proxy
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  endpoints: (builder) => ({
    // Phim mới cập nhật
    getMovies: builder.query<{ items: KKPhimMovie[]; pagination: any }, number>({
      query: (page = 1) => `danh-sach/phim-moi-cap-nhat?page=${page}`,
    }),

    // Chi tiết phim - endpoint đúng
    getMovieDetail: builder.query<KKPhimDetailResponse, string>({
      query: (slug) => `phim/${slug}`,
    }),

    // Lấy danh sách phim theo loại
    getMoviesByType: builder.query<KKPhimListResponse, { type: string; params?: MovieListParams }>({
      query: ({ type, params = {} }) => ({
        url: `/v1/api/danh-sach/${type}`,
        params: {
          page: 1,
          sort_field: '_id',
          sort_type: 'desc',
          limit: 20,
          ...params
        },
      }),
    }),

    // Tìm kiếm phim
    searchMovies: builder.query<KKPhimListResponse, SearchParams>({
      query: ({ keyword, ...params }) => ({
        url: '/v1/api/tim-kiem',
        params: {
          keyword,
          page: 1,
          sort_field: '_id', 
          sort_type: 'desc',
          limit: 20,
          ...params
        },
      }),
    }),

    // Lấy phim theo thể loại
    getMoviesByCategory: builder.query<KKPhimListResponse, { categorySlug: string; params?: MovieListParams }>({
      query: ({ categorySlug, params = {} }) => ({
        url: `/v1/api/the-loai/${categorySlug}`,
        params: {
          page: 1,
          sort_field: '_id',
          sort_type: 'desc', 
          limit: 20,
          ...params
        },
      }),
    }),

    // Lấy phim theo quốc gia
    getMoviesByCountry: builder.query<KKPhimListResponse, { countrySlug: string; params?: MovieListParams }>({
      query: ({ countrySlug, params = {} }) => ({
        url: `/v1/api/quoc-gia/${countrySlug}`,
        params: {
          page: 1,
          sort_field: '_id',
          sort_type: 'desc',
          limit: 20,
          ...params
        },
      }),
    }),

    // Lấy phim theo năm
    getMoviesByYear: builder.query<KKPhimListResponse, { year: number; params?: MovieListParams }>({
      query: ({ year, params = {} }) => ({
        url: `/v1/api/nam/${year}`,
        params: {
          page: 1,
          sort_field: '_id',
          sort_type: 'desc',
          limit: 20,
          ...params
        },
      }),
    }),

    // Lấy danh sách thể loại
    getCategories: builder.query<any, void>({
      query: () => 'the-loai',
    }),

    // Lấy danh sách quốc gia  
    getCountries: builder.query<any, void>({
      query: () => 'quoc-gia',
    }),
  }),
});

// Export hooks
export const { 
  useGetMoviesQuery,
  useGetMovieDetailQuery,
  useGetMoviesByTypeQuery,
  useSearchMoviesQuery,
  useGetMoviesByCategoryQuery,
  useGetMoviesByCountryQuery,
  useGetMoviesByYearQuery,
  useGetCategoriesQuery,
  useGetCountriesQuery,
  useLazySearchMoviesQuery,
  useLazyGetMoviesByTypeQuery,
} = kkphimApi;

// Extended API cho discover slice
const extendedApi = kkphimApi.injectEndpoints({
  endpoints: (build) => ({
    // Lấy phim theo thể loại (dùng cho discover)
    getVideosByMediaTypeAndGenreSlug: build.query<
      PaginatedMovieResult & { mediaType: MEDIA_TYPE; itemKey: string },
      { mediaType: MEDIA_TYPE; genreSlug: string; page: number }
    >({
      query: ({ genreSlug, page }) => ({
        url: `/v1/api/the-loai/${genreSlug}`,
        params: { page },
      }),
      transformResponse: (response: KKPhimListResponse, _, { mediaType, genreSlug }) => ({
        page: response.data.params.pagination.currentPage,
        results: response.data.items,
        total_pages: Math.ceil(response.data.params.pagination.totalItems / response.data.params.pagination.totalItemsPerPage),
        total_results: response.data.params.pagination.totalItems,
        mediaType,
        itemKey: genreSlug,
      }),
    }),

    // Lấy phim theo loại phim
    getVideosByMediaTypeAndCustomGenre: build.query<
      PaginatedMovieResult & { mediaType: MEDIA_TYPE; itemKey: string },
      { mediaType: MEDIA_TYPE; apiString: string; page: number }
    >({
      query: ({ apiString, page }) => ({
        url: `/v1/api/danh-sach/${apiString}`,
        params: { page },
      }),
      transformResponse: (response: KKPhimListResponse, _, { mediaType, apiString }) => ({
        page: response.data.params.pagination.currentPage,
        results: response.data.items,
        total_pages: Math.ceil(response.data.params.pagination.totalItems / response.data.params.pagination.totalItemsPerPage),
        total_results: response.data.params.pagination.totalItems,
        mediaType,
        itemKey: apiString,
      }),
    }),

    // Lấy chi tiết phim (đã sửa endpoint)
    getAppendedVideos: build.query<any, { slug: string }>({
      query: ({ slug }) => `phim/${slug}`,
      transformResponse: (response: KKPhimDetailResponse) => response.movie,
    }),
  }),
});

export const {
  useGetVideosByMediaTypeAndGenreSlugQuery,
  useLazyGetVideosByMediaTypeAndGenreSlugQuery,
  useGetVideosByMediaTypeAndCustomGenreQuery,
  useLazyGetVideosByMediaTypeAndCustomGenreQuery,
  useGetAppendedVideosQuery,
  useLazyGetAppendedVideosQuery,
} = extendedApi;