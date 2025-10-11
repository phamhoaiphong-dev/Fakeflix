// src/pages/HomePage.tsx
import { useEffect, useState } from "react";
import HeroSection from "src/components/HeroSection";
import SliderRowForGenre from "src/components/SliderRowForGenre";
import { fetchTrending, fetchTopRated, fetchTVShows, fetchAnime, fetchByCountry } from "src/services/netflixService";

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<
    { title: string; movies: any[] }[]
  >([]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [trending, topRated, tvShows, anime, korean, usa] = await Promise.all([
        fetchTrending(),
        fetchTopRated(),
        fetchTVShows(),
        fetchAnime(),
        fetchByCountry("han-quoc"),
        fetchByCountry("au-my"),
      ]);


      setRows([
        { title: "Trending Now", movies: trending || [] },
        { title: "Made in Korea", movies: korean || [] },
        { title: "Made in GloBal", movies: usa || [] },
        { title: "Top Rated", movies: topRated || [] },
        { title: "TV Shows", movies: tvShows || [] },
        { title: "Anime", movies: anime || [] },
      ]);

      setLoading(false);
    }
    loadData();
  }, []);


  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const trendingRow = rows.find((r) => r.title === "Trending Now");

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section: random movie trong trending */}
      {trendingRow && trendingRow.movies.length > 0 && (
        <div className="netflix-hero">
          <HeroSection movie={trendingRow.movies[Math.floor(Math.random() * trendingRow.movies.length)]} />
        </div>
      )}

      {/* Render rows theo config */}
      <div className="netflix-container space-y-8 py-6">
        {rows.map((row) => (
          <SliderRowForGenre key={row.title} title={row.title} movies={row.movies} />
        ))}
      </div>
    </div>
  );
}
