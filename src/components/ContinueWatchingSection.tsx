// src/components/ContinueWatchingSection.tsx
import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { getContinueWatching } from "src/hooks/useHistory";
import type { ContinueWatchingMovie } from "src/types/KKPhim";
import MovieCard from "src/components/watch/MovieCard";
import supabase from "src/utils/supabase";
import toast from "react-hot-toast";

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
  const episodeNum = item.episode_slug?.match(/tap[-_]?0*(\d+)/i)?.[1];
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
    progress: item.progress ?? 0,
    current_time: item.current_time,
    duration: item.duration,
    episode_slug: item.episode_slug,
    episode_current: episodeNum ? `Tập ${episodeNum}` : undefined,
    continueWatchingUrl: item.episode_slug
      ? `/watch/${item.movie_id}?ep=${item.episode_slug}`
      : `/watch/${item.movie_id}`,
  };
}

export default function ContinueWatchingSection() {
  const { user, isLoaded } = useUser();
  const [continueMovies, setContinueMovies] = useState<ContinueWatchingMovie[]>([]);

  useEffect(() => {
    if (!isLoaded || !user?.id) {
      setContinueMovies([]);
      return;
    }

    const load = async () => {
      try {
        const data = await getContinueWatching(user.id);
        setContinueMovies(data.map(mapToMovieWithProgress));
      } catch (err) {
        console.error("Lỗi load Continue Watching:", err);
      }
    };
    load();
  }, [user?.id, isLoaded]);

  useEffect(() => {
    const handler = () => {
      if (user?.id) {
        getContinueWatching(user.id).then(data => {
          setContinueMovies(data.map(mapToMovieWithProgress));
        });
      }
    };
    window.addEventListener("historyUpdated", handler);
    return () => window.removeEventListener("historyUpdated", handler);
  }, [user?.id]);

  const handleRemove = async (movieId: string, episodeSlug?: string) => {
    if (!user?.id) return;

    try {
      let query = supabase
        .from("user_movies")
        .delete()
        .eq("user_id", user.id)
        .eq("movie_id", movieId)
        .eq("relation_type", "history");

      if (episodeSlug) query = query.eq("episode_slug", episodeSlug);
      else query = query.is("episode_slug", null);

      await query;

      setContinueMovies(prev =>
        prev.filter(m => !(m.slug === movieId && m.episode_slug === episodeSlug))
      );

      window.dispatchEvent(new Event("historyUpdated"));
      toast.success("Đã xóa khỏi xem tiếp");
    } catch (error) {
      toast.error("Không thể xóa");
    }
  };

  if (!isLoaded || !user?.id || continueMovies.length === 0) return null;

  return (
    <section className="px-4 sm:px-8 lg:px-12 py-8">
      {/* Tiêu đề đẹp hơn */}
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8 tracking-tight">
        Xem tiếp
      </h2>

      {/* Grid đẹp, responsive chuẩn Netflix */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 sm:gap-6">
        {continueMovies.map((movie) => (
          <MovieCard
            key={`${movie.slug}-${movie.episode_slug || "single"}`}
            movie={movie}
            showProgress={true}
            onRemove={() => handleRemove(movie.slug, movie.episode_slug)}
          />
        ))}
      </div>
    </section>
  );
}