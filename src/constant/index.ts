// src/constant/index.ts
import { MEDIA_TYPE } from "src/types/Types";

export const API_ENDPOINT_URL = import.meta.env.VITE_APP_API_ENDPOINT_URL;

export const MAIN_PATH = {
  root: "/",
  browse: "browse",
  series: "phim-bo",
  featurefilm: "phim-le",
  favorites: "favorites-list",
  watchlist: "watchlist",
  myList: "my-list",
  genre: "the-loai",
  watch: "watch",
  country: "quoc-gia",
};

export const ARROW_MAX_WIDTH = 60;

export const COMMON_TITLES = [
  { name: "Popular", apiString: "popular" },
  { name: "Top Rated", apiString: "top_rated" },
  { name: "Now Playing", apiString: "now_playing" },
  { name: "Upcoming", apiString: "upcoming" },
];

export const YOUTUBE_URL = "https://www.youtube.com/watch?v=";
export const APP_BAR_HEIGHT = 70;

export const INITIAL_DETAIL_STATE = {
  id: undefined,
  mediaType: undefined as undefined | MEDIA_TYPE,
  mediaDetail: undefined,
};

export const countries = [
  { slug: 'au-my', name: 'Âu Mỹ' },
  { slug: 'han-quoc', name: 'Hàn Quốc' },
  { slug: 'nhat-ban', name: 'Nhật Bản' },
  { slug: 'trung-quoc', name: 'Trung Quốc' },
  { slug: 'phap', name: 'Pháp' },
  { slug: 'an-do', name: 'Ấn Độ' },
  { slug: 'hong-kong', name: 'Hồng Kông' },
  { slug: 'thai-lan', name: 'Thái Lan' },
  { slug: 'dai-loan', name: 'Đài Loan' },
];

