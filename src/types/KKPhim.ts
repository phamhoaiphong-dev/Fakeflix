// ==========================
// KKPhim API Types (chuẩn)
// ==========================

export interface KKPhimCategory {
  _id: string;
  name: string;
  slug: string;
}

export interface KKPhimCountry {
  _id: string;
  name: string;
  slug: string;
}

export interface KKPhimTMDB {
  type: string;       
  id: string;
  season?: number;
  vote_average: number;
  vote_count: number;
}

export interface KKPhimIMDB {
  id: string | null;
}

export interface KKPhimModified {
  time: string; // ISO date
}

export interface KKPhimCreated {
  time: string; // ISO date
}

// =============== Movie Item (list) ===============
export interface KKPhimMovie {
  _id: string;
  name: string;
  slug: string;
  origin_name?: string;
  type?: string;
  poster_url: string;
  thumb_url: string;
  backdrop_url?: string;
  sub_docquyen?: boolean;
  time?: string;
  episode_current?: string;
  episode_total?: string;
  quality?: string;
  lang?: string;
  year: number;

  tmdb?: KKPhimTMDB;
  imdb?: KKPhimIMDB;
  created?: KKPhimCreated;
  modified?: KKPhimModified;

  category: KKPhimCategory[];
  country: KKPhimCountry[];
}

// =============== Movie Detail ===============
export interface KKPhimDetailResponse {
  status: boolean;
  msg: string;
  movie: {
    _id: string;
    name: string;
    slug: string;
    origin_name: string;
    backdrop_url: string;
    poster_url: string;
    thumb_url: string;
    content: string;
    type: string;
    status: string;
    year: number;
    actor: string[];
    director: string[];
    category: KKPhimCategory[];
    country: KKPhimCountry[];
    time: string;
    episode_current: string;
    episode_total: string;
    quality: string;
    lang: string;
    notify: string;
    showtimes: string;
    trailer_url: string;
    created: KKPhimCreated;
    modified: KKPhimModified;
    tmdb?: {
      id?: number;
      season?: number;
    };
    seasons?: any[];
    related_seasons?: any[];
    current_season?: number;
  };
  episodes: {
    server_name: string;
    server_data: {
      name: string;
      slug: string;
      filename: string;
      link_embed: string;
      link_m3u8: string;
    }[];
  }[];
}

// =============== List Response (Danh sách / V1 API) ===============
export interface KKPhimListResponse {
  status: boolean;
  msg: string;
  data: {
    seoOnPage: {
      og_type: string;
      titleHead: string;
      seoSchema: any;
      og_image: string[];
    };
    breadCrumb: {
      name: string;
      slug?: string;
      isCurrent?: boolean;
    }[];
    titlePage: string;
    items: KKPhimMovie[];
    params: {
      type_slug: string;
      filterCategory: string[];
      filterCountry: string[];
      filterYear: string;
      filterType: string;
      sortField: string;
      sortType: string;
      pagination: {
        totalItems: number;
        totalItemsPerPage: number;
        currentPage: number;
        pageRanges: number;
      };
    };
  };
}

// =============== Search Response ===============
// KKPhimSearchResponse
export interface KKPhimSearchResponse {
  status: boolean;
  msg: string;
  data: {
    seoOnPage: {
      og_type: string;  
      titleHead: string;
      seoSchema: any;
      og_image: string[] | null; // vì JSON có og_image: null
    };
    breadCrumb: {
      name: string;
      slug?: string;
      isCurrent?: boolean;
      position?: number; // vì JSON có position
    }[];
    titlePage: string;
    items: KKPhimMovie[] | null; // <-- cho phép null
    params: {
      type_slug: string;
      keyword: string;
      filterCategory: string[];
      filterCountry: string[];
      filterYear: string | string[]; // JSON có filterYear là array
      filterType: string[];
      sortField: string;
      sortType: string;
      pagination: {
        totalItems: number;
        totalItemsPerPage: number;
        currentPage: number;
        totalPages?: number; // JSON có totalPages
      };
    };
  };
}


// =============== Categories Response ===============
export interface KKPhimCategoriesResponse {
  status: boolean;
  msg: string;
  data: {
    seoOnPage: any;
    breadCrumb: {
      name: string;
      slug?: string;
      isCurrent?: boolean;
    }[];
    titlePage: string;
    items: KKPhimCategory[];
  };
}

// =============== Countries Response ===============
export interface KKPhimCountriesResponse {
  status: boolean;
  msg: string;
  data: {
    seoOnPage: any;
    breadCrumb: {
      name: string;
      slug?: string;
      isCurrent?: boolean;
    }[];
    titlePage: string;
    items: KKPhimCountry[];
  };
}

export interface KKPhimEpisode {
  server_name: string;
  server_data: {
    name: string;
    slug?: string;
    filename?: string;
    link_embed?: string;
    link_m3u8?: string;
  }[];
}

// =============== Request Params ===============
export interface MovieListParams {
  page?: number;
  sort_field?: 'modified.time' | '_id' | 'year';
  sort_type?: 'desc' | 'asc';
  sort_lang?: 'vietsub' | 'thuyet-minh' | 'long-tieng';
  category?: string;
  country?: string;
  year?: number;
  limit?: number; 
}

// src/types/KKPhim.ts
export interface KKPhimEpisodesOnly {
  episodes: KKPhimDetailResponse["episodes"];
  slug: string;
  name: string;
  modified: KKPhimDetailResponse["movie"]["modified"];
   movie: KKPhimDetailResponse["movie"]
}


export interface SearchParams extends MovieListParams {
  keyword: string;
}

export type MovieType =
  | 'phim-bo'
  | 'phim-le'
  | 'tv-shows'
  | 'hoat-hinh'
  | 'phim-vietsub'
  | 'phim-thuyet-minh'
  | 'phim-long-tieng';
