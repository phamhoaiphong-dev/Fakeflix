import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Plus, ThumbsUp, ChevronDown } from "lucide-react";
import { ContinueWatchingMovie, KKPhimMovie } from "src/types/KKPhim";
import { getMovieImage } from "src/utils/imageHelper";
import { handlePlayClick } from "src/utils/playHelper";
import MovieDetailModal from "src/components/watch/MovieDetailOverlay";
import MovieHoverCard from "../MovieHoverCard";
import { useNavigate } from "react-router-dom";

export default function MovieCard({
  movie,
  showProgress = false,
  large = false
}: {
  movie: ContinueWatchingMovie;
  showProgress?: boolean;
  large?: boolean;
}) {
  const progress = movie.progress ?? 0;
  const [isHovered, setIsHovered] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [hoverPosition, setHoverPosition] = useState<"left" | "center" | "right">("center");
  const [movieDetail, setMovieDetail] = useState<any>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isHovered && !movieDetail && !isLoadingDetail) {
      setIsLoadingDetail(true);

      fetch(`https://phimapi.com/phim/${movie.slug}`)
        .then(res => res.json())
        .then(data => {
          if (data.status === true && data.movie) {
            setMovieDetail(data);
          } else {
            console.error("API returned error:", data);
          }
        })
        .catch(err => {
          console.error("Error fetching movie detail:", err);
        })
        .finally(() => {
          setIsLoadingDetail(false);
        });
    }
  }, [isHovered, movie.slug, movieDetail, isLoadingDetail]);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    // Tính toán vị trí
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const windowWidth = window.innerWidth;

      if (centerX < windowWidth * 0.3) setHoverPosition("left");
      else if (centerX > windowWidth * 0.7) setHoverPosition("right");
      else setHoverPosition("center");
    }

    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(true);
    }, 300);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 200);
  };

  const handlePlay = () => {
    if (!movieDetail?.episodes?.[0]?.server_data?.length) {
      alert("Phim này chưa có dữ liệu tập hoặc đang tải...");
      return;
    }

    const firstEpisode = movieDetail.episodes[0].server_data[0];
    navigate(`/watch/${movie.slug}?ep=${firstEpisode.slug}`);


    // Gọi playHelper để điều hướng
    const success = handlePlayClick({
      slug: movie.slug,
      episode: {
        slug: firstEpisode.slug,
        name: firstEpisode.name,
        server_name: firstEpisode.server_name,
      },
    });

    if (!success) {
      alert("Không thể phát phim. Vui lòng thử lại.");
    }
  };

  const handleMoreInfo = () => {
    setShowModal(true);
    setIsHovered(false);
  };

  const getHoverPositionClass = () => {
    return hoverPosition === "left"
      ? "left-0 origin-top-left"
      : hoverPosition === "right"
        ? "right-0 origin-top-right"
        : "left-1/2 -translate-x-1/2 origin-top";
  };

  const detail = movieDetail?.movie || movie;

  return (
    <>
      <div
        ref={cardRef}
        className="flex-shrink-0 w-full max-w-[180px] sm:max-w-[200px] lg:max-w-[220px] group"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ zIndex: isHovered ? 70 : 1 }}
      >
        {/* Poster */}
        <motion.div
          className={`relative rounded-lg overflow-hidden bg-neutral-900 shadow-lg transition-all duration-300
          ${large ? "aspect-[3/4]" : "aspect-[2/3]"}
        `}
          whileHover={{ scale: large ? 1.08 : 1.05 }}
          transition={{ duration: 0.3 }}
        >
          <img
            src={getMovieImage(movie, "poster")}
            alt={movie.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {movie.quality && (
            <div className="absolute top-2 right-2 px-2 py-1 bg-red-600 rounded text-xs font-semibold">
              {movie.quality}
            </div>
          )}

          {/* PROGRESS BAR – CHỈ HIỆN Ở TIẾP TỤC XEM */}
          {showProgress && movie.progress != null && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800/90">
              <div
                className="h-full bg-red-600 transition-all duration-1000 ease-out"
                style={{ width: `${Math.min(movie.progress, 100)}%` }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-red-600 rounded-full border-2 border-black shadow-lg -translate-x-1/2"
                style={{ left: `${Math.min(movie.progress, 100)}%` }}
              />
            </div>
          )}

          {showProgress && progress >= 95 && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-md">
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            </div>
          )}
        </motion.div>

        {/* Hover Preview Card */}
        <AnimatePresence>
          {isHovered && !showModal && (
            <MovieHoverCard
              movie={movie}
              movieDetail={movieDetail}
              isLoading={isLoadingDetail}
              hoverPosition={hoverPosition}
              onPlay={handlePlay}
              onMoreInfo={handleMoreInfo}
              onMouseEnter={() => hoverTimeoutRef.current && clearTimeout(hoverTimeoutRef.current)}
              onMouseLeave={handleMouseLeave}
            />
          )}
        </AnimatePresence>
      </div>

      {showModal && movieDetail && (
        <MovieDetailModal
          movie={movieDetail}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
