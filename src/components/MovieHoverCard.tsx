import { motion } from "framer-motion";
import { Play, Heart, ChevronDown, ThumbsUp, Plus } from "lucide-react";
import { getMovieImage } from "src/utils/imageHelper";
import { useUser } from "@clerk/clerk-react";
import { toast } from "react-hot-toast";
import { useFavorites } from "src/hooks/useFavorites";
import { useWatchList } from "src/hooks/useWatchList";

interface MovieHoverCardProps {
  movie: any;
  movieDetail: any;
  isLoading: boolean;
  hoverPosition: "left" | "center" | "right";
  onPlay: () => void;
  onMoreInfo: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export default function MovieHoverCard({
  movie,
  movieDetail,
  isLoading,
  hoverPosition,
  onPlay,
  onMoreInfo,
  onMouseEnter,
  onMouseLeave,
}: MovieHoverCardProps) {
  const detail = movieDetail?.movie || movie;
  const { user } = useUser();

const { isFavorite, toggleFavorite } = useFavorites(detail?.slug);
const { isInWatchList, toggleWatchList } = useWatchList(detail?.slug);

  const handleFavorites = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!user?.id) {
      toast.error("Vui lòng đăng nhập để thêm vào danh sách yêu thích");
      return;
    }

    await toggleFavorite({
      slug: detail.slug,
      title: detail.name,
    });
  };

  const handleWatchList = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!user?.id) {
      toast.error("Vui lòng đăng nhập để thêm vào danh sách yêu thích");
      return;
    }

    await toggleWatchList({
      slug: detail.slug,
      title: detail.name,
    });
  };


  const getHoverPositionClass = () => {
    switch (hoverPosition) {
      case "left":
        return "left-0 origin-top-left";
      case "right":
        return "right-0 origin-top-right";
      default:
        return "left-1/2 -translate-x-1/2 origin-top";
    }
  };

  return (
    <motion.div
      key="hover-card"
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1.08, y: -8 }}
      exit={{ opacity: 0, scale: 0.95, y: 5 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className={`absolute z-[70] w-[280px] bg-neutral-900 rounded-lg overflow-hidden 
        shadow-[0_8px_32px_rgba(0,0,0,0.6)] border border-white/5 ${getHoverPositionClass()}`}
      style={{ top: "-4px" }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Banner */}
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

      {/* Info */}
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

        {isLoading && (
          <div className="flex items-center justify-center py-2">
            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!isLoading && (
          <div className="flex items-center justify-between mt-1.5 pt-1.5">
            <div className="flex gap-1.5">
              {/* Play */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onPlay}
                className="w-6 h-6 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <Play className="w-3 h-3 text-black ml-0.5" fill="currentColor" />
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleWatchList}
                className={`w-6 h-6 border rounded-full flex items-center justify-center transition-colors ${isInWatchList
                  ? "bg-red-600 border-red-600 hover:bg-red-700 text-white"
                  : "border-gray-500 text-white hover:border-white"
                  }`}
              >
                <Plus
                  className={`w-3 h-3 ${isInWatchList ? "fill-current text-white" : ""}`}
                />
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleFavorites}
                className={`w-6 h-6 border rounded-full flex items-center justify-center transition-colors ${isFavorite
                  ? "bg-red-600 border-red-600 hover:bg-red-700 text-white"
                  : "border-gray-500 text-white hover:border-white"
                  }`}
              >
                <Heart
                  className={`w-3 h-3 ${isFavorite ? "fill-current text-white" : ""}`}
                />
              </motion.button>
            </div>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onMoreInfo}
              className="w-6 h-6 border border-gray-500 rounded-full flex items-center justify-center text-white hover:border-white transition-colors"
            >
              <ChevronDown className="w-3 h-3" />
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
