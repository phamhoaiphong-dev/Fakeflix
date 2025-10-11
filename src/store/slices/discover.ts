// src/store/slices/discover.ts
import { kkphimApi } from "src/store/slices/kkphim";
import { MEDIA_TYPE, PaginatedMovieResult } from "src/types/Types";
import { KKPhimDetailResponse, KKPhimEpisodesOnly, KKPhimListResponse } from "src/types/KKPhim";
import { createSlice, isAnyOf } from "@reduxjs/toolkit";

const initialState: Record<string, Record<string, PaginatedMovieResult>> = {};
export const initialItemState: PaginatedMovieResult = {
  page: 0,
  results: [],
  total_pages: 0,
  total_results: 0,
};

const discoverSlice = createSlice({
  name: "discover",
  initialState,
  reducers: {
    setNextPage: (state, action) => {
      const { mediaType, itemKey } = action.payload;
      state[mediaType][itemKey].page += 1;
    },
    initiateItem: (state, action) => {
      const { mediaType, itemKey } = action.payload;
      if (!state[mediaType]) {
        state[mediaType] = {};
      }
      if (!state[mediaType][itemKey]) {
        state[mediaType][itemKey] = { ...initialItemState, results: [] };
      }
    },
  },
  extraReducers(builder) {
    builder.addMatcher(
      isAnyOf(
        extendedApi.endpoints.getVideosByMediaTypeAndCustomGenre.matchFulfilled,
        extendedApi.endpoints.getVideosByMediaTypeAndGenreSlug.matchFulfilled
      ),
      (state, action) => {
        const {
          page,
          results,
          total_pages,
          total_results,
          mediaType,
          itemKey,
        } = action.payload;
        state[mediaType][itemKey].page = page;
        state[mediaType][itemKey].results.push(...results);
        state[mediaType][itemKey].total_pages = total_pages;
        state[mediaType][itemKey].total_results = total_results;
      }
    );
  },
});

export const { setNextPage, initiateItem } = discoverSlice.actions;
export default discoverSlice.reducer;

// =====================
// Extended API endpoints cho discover
// =====================

const extendedApi = kkphimApi.injectEndpoints({
  endpoints: (build) => ({
    // Lấy phim theo thể loại 
    getVideosByMediaTypeAndGenreSlug: build.query<
      PaginatedMovieResult & { mediaType: MEDIA_TYPE; itemKey: string },
      { mediaType: MEDIA_TYPE; genreSlug: string; page: number }
    >({
      query: ({ genreSlug, page }) => ({
        url: `/v1/api/the-loai/${genreSlug}`,
        params: { page },
      }),
      transformResponse: (
        response: KKPhimListResponse,
        _,
        { mediaType, genreSlug }
      ) => ({
        page: response.data.params.pagination.currentPage,
        results: response.data.items,
        total_pages: Math.ceil(
          response.data.params.pagination.totalItems /
          response.data.params.pagination.totalItemsPerPage
        ),
        total_results: response.data.params.pagination.totalItems,
        mediaType,
        itemKey: genreSlug,
      }),
    }),

    // Lấy phim theo loại (phim-bo, phim-le, etc.)
    getVideosByMediaTypeAndCustomGenre: build.query<
      PaginatedMovieResult & { mediaType: MEDIA_TYPE; itemKey: string },
      { mediaType: MEDIA_TYPE; apiString: string; page: number }
    >({
      query: ({ apiString, page }) => ({
        url: `/v1/api/danh-sach/${apiString}`,
        params: { page },
      }),
      transformResponse: (
        response: KKPhimListResponse,
        _,
        { mediaType, apiString }
      ) => ({
        page: response.data.params.pagination.currentPage,
        results: response.data.items,
        total_pages: Math.ceil(
          response.data.params.pagination.totalItems /
          response.data.params.pagination.totalItemsPerPage
        ),
        total_results: response.data.params.pagination.totalItems,
        mediaType,
        itemKey: apiString,
      }),
    }),

    // ✅ Chỉ giữ lại chi tiết phim (đã có cả episodes)
    getMovieDetail: build.query<KKPhimDetailResponse, string>({
  query: (slug) => `/phim/${slug}`,
}),

  }),
});

export const {
  useGetVideosByMediaTypeAndGenreSlugQuery,
  useLazyGetVideosByMediaTypeAndGenreSlugQuery,
  useGetVideosByMediaTypeAndCustomGenreQuery,
  useLazyGetVideosByMediaTypeAndCustomGenreQuery,
  useGetMovieDetailQuery,
  useLazyGetMovieDetailQuery,
} = extendedApi;
