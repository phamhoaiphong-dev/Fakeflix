import { motion, AnimatePresence } from "framer-motion";
import { Play, Plus, ThumbsUp, X, Loader, Heart } from "lucide-react";
import { getMovieImage } from "src/utils/imageHelper";
import { handlePlayClick } from "src/utils/playHelper";
import { KKPhimDetailResponse } from "src/types/KKPhim";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import supabase from "src/utils/supabase";
import { toast } from "react-hot-toast";
import { useFavorites } from "src/hooks/useFavorites";
import { useWatchList } from "src/hooks/useWatchList";

interface MovieDetailModalProps {
  movie: KKPhimDetailResponse;
  isOpen: boolean;
  onClose: () => void;
}

export default function MovieDetailModal({
  movie,
  isOpen,
  onClose,
}: MovieDetailModalProps) {
  if (!movie || !movie.movie) return null;

  const detail = movie.movie;
  const episodes = movie.episodes || [];
  const [isPlaying, setIsPlaying] = useState(false);

  const { user } = useUser();
  const { isFavorite, toggleFavorite } = useFavorites(detail?.slug);
  const { isInWatchList, toggleWatchList } = useWatchList(detail?.slug);

  const handleFavorites = async () => {
    if (!user?.id) {
      toast.error("Vui lòng đăng nhập để thêm vào danh sách yêu thích");
      return;
    }

    await toggleFavorite({
      slug: detail.slug,
      title: detail.name,
    });

    window.dispatchEvent(new Event("favoriteUpdated"));
  };

  const handleWatchList = async () => {
    if (!user?.id) {
      toast.error("Vui lòng đăng nhập để thêm vào danh sách yêu thích");
      return;
    }

    await toggleWatchList({
      slug: detail.slug,
      title: detail.name,
    });

    window.dispatchEvent(new Event("favoriteUpdated"));
  };

  const handlePlay = async () => {
    if (!detail?.slug) {
      console.warn("[MovieDetailModal] Missing slug");
      alert("Không thể phát phim. Thông tin phim không đầy đủ.");
      return;
    }

    const firstEpisode = episodes?.[0]?.server_data?.[0];
    if (!firstEpisode) {
      alert("Phim này chưa có tập để phát.");
      return;
    }

    setIsPlaying(true);
    setTimeout(() => {
      const success = handlePlayClick({ slug: detail.slug, episode: firstEpisode });
      if (!success) {
        alert("Không thể phát phim. Vui lòng thử lại.");
        setIsPlaying(false);
      }
    }, 200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-[90%] max-w-5xl bg-[#141414] rounded-2xl overflow-hidden shadow-2xl my-10"
            initial={{ scale: 0.95, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 40 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 p-2 rounded-full z-10 transition"
            >
              <X className="text-white" size={24} />
            </button>

            {/* Header Backdrop */}
            <div className="relative aspect-video w-full">
              <img
                src={getMovieImage(detail, "backdrop")}
                alt={detail.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/60 to-transparent" />

              {/* Movie title + action buttons */}
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg mb-4">
                  {detail.name}
                </h1>

                <div className="flex items-center gap-3 flex-wrap">
                  {/* ▶️ Play */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlay();
                    }}
                    disabled={isPlaying}
                    className={`flex items-center gap-2 text-lg font-semibold px-8 py-2.5 rounded-md transition ${isPlaying
                        ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                        : "bg-white text-black hover:bg-gray-200"
                      }`}
                  >
                    {isPlaying ? (
                      <>
                        <Loader className="animate-spin" size={24} /> Đang tải...
                      </>
                    ) : (
                      <>
                        <Play fill="currentColor" size={24} /> Phát
                      </>
                    )}
                  </button>

                  {/* ➕ Add to list */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleWatchList();
                    }}
                    className={`flex items-center justify-center w-11 h-11 rounded-full transition ${isInWatchList
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : "bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white"
                      }`}
                    title={isInWatchList ? "Xóa khỏi danh sách xem sau" : "Thêm vào danh sách xem sau"}
                  >
                    <Plus
                      size={24}
                      className={isInWatchList ? "fill-current text-white" : ""}
                    />
                  </button>

                  {/* ❤️ Favorite toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFavorites();
                    }}
                    className={`flex items-center justify-center w-11 h-11 rounded-full transition ${isFavorite
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : "bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white"
                      }`}
                    title={isFavorite ? "Xóa khỏi danh sách yêu thích" : "Thêm vào danh sách yêu thích"}
                  >
                    <Heart
                      size={24}
                      className={isFavorite ? "fill-current text-white" : ""}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Movie Info */}
            <div className="p-8 border-t border-[#2f2f2f]">
              <div className="flex flex-wrap items-center gap-4 text-sm mb-3 text-gray-300">
                {detail.year && <span className="text-emerald-400">{detail.year}</span>}
                {detail.quality && (
                  <span className="px-2 py-0.5 border border-zinc-600 text-zinc-300 text-xs font-semibold">
                    {detail.quality}
                  </span>
                )}
                {detail.lang && <span>{detail.lang}</span>}
                {detail.time && <span>{detail.time}</span>}
                {detail.episode_total && <span>{detail.episode_total} tập</span>}
              </div>

              <p className="text-gray-200 text-sm leading-relaxed mb-5">
                {detail.content?.trim()
                  ? detail.content.length > 400
                    ? detail.content.slice(0, 400) + "..."
                    : detail.content
                  : "⚠️ Hiện chưa có mô tả cho phim này."}
              </p>

              <div className="grid sm:grid-cols-2 gap-y-2 text-sm text-gray-300">
                {detail.actor?.length > 0 && (
                  <div>
                    <span className="text-gray-500">Diễn viên:</span>{" "}
                    {detail.actor.join(", ")}
                  </div>
                )}
                {detail.director?.length > 0 && (
                  <div>
                    <span className="text-gray-500">Đạo diễn:</span>{" "}
                    {detail.director.join(", ")}
                  </div>
                )}
                {detail.category?.length > 0 && (
                  <div>
                    <span className="text-gray-500">Thể loại:</span>{" "}
                    {detail.category.map((c: any) => c.name).join(", ")}
                  </div>
                )}
                {detail.country?.length > 0 && (
                  <div>
                    <span className="text-gray-500">Quốc gia:</span>{" "}
                    {detail.country.map((c: any) => c.name).join(", ")}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
