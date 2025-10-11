import axios from "axios";

const BASE_URL = "https://phimapi.com";
const API_V1_LIST = `${BASE_URL}/v1/api/danh-sach`;
const API_V1 = `${BASE_URL}/v1/api`;

// Phim mới cập nhật
export async function fetchTrending(page = 1) {
  const res = await axios.get(`${BASE_URL}/danh-sach/phim-moi-cap-nhat-v3?page=${page}`);
  return res.data.items;
}

// Phim lẻ (Top Rated)
export async function fetchTopRated(page = 1) {
  const res = await axios.get(`${API_V1_LIST}/phim-le`, {
    params: { page, sort_field: "year", sort_type: "desc", limit: 20 },
  });
  return res.data.data.items;
}

// Phim bộ / TV Shows
export async function fetchTVShows(page = 1) {
  const res = await axios.get(`${API_V1_LIST}/tv-shows`, {
    params: { page, sort_field: "_id", sort_type: "asc", limit: 20 },
  });
  return res.data.data.items;
}

 // Anime
export async function fetchAnime(page = 1) {
  const res = await axios.get(`${API_V1_LIST}/hoat-hinh`, {
    params: { page, sort_field: "_id", sort_type: "asc", limit: 20,country: "nhat-ban"},
  });
  return res.data.data.items;
}

// Lấy phim theo thể loại
export async function fetchByGenre(slug: string, page = 1) {
  const res = await axios.get(`${API_V1_LIST}/the-loai/${slug}`, {
    params: { page, sort_field: "_id", sort_type: "asc", limit: 20 },
  });
  return res.data.data.items;
}

// Lấy phim theo quốc gia
export async function fetchByCountry(slug: string, page = 1) {
  const res = await axios.get(`${API_V1}/quoc-gia/${slug}`, {
    params: { page, sort_field: "_id", sort_type: "asc", limit: 20, year: "2025" },
  });
  return res.data.data.items;
}

// Tìm kiếm phim
export async function searchMovies(
  keyword: string,
  page = 1,
  sort_field = "_id",
  sort_type = "asc",
  sort_lang = "",
  category = "",
  country = "",
  year = "",
  limit = 20
) {
  try {
    const res = await axios.get(`${API_V1}/tim-kiem`, {
      params: { keyword, page, sort_field, sort_type, sort_lang, category, country, year, limit },
    });
    return res.data?.data?.items || []; 
  } catch (err) {
    console.error("SearchMovies error:", err);
    return []; 
  }
}
