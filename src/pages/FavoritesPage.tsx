import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, ChevronDown, ChevronLeft, ChevronRight, ThumbsUp } from "lucide-react";
import { getOptimizedImageUrl } from "src/utils/imageHelper";
import MovieDetailModal from "src/components/watch/MovieDetailOverlay";
import { getFavorites } from "src/hooks/useFavorites";
import { useUser } from "@clerk/clerk-react";
import { handleFavoriteClick } from "src/hooks/useFavoritesAction";


interface Favorite {
  id: number;
  movie_id: string;
  movie_name: string;
  added_at: string;
}

interface MovieDetail {
  name: string;
  thumb_url: string;
  slug: string;
  year?: string;
  quality?: string;
  episode_current?: string;
  episode_total?: string;
  origin_name?: string;
}

export default function FavoritesPage() {
  const { user } = useUser();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [hoverPosition, setHoverPosition] = useState<"left" | "center" | "right">("center");
  const [movieDetails, setMovieDetails] = useState<Record<string, MovieDetail>>({});
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);
  const fetchingRef = useRef<Record<string, boolean>>({});

  const MOVIES_PER_PAGE = 18;

  // ✅ Fetch favorites from Supabase
  useEffect(() => {
    if (!user?.id) return;
    const fetchFavorites = async () => {
      setLoading(true);
      const favs = await getFavorites(user.id);
      setFavorites(favs || []);
      setLoading(false);
    };
    fetchFavorites();
    const handleUpdate = () => fetchFavorites();
    window.addEventListener("favoriteUpdated", handleUpdate);
    return () => window.removeEventListener("favoriteUpdated", handleUpdate);
  }, [user]);

  // ✅ Pagination logic
  const paginatedFavorites = favorites.slice(
    (page - 1) * MOVIES_PER_PAGE,
    page * MOVIES_PER_PAGE
  );

  useEffect(() => {
    setTotalPages(Math.ceil(favorites.length / MOVIES_PER_PAGE));
  }, [favorites]);

  // ✅ Fetch movie details when hovering
  useEffect(() => {
    if (!hoveredId || movieDetails[hoveredId] || fetchingRef.current[hoveredId]) return;
    fetchingRef.current[hoveredId] = true;
    fetch(`https://phimapi.com/phim/${hoveredId}`)
      .then(res => res.json())
      .then(data => {
        if (data.status && data.movie) {
          setMovieDetails(prev => ({ ...prev, [hoveredId]: data.movie }));
        }
      })
      .catch(console.error)
      .finally(() => {
        fetchingRef.current[hoveredId] = false;
      });
  }, [hoveredId, movieDetails]);

  const handlePlayClick = (slug: string) => {
    console.log("Play movie:", slug);
  };

  const handleMouseEnter = (movieId: string) => {
    const cardElement = cardRefs.current[movieId];
    if (cardElement) {
      const rect = cardElement.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const cardCenter = rect.left + rect.width / 2;
      if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
      if (cardCenter < windowWidth * 0.25) setHoverPosition("left");
      else if (cardCenter > windowWidth * 0.75) setHoverPosition("right");
      else setHoverPosition("center");
    }
    setHoveredId(movieId);
  };

  const handleMouseLeave = () => {
    hoverTimeout.current = setTimeout(() => {
      setHoveredId(null);
    }, 400);
  };

  const handleMoreInfo = async (movieSlug: string) => {
    try {
      const res = await fetch(`https://phimapi.com/phim/${movieSlug}`);
      const data = await res.json();
      if (data.status === true && data.movie) {
        setSelectedMovie(data);
        setIsModalOpen(true);
      } else {
        alert("Không thể tải chi tiết phim này.");
      }
    } catch (err) {
      console.error("Lỗi tải chi tiết phim:", err);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const getHoverPositionClass = () => {
    return hoverPosition === "left"
      ? "left-0"
      : hoverPosition === "right"
        ? "right-0"
        : "left-1/2 -translate-x-1/2";
  };

  return (
    <div className="min-h-screen bg-black text-white pt-[70px]">
      <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Danh Sách Yêu Thích</h1>
          <p className="text-gray-400 text-sm">
            Trang {page} / {totalPages}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Đang tải danh sách yêu thích...</p>
            </div>
          </div>
        ) : paginatedFavorites.length === 0 ? (
          <p className="text-center text-gray-400 py-20">
            Bạn chưa thêm phim nào vào danh sách yêu thích.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 md:gap-4 lg:gap-5">
              {paginatedFavorites.map((fav) => {
                const detail = movieDetails[fav.movie_id];
                const name = fav.movie_name || detail?.name || "Phim không rõ";
                const thumb = getOptimizedImageUrl(detail?.thumb_url || "");
                const isHovered = hoveredId === fav.movie_id;

                return (
                  <div
                    key={fav.movie_id}
                    ref={(el) => (cardRefs.current[fav.movie_id] = el)}
                    className="relative cursor-pointer overflow-visible"
                    onMouseEnter={() => handleMouseEnter(fav.movie_id)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <motion.div
                      className="relative rounded-lg overflow-hidden bg-neutral-900 shadow-lg"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="relative aspect-[2/3] w-full">
                        <img
                          src={thumb}
                          alt={name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute top-2 right-2 px-2 py-1 bg-red-600 rounded text-xs font-semibold">
                          Yêu thích
                        </div>
                      </div>
                    </motion.div>

                    <AnimatePresence>
                      {isHovered && (
                        <motion.div
                          key="hover-card"
                          initial={{ opacity: 0, scale: 0.85, y: 30 }}
                          animate={{ opacity: 1, scale: 1, y: -10 }}
                          exit={{ opacity: 0, scale: 0.9, y: 20 }}
                          transition={{ duration: 0.35, ease: "easeOut" }}
                          className={`absolute top-[-100px] ${getHoverPositionClass()} z-[100] w-[320px] bg-neutral-900 rounded-xl overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.85)]`}
                        >
                          <div className="relative w-full h-[180px] overflow-hidden">
                            <motion.img
                              src={thumb}
                              alt={name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                          </div>

                          <div className="p-3 space-y-2">
                            <h3 className="text-white font-semibold text-base line-clamp-1">
                              {name}
                            </h3>
                            <p className="text-gray-400 text-sm">
                              {detail?.year || "N/A"}
                            </p>

                            <div className="flex items-center justify-between mt-3">
                              <div className="flex gap-2">
                                <motion.button
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() =>
                                    handlePlayClick(detail?.slug || fav.movie_id)
                                  }
                                  className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                                >
                                  <Play className="w-4 h-4 text-black" fill="currentColor" />
                                </motion.button>

                                <motion.button
                                  whileTap={{ scale: 0.9 }}
                                  className="w-8 h-8 border border-gray-400 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                                >
                                  <ThumbsUp className="w-4 h-4" />
                                </motion.button>
                              </div>

                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() =>
                                  handleMoreInfo(detail?.slug || fav.movie_id)
                                }
                                className="w-8 h-8 border border-gray-400 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                              >
                                <ChevronDown className="w-4 h-4" />
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* ✅ Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-12 mb-8">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePrevPage}
                  disabled={page === 1}
                  className="px-4 py-2 bg-neutral-800 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-700 transition-colors flex items-center gap-2 font-medium"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Trang trước
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNextPage}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-neutral-800 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-700 transition-colors flex items-center gap-2 font-medium"
                >
                  Trang sau
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal chi tiết */}
      <AnimatePresence>
        {isModalOpen && selectedMovie && (
          <MovieDetailModal
            movie={selectedMovie}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
