// src/components/ContinueWatchingSection.tsx
import { useEffect, useState, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { X, ChevronRight } from "lucide-react";
import { getContinueWatching } from "src/hooks/useHistory";
import { getMovieImage } from "src/utils/imageHelper";
import type { ContinueWatchingMovie } from "src/types/KKPhim";
import { useHistory } from "src/hooks/useHistory";

type HistoryItem = {
  movie_id: string;
  movie_name: string;
  poster_path?: string;
  progress: number;
  current_time: number;
  duration: number;
  episode_slug?: string;
};

function mapToMovieWithProgress(item: HistoryItem): ContinueWatchingMovie {
  return {
    _id: item.movie_id,
    slug: item.movie_id,
    name: item.movie_name,
    origin_name: item.movie_name,
    poster_url: item.poster_path || "",
    thumb_url: item.poster_path || "",
    year: new Date().getFullYear(),
    quality: "HD",
    lang: "Vietsub",
    type: item.episode_slug ? "phim-bo" : "phim-le",
    category: [],
    country: [],
    progress: item.progress,
    current_time: item.current_time,
    duration: item.duration,
    episode_slug: item.episode_slug,
    episode_current: item.episode_slug
      ? `Tập ${item.episode_slug.split("-").pop()}`
      : undefined,
    continueWatchingUrl: item.episode_slug
      ? `/watch/${item.movie_id}?ep=${item.episode_slug}`
      : `/watch/${item.movie_id}`,
  };
}

export default function ContinueWatchingSection() {
  const { user, isLoaded } = useUser();
  const [continueMovies, setContinueMovies] = useState<ContinueWatchingMovie[]>([]);
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoaded || !user?.id) {
      setContinueMovies([]);
      return;
    }

    getContinueWatching(user.id)
      .then((data) => {
        setContinueMovies(data.map(mapToMovieWithProgress));
      })
      .catch((err) => {
        console.error("Lỗi load Continue Watching:", err);
        setContinueMovies([]);
      });
  }, [user?.id, isLoaded]);

  useEffect(() => {
    const handler = () => {
      if (user?.id) {
        getContinueWatching(user.id).then((data) => {
          setContinueMovies(data.map(mapToMovieWithProgress));
        });
      }
    };
    window.addEventListener("historyUpdated", handler);
    return () => window.removeEventListener("historyUpdated", handler);
  }, [user?.id]);

  const handleRemove = async (movieId: string, episodeSlug?: string) => {
    // TODO: Implement remove logic
    setContinueMovies(prev => prev.filter(m =>
      !(m.slug === movieId && m.episode_slug === episodeSlug)
    ));
  };

  if (!isLoaded || !user?.id || continueMovies.length === 0) {
    return null;
  }

  return (
    <div className="mb-12 px-4 sm:px-6 lg:px-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white text-2xl md:text-3xl font-bold">
          Xem tiếp của bạn
        </h2>
        <button
          onClick={() => navigate("/my-list")}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition group"
        >
          <span className="text-sm font-medium">Xem tất cả</span>
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Grid Layout - Khác hoàn toàn với slider */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
        {continueMovies.map((movie) => (
          <motion.div
            key={`${movie.slug}-${movie.episode_slug || "movie"}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative"
          >
            {/* Card Container */}
            <div
              onClick={() => movie.continueWatchingUrl && navigate(movie.continueWatchingUrl)}
              className="relative cursor-pointer rounded-lg overflow-hidden bg-neutral-900 
                         transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:z-10"
            >
              {/* Poster Image */}
              <div className="relative aspect-[2/3]">
                <img
                  src={getMovieImage(movie, "poster")}
                  alt={movie.name}
                  className="w-full h-full object-cover rounded-lg"
                  loading="lazy"
                />

                {/* Gradient + Info + Progress */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent rounded-lg">
                  {/* Nút X */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(movie.slug, movie.episode_slug);
                    }}
                    className="absolute top-2 right-2 p-2 bg-black/70 hover:bg-black rounded-full opacity-0 group-hover:opacity-100 transition z-10"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>

                  {/* Tên phim + tập + progress */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="font-bold text-sm line-clamp-2 leading-tight">
                      {movie.name}
                    </h3>
                    {movie.episode_current && (
                      <p className="text-xs text-gray-300 mt-1 opacity-90">{movie.episode_current}</p>
                    )}

                    {/* Progress bar đẹp lung linh */}
                    <div className="mt-3 h-1.5 bg-gray-700 rounded-full overflow-hidden shadow-inner">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(movie.progress || 0, 100)}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full bg-red-600 rounded-full shadow-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* Đã xem xong */}
                {(movie.progress || 0) >= 95 && (
                  <div className="absolute inset-0 bg-black/90 rounded-lg flex flex-col items-center justify-center gap-3">
                    <svg className="w-20 h-20 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                    <p className="text-xl font-bold">Đã xem xong</p>
                  </div>
                )}
              </div>
            </div>

            {/* Hover Info Card - Optional */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              whileHover={{ opacity: 1, y: 0 }}
              className="absolute top-full left-0 right-0 mt-2 p-3 bg-neutral-900 rounded-lg 
                         shadow-2xl opacity-0 group-hover:opacity-100 transition-all z-30 pointer-events-none"
            >
              <p className="text-white text-sm font-semibold mb-1">{movie.name}</p>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                {movie.quality && <span className="px-2 py-0.5 bg-red-600 rounded text-white">{movie.quality}</span>}
                {movie.year && <span>{movie.year}</span>}
                {movie.episode_current && <span>• {movie.episode_current}</span>}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-600"
                    style={{ width: `${Math.min(movie.progress || 0, 100)}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400">{movie.progress}%</span>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}