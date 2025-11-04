import { useState, useEffect } from "react";
import { Play, Info } from "lucide-react";
import { KKPhimMovie } from "src/types/KKPhim";
import { useNavigate } from "react-router-dom";
import MovieDetailModal from "./watch/MovieDetailOverlay";
import { getApiUrl } from "src/utils/api";

interface HeroSectionProps {
  movie: KKPhimMovie;
}

export default function HeroSection({ movie }: HeroSectionProps) {
  const navigate = useNavigate();
  const [showOverlay, setShowOverlay] = useState(false);
  const [movieDetail, setMovieDetail] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);

    fetch(getApiUrl(`/phim/${movie.slug}`))
      .then(res => res.json())
      .then(data => {
        if (data.status === true && data.movie) {
          setMovieDetail(data);
        } else {
          console.error("Hero Section - Invalid API response:", data);
        }
      })
      .catch(err => {
        console.error("Hero Section - Fetch error:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [movie.slug]);

  const handlePlay = () => navigate(`/watch/${movie.slug}?fullscreen=true`);

  const handleShowDetail = () => {
    console.log("Show Detail clicked, movieDetail:", movieDetail);

    if (!movieDetail) {
      alert("Đang tải thông tin phim...");
      return;
    }

    setShowOverlay(true);
  };

  const handleCloseOverlay = () => setShowOverlay(false);

  const content =
    movieDetail?.movie?.content ||
    movie.origin_name ||
    "Hiện chưa có mô tả cho phim này.";

  return (
    <>
      <div className="relative w-full h-screen md:h-[90vh] overflow-hidden">
        <img
          src={movie.backdrop_url || movie.thumb_url || movie.poster_url}
          alt={movie.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

        <div className="absolute bottom-[15%] left-6 md:left-16 max-w-[90%] md:max-w-2xl text-white space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold drop-shadow-xl">
            {movie.name}
          </h1>
          {movie.origin_name && movie.origin_name !== movie.name && (
            <p className="text-lg md:text-2xl text-gray-300 mt-1 italic drop-shadow-md">
              {movie.origin_name}
            </p>
          )}
          <p className="text-base md:text-lg text-gray-200 drop-shadow-md line-clamp-3">
            {isLoading ? "Đang tải mô tả..." : content}
          </p>

          <div className="flex space-x-3 mt-6">
            <button
              onClick={handlePlay}
              className="flex items-center gap-2 bg-white text-black text-lg font-semibold px-6 py-2 rounded-md hover:bg-gray-200 transition"
            >
              <Play fill="black" size={24} /> Phát
            </button>

            <button
              onClick={handleShowDetail}
              disabled={isLoading}
              className="flex items-center gap-2 bg-gray-700/80 text-white text-lg font-semibold px-6 py-2 rounded-md hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Info size={24} />
              {isLoading ? "Đang tải..." : "Chi tiết"}
            </button>
          </div>
        </div>
      </div>

      {showOverlay && movieDetail && (
        <MovieDetailModal
          movie={movieDetail}
          isOpen={showOverlay}
          onClose={handleCloseOverlay}
        />
      )}
    </>
  );
}