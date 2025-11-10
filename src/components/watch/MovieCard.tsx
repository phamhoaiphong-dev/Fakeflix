import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Plus, ThumbsUp, ChevronDown } from "lucide-react";
import { KKPhimMovie } from "src/types/KKPhim";
import { getMovieImage } from "src/utils/imageHelper";
import { handlePlayClick } from "src/utils/playHelper";
import MovieDetailModal from "src/components/watch/MovieDetailOverlay";
import MovieHoverCard from "../MovieHoverCard";

export default function MovieCard({ movie }: { movie: KKPhimMovie }) {
  const [isHovered, setIsHovered] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [hoverPosition, setHoverPosition] = useState<"left" | "center" | "right">("center");
  const [movieDetail, setMovieDetail] = useState<any>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      const windowWidth = window.innerWidth;
      const cardCenter = rect.left + rect.width / 2;

      if (cardCenter < windowWidth * 0.25) setHoverPosition("left");
      else if (cardCenter > windowWidth * 0.75) setHoverPosition("right");
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
              onMouseEnter={() => {
                if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
              }}
              onMouseLeave={handleMouseLeave}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Modal - Chỉ render khi có data */}
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