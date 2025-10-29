import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Plus, ThumbsUp, ChevronDown } from "lucide-react";
import { KKPhimMovie } from "src/types/KKPhim";
import { useGetMovieDetailQuery } from "src/store/slices/discover";
import { getMovieImage } from "src/utils/imageHelper";
import { handlePlayClick } from "src/utils/playHelper";
import MovieDetailModal from "src/components/watch/MovieDetailOverlay";

export default function MovieCard({ movie }: { movie: KKPhimMovie }) {
  const [isHovered, setIsHovered] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [hoverPosition, setHoverPosition] = useState<"left" | "center" | "right">("center");
  const cardRef = useRef<HTMLDivElement>(null);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  const { data: movieData } = useGetMovieDetailQuery(movie.slug, {
    skip: !isHovered && !showModal,
  });

  const detail = movieData?.movie;

  const handleMouseEnter = () => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const cardCenter = rect.left + rect.width / 2;

      if (cardCenter < windowWidth * 0.25) setHoverPosition("left");
      else if (cardCenter > windowWidth * 0.75) setHoverPosition("right");
      else setHoverPosition("center");
    }

    const timeout = setTimeout(() => setIsHovered(true), 300);
    setHoverTimeout(timeout);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    setTimeout(() => setIsHovered(false), 150);
  };

  const handlePlay = () => {
    if (!movieData) return alert("Đang tải dữ liệu phim...");
    const firstEpisode = movieData?.episodes?.[0]?.server_data?.[0];
    if (!firstEpisode) return alert("Phim này chưa có tập để phát.");
    handlePlayClick({ slug: movie.slug, episode: firstEpisode });
  };

  const getHoverPositionClass = () => {
    return hoverPosition === "left"
      ? "left-0 origin-top-left"
      : hoverPosition === "right"
        ? "right-0 origin-top-right"
        : "left-1/2 -translate-x-1/2 origin-top";
  };

  return (
    <>
      <div
        ref={cardRef}
        className="relative cursor-pointer overflow-visible"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ zIndex: isHovered ? 70 : 1 }}
      >
        {/* Poster */}
        <motion.div
          className="relative rounded-md overflow-hidden bg-neutral-900 w-[160px] sm:w-[180px] md:w-[200px]"
          animate={{ scale: isHovered ? 1.05 : 1 }}
          transition={{ duration: 0.3 }}
        >
          <img
            src={getMovieImage(movie, "poster")}
            alt={movie.name}
            className="w-full h-full object-cover aspect-[2/3]"
            loading="lazy"
          />
          {movie.quality && (
            <div className="absolute top-2 right-2 px-2 py-1 bg-red-600 rounded text-xs font-semibold">
              {movie.quality}
            </div>
          )}
        </motion.div>

        {/* Hover Preview Card - Ẩn khi modal lớn mở */}
        <AnimatePresence>
          {isHovered && detail && !showModal && (
            <motion.div
              key="hover-card"
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1.08, y: -8 }}
              exit={{ opacity: 0, scale: 0.95, y: 5 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className={`absolute z-[70] w-[280px] bg-neutral-900 rounded-lg overflow-hidden 
                shadow-[0_8px_32px_rgba(0,0,0,0.6)] border border-white/5 ${getHoverPositionClass()}`}
              style={{ top: "-4px" }}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {/* Banner - Compact */}
              <div className="relative w-full h-[140px] overflow-hidden">
                <img
                  src={getMovieImage(detail, "thumb")}
                  alt={detail.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
                {detail.quality && (
                  <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-red-600 rounded text-[10px] font-bold">
                    {detail.quality}
                  </div>
                )}
              </div>

              {/* Info - Compact */}
              <div className="p-2.5 space-y-1">
                <h3 className="text-white font-semibold text-xs line-clamp-1 leading-tight">
                  {detail.name}
                </h3>

                <div className="flex gap-1.5 items-center text-gray-400 text-[10px] flex-wrap">
                  {detail.year && <span>{detail.year}</span>}
                  {detail.episode_total && <span>• {detail.episode_total}</span>}
                  {detail.episode_current && (
                    <span className="text-green-500">• {detail.episode_current}</span>
                  )}
                </div>

                {detail.origin_name && (
                  <p className="text-[10px] text-gray-500 line-clamp-1 leading-tight">
                    {detail.origin_name}
                  </p>
                )}

                <div className="flex items-center justify-between mt-1.5 pt-1.5">
                  <div className="flex gap-1.5">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={handlePlay}
                      className="w-6 h-6 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                    >
                      <Play className="w-3 h-3 text-black ml-0.5" fill="currentColor" />
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      className="w-6 h-6 border border-gray-500 rounded-full flex items-center justify-center text-white hover:border-white transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      className="w-6 h-6 border border-gray-500 rounded-full flex items-center justify-center text-white hover:border-white transition-colors"
                    >
                      <ThumbsUp className="w-3 h-3" />
                    </motion.button>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowModal(true)}
                    className="w-6 h-6 border border-gray-500 rounded-full flex items-center justify-center text-white hover:border-white transition-colors"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal */}
      {movieData && (
        <MovieDetailModal
          movie={movieData}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}