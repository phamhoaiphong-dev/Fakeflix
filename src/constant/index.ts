import { MEDIA_TYPE } from "src/types/Types";

export const API_ENDPOINT_URL = import.meta.env.VITE_APP_API_ENDPOINT_URL;

export const MAIN_PATH = {
  root: "/",
  browse: "browse",
  tv: "tv",
  movies: "movies",
  new: "new",
  myList: "my-list",
  languages: "browse-by-languages",
  genreExplore: "genre",
  watch: "watch",
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
