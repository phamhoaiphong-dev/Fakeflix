// src/pages/HomePage.tsx
import { useEffect, useState } from "react";
import ContinueWatchingSection from "src/components/ContinueWatchingSection";
import HeroSection from "src/components/HeroSection";
import SliderRowForGenre from "src/components/SliderRowForGenre";
import {
  fetchTrending,
  fetchTopRatedMovies,
  fetchTrendingTVShows,
  fetchLatestAnime,
  fetchVietsub,
  fetchThuyetMinh,
  fetchLongTieng,
  fetchKoreanDramas,
  fetchUSActionMovies,
  fetchAsianHorror,
  fetchByCountry,
  fetchByGenre,
} from "src/services/netflixService";

import type { KKPhimMovie } from "src/types/KKPhim";

interface MovieRow {
  title: string;
  movies: KKPhimMovie[];
}

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<MovieRow[]>([]);
  const [heroMovie, setHeroMovie] = useState<KKPhimMovie | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);

      try {
        const [
          trending,
          topMovies,
          tvShows,
          anime,
          vietsub,
          thuyetMinh,
          longTieng,
          koreanDramas,
          usAction,
          asianHorror,
          thaiMovies,
          comedyMovies,
        ] = await Promise.all([
          fetchTrending(1),
          fetchTopRatedMovies(1),
          fetchTrendingTVShows(1),
          fetchLatestAnime(1),
          fetchVietsub(1),
          fetchThuyetMinh(1),
          fetchLongTieng(1),
          fetchKoreanDramas(1),
          fetchUSActionMovies(1),
          fetchAsianHorror(1),
          fetchByCountry("thai-lan", 1),
          fetchByGenre("hai-huoc", 1),
        ]);

        // Dễ dàng thêm/bớt/sắp xếp rows
        const movieRows: MovieRow[] = [
          { title: "Phim Mới Cập Nhật", movies: trending },
          { title: "Phim Lẻ Đánh Giá Cao", movies: topMovies },
          { title: "Phim Bộ Đang Hot", movies: tvShows },
          { title: "Anime Mới Nhất", movies: anime },
          { title: "Phim Vietsub", movies: vietsub },
          { title: "Phim Thuyết Minh", movies: thuyetMinh },
          { title: "Phim Lồng Tiếng", movies: longTieng },
          { title: "Phim Hàn Quốc", movies: koreanDramas },
          { title: "Phim Hành Động Mỹ", movies: usAction },
          { title: "Phim Kinh Dị Châu Á", movies: asianHorror },
          { title: "Phim Thái Lan", movies: thaiMovies },
          { title: "Phim Hài Hước", movies: comedyMovies },
        ];

        // Lọc bỏ rows không có phim
        setRows(movieRows.filter(row => row.movies.length > 0));

        // Chọn phim ngẫu nhiên từ trending làm hero
        if (trending.length > 0) {
          const randomIndex = Math.floor(Math.random() * Math.min(5, trending.length));
          setHeroMovie(trending[randomIndex]);
        }

      } catch (error) {
        console.error("Error loading homepage data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          <div className="text-white text-xl font-medium">Đang tải phim...</div>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-black text-white">
      {heroMovie && (
        <HeroSection movie={heroMovie} />
      )}
      <div className="space-y-12 py-6"> 
        <ContinueWatchingSection />
        <div className="netflix-container space-y-8 py-6">
          {rows.map((row) => (
            <SliderRowForGenre key={row.title} title={row.title} movies={row.movies} />
          ))}
        </div>
      </div>

    </div>
  );

}
