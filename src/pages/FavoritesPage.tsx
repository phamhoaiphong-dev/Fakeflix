import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, ChevronDown, ChevronLeft, ChevronRight, ThumbsUp, Plus } from "lucide-react";
import { getOptimizedImageUrl } from "src/utils/imageHelper";
import MovieDetailModal from "src/components/watch/MovieDetailOverlay";
import { getFavorites, useFavorites } from "src/hooks/useFavorites";
import { useUser } from "@clerk/clerk-react";
import { handlePlayClick } from "src/utils/playHelper";
import MovieHoverCard from "src/components/MovieHoverCard";
import supabase from "src/utils/supabase";
import toast from "react-hot-toast";

interface Favorite {
  id: number;
  movie_id: string;
  movie_name: string;
  added_at: string;
}

interface MovieDetail {
  _id?: string;
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
  const [movieDetails, setMovieDetails] = useState<Record<string, MovieDetail>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [hoverPosition, setHoverPosition] = useState<"left" | "center" | "right">("center");
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);
  const fetchingRef = useRef<Record<string, boolean>>({});


  // State for confirm delete 
  const [confirmDeleteFor, setConfirmDeleteFor] = useState<number | null>(null); 
   // State for disable hover card
  const [disableHoverCard, setDisableHoverCard] = useState(false);


  const MOVIES_PER_PAGE = 18;

  // ✅ Load favorites and details
  useEffect(() => {
    if (!user?.id) return;

    const fetchFavorites = async () => {
      setLoading(true);
      try {
        const favs = await getFavorites(user.id);
        setFavorites(favs || []);

        // Fetch movie details for each favorite
        const detailMap: Record<string, MovieDetail> = {};
        const fetchPromises = (favs || []).map(async (fav) => {
          try {
            const res = await fetch(`https://phimapi.com/phim/${fav.movie_id}`);
            const data = await res.json();

            // Debug log
            console.log(`Fetching ${fav.movie_id}:`, data);

            if (data.status && data.movie) {
              detailMap[fav.movie_id] = data.movie;
            } else {
              // Fallback: create minimal detail from favorite data
              detailMap[fav.movie_id] = {
                name: fav.movie_name,
                thumb_url: "",
                slug: fav.movie_id,
              };
            }
          } catch (err) {
            console.warn("Không thể tải thông tin phim:", fav.movie_id, err);
            // Fallback
            detailMap[fav.movie_id] = {
              name: fav.movie_name,
              thumb_url: "",
              slug: fav.movie_id,
            };
          }
        });

        await Promise.all(fetchPromises);
        setMovieDetails(detailMap);
      } catch (error) {
        console.error("Error loading favorites:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();

    // Listen for update
    const handleUpdate = () => fetchFavorites();
    window.addEventListener("favoriteUpdated", handleUpdate);
    return () => window.removeEventListener("favoriteUpdated", handleUpdate);
  }, [user]);

  // Pagination
  const paginatedFavorites = favorites.slice(
    (page - 1) * MOVIES_PER_PAGE,
    page * MOVIES_PER_PAGE
  );

  useEffect(() => {
    setTotalPages(Math.ceil(favorites.length / MOVIES_PER_PAGE));
  }, [favorites]);

  // Hover effect
  useEffect(() => {
    if (!hoveredId || movieDetails[hoveredId] || fetchingRef.current[hoveredId]) return;
    fetchingRef.current[hoveredId] = true;
    fetch(`https://phimapi.com/phim/${hoveredId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status && data.movie) {
          setMovieDetails((prev) => ({ ...prev, [hoveredId]: data.movie }));
        }
      })
      .catch(console.error)
      .finally(() => {
        fetchingRef.current[hoveredId] = false;
      });
  }, [hoveredId, movieDetails]);

  const handleMouseEnter = (favId: number, movieId: string) => {
    const cardElement = cardRefs.current[favId];
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
    hoverTimeout.current = setTimeout(() => setHoveredId(null), 400);
  };

  const handlePlay = (movieSlug: string, detail?: any) => {
    const firstEpisode = detail?.episodes?.[0]?.server_data?.[0];
    handlePlayClick({
      slug: movieSlug,
      episode: firstEpisode
        ? {
          slug: firstEpisode.slug,
          name: firstEpisode.name,
          server_name: firstEpisode.server_name,
        }
        : undefined,
    });
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
      setPage((p) => p - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage((p) => p + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getHoverPositionClass = () =>
    hoverPosition === "left"
      ? "left-0"
      : hoverPosition === "right"
        ? "right-0"
        : "left-1/2 -translate-x-1/2";


        const removeFavorite = async (movieSlug: string, favoriteId: number) => {
          if (!user?.id) return;
        
          const { error } = await supabase
            .from("user_movies")
            .delete()
            .eq("id", favoriteId);
        
          if (error) {
            console.error("Lỗi xóa:", error);
            toast.error("Xóa thất bại!");
            return;
          }
        
          setFavorites((prev) => prev.filter((f) => f.id !== favoriteId));
        
          toast.error("Đã xóa khỏi yêu thích");
          window.dispatchEvent(new Event("favoriteUpdated"));
        };


  // ✅ UI
  return (
    <div className="min-h-screen bg-black text-white pt-[70px]">
      <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Danh Sách Yêu Thích</h1>
          <p className="text-gray-400 text-sm">
            {favorites.length > 0 ? `${favorites.length} phim • Trang ${page} / ${totalPages}` : 'Chưa có phim yêu thích'}
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
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg mb-4">
              Bạn chưa thêm phim nào vào danh sách yêu thích.
            </p>
            <p className="text-gray-500 text-sm">
              Nhấn vào biểu tượng ❤️ trên phim để thêm vào danh sách này
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 md:gap-4 lg:gap-5">
              {paginatedFavorites.map((fav) => {
                const detail = movieDetails[fav.movie_id];
                const name = detail?.name || fav.movie_name;
                const thumb = detail?.thumb_url ? getOptimizedImageUrl(detail.thumb_url) : "";
                const isHovered = hoveredId === fav.movie_id;
                return (
                  <div
                    key={fav.id}
                    ref={(el) => (cardRefs.current[fav.id] = el)}
                    className="relative cursor-pointer overflow-visible"
                    onMouseEnter={() => handleMouseEnter(fav.id, fav.movie_id)}
                    onMouseLeave={handleMouseLeave}
                  >
                    {/* Poster */}
                    <motion.div
                      className="relative rounded-lg overflow-hidden bg-neutral-900 shadow-lg"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="relative aspect-[2/3] w-full">
                        {/* Nút X xoá */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDisableHoverCard(true);
                            // Dùng fav.id (number) → chuyển thành string để so sánh
                            setConfirmDeleteFor(prev => prev === fav.id ? null : fav.id);
                          }}
                          onMouseEnter={(e) => {
                            e.stopPropagation();
                            setDisableHoverCard(true);
                          }}
                          onMouseLeave={() => {
                            if (!confirmDeleteFor) setDisableHoverCard(false);
                          }}
                          className="absolute top-2 left-2 w-8 h-8 flex items-center justify-center bg-black/60 hover:bg-black/80 rounded-full backdrop-blur-sm text-white z-50 cursor-pointer"
                        >
                          X
                        </button>

                        {/* Popup xác nhận xóa – sửa ở đây */}
                        {confirmDeleteFor === fav.id && (
                          <div
                            className="absolute top-12 left-2 bg-black/80 backdrop-blur-md p-3 rounded-lg shadow-lg text-sm text-white z-50"
                            onMouseEnter={() => setDisableHoverCard(true)}
                            onMouseLeave={() => {
                              setConfirmDeleteFor(null);
                              setDisableHoverCard(false);
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <p className="mb-2">Bạn có chắc muốn xóa?</p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  removeFavorite(fav.movie_id, fav.id); 
                                  setConfirmDeleteFor(null);
                                  setDisableHoverCard(false);
                                }}
                                className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-xs"
                              >
                                Xóa
                              </button>
                              <button
                                onClick={() => {
                                  setConfirmDeleteFor(null);
                                  setDisableHoverCard(false);
                                }}
                                className="bg-neutral-700 hover:bg-neutral-600 px-3 py-1 rounded text-xs"
                              >
                                Hủy
                              </button>
                            </div>
                          </div>
                        )}

                        {thumb ? (
                          <img
                            src={thumb}
                            alt={name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                            <span className="text-gray-500 text-sm text-center px-2">
                              {name}
                            </span>
                          </div>
                        )}

                        {/* Quality badge */}
                        {detail?.quality && (
                          <div className="absolute top-2 right-2 px-2 py-1 bg-red-600 rounded text-xs font-semibold">
                            {detail.quality}
                          </div>
                        )}
                      </div>
                    </motion.div>

                    {/* Hover Card */}
                    <AnimatePresence>
                      {isHovered && !disableHoverCard && detail && (
                        <MovieHoverCard
                          movie={detail}
                          movieDetail={detail}
                          isLoading={!detail}
                          hoverPosition={hoverPosition}
                          onPlay={() => handlePlay(detail.slug, detail)}
                          onMoreInfo={() => handleMoreInfo(detail.slug)}
                          onMouseEnter={() => hoverTimeout.current && clearTimeout(hoverTimeout.current)}
                          onMouseLeave={handleMouseLeave}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
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

                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number = 1;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }

                    return (
                      <motion.button
                        key={pageNum}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setPage(pageNum);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`w-10 h-10 rounded-lg font-medium transition-all ${page === pageNum
                          ? 'bg-red-600 text-white'
                          : 'bg-neutral-800 text-gray-300 hover:bg-neutral-700'
                          }`}
                      >
                        {pageNum}
                      </motion.button>
                    );
                  })}
                </div>

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