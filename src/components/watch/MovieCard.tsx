import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Plus, ThumbsUp, ChevronDown, X } from "lucide-react";
import { ContinueWatchingMovie, KKPhimMovie } from "src/types/KKPhim";
import { getMovieImage } from "src/utils/imageHelper";
import { handlePlayClick } from "src/utils/playHelper";
import MovieDetailModal from "src/components/watch/MovieDetailOverlay";
import MovieHoverCard from "../MovieHoverCard";
import { useNavigate } from "react-router-dom";

export default function MovieCard({
  movie,
  showProgress = false,
  large = false,
  onRemove,
}: {
  movie: ContinueWatchingMovie;
  showProgress?: boolean;
  large?: boolean;
  onRemove?: () => void;
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
      {/* CARD CHÍNH – CLICK VÀO ĐÂY SẼ PHÁT PHIM NGAY */}
      <div
        ref={cardRef}
        className="flex-shrink-0 w-full max-w-[180px] sm:max-w-[200px] lg:max-w-[220px] group relative cursor-pointer"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ zIndex: isHovered ? 70 : 1 }}
        onClick={() => movie.continueWatchingUrl && navigate(movie.continueWatchingUrl)}
      >
        {/* Poster + Progress + Overlay */}
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

          {/* Quality Badge */}
          {movie.quality && (
            <div className="absolute top-2 right-2 px-2 py-1 bg-red-600 rounded text-xs font-semibold">
              {movie.quality}
            </div>
          )}

          {/* PROGRESS BAR */}
          {showProgress && movie.progress != null && movie.progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/70 overflow-hidden">
              {/* Thanh nền xám mờ */}
              <div className="absolute inset-0 bg-gray-800/80" />
              
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(movie.progress, 100)}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="absolute inset-y-0 left-0"
                style={{
                  background: "linear-gradient(to right, #E50914, #FF3742)",
                  boxShadow: "0 0 12px rgba(229, 9, 20, 0.8), 0 0 20px rgba(255, 55, 66, 0.4)",
                }}
              />

              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full shadow-2xl ring-4 ring-white/40"
                style={{
                  left: `${Math.min(movie.progress, 100)}%`,
                  background: "radial-gradient(circle at 30% 30%, #ffffff, #E50914)",
                  transform: `translateX(-50%) translateY(-50%)`,
                  boxShadow: "0 0 16px rgba(255, 255, 255, 0.6), 0 0 24px rgba(229, 9, 20, 0.9)",
                }}
              />

              <div className="absolute inset-y-0 left-0 right-0 flex items-center pointer-events-none">
                <div 
                  className="h-0.5 w-full bg-white/20"
                  style={{ width: `${Math.min(movie.progress, 100)}%` }}
                />
              </div>
            </div>
          )}

          {showProgress && progress >= 95 && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-lg">
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            </div>
          )}
        </motion.div>

        {showProgress && onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation(); 
              onRemove();
            }}
            className="pointer-events-auto absolute top-8 right-3 z-50 w-10 h-10 rounded-full 
                       bg-black/70 backdrop-blur-md ring-2 ring-white/20
                       flex items-center justify-center
                       opacity-40 group-hover:opacity-100 
                       hover:ring-white/50 hover:bg-black/90 hover:scale-110
                       transition-all duration-300"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        )}
      </div>

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

      {/* Modal chi tiết */}
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
