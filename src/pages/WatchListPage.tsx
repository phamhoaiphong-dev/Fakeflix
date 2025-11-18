import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getOptimizedImageUrl } from "src/utils/imageHelper";
import MovieDetailModal from "src/components/watch/MovieDetailOverlay";
import { getWatchList } from "src/hooks/useWatchList";
import { useUser } from "@clerk/clerk-react";
import { handlePlayClick } from "src/utils/playHelper";
import MovieHoverCard from "src/components/MovieHoverCard";
import supabase from "src/utils/supabase";
import toast from "react-hot-toast";

interface WatchListItem {
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

export default function WatchListPage() {
  const { user } = useUser();
  const [watchList, setWatchList] = useState<WatchListItem[]>([]);
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

  // Delete confirm
  const [confirmDeleteFor, setConfirmDeleteFor] = useState<string | null>(null);
  const [disableHoverCard, setDisableHoverCard] = useState(false);

  const MOVIES_PER_PAGE = 18;

  // Load watchlist
  useEffect(() => {
    if (!user?.id) return;

    const fetchWatchList = async () => {
      setLoading(true);
      try {
        const watchListMovies = await getWatchList(user.id);
        setWatchList(watchListMovies || []);

        const detailMap: Record<string, MovieDetail> = {};

        const fetchPromises = (watchListMovies || []).map(async (item) => {
          try {
            const res = await fetch(`https://phimapi.com/phim/${item.movie_id}`);
            const data = await res.json();

            if (data.status && data.movie) {
              detailMap[item.movie_id] = data.movie;
            } else {
              detailMap[item.movie_id] = {
                name: item.movie_name,
                thumb_url: "",
                slug: item.movie_id,
              };
            }
          } catch {
            detailMap[item.movie_id] = {
              name: item.movie_name,
              thumb_url: "",
              slug: item.movie_id,
            };
          }
        });

        await Promise.all(fetchPromises);
        setMovieDetails(detailMap);
      } finally {
        setLoading(false);
      }
    };

    fetchWatchList();

    const listener = () => fetchWatchList();
    window.addEventListener("watchlistUpdated", listener);
    return () => window.removeEventListener("watchlistUpdated", listener);
  }, [user]);

  const paginatedWatchList = watchList.slice(
    (page - 1) * MOVIES_PER_PAGE,
    page * MOVIES_PER_PAGE
  );

  useEffect(() => {
    setTotalPages(Math.ceil(watchList.length / MOVIES_PER_PAGE));
  }, [watchList]);

  const handleMouseEnter = (movieId: string) => {
    const card = cardRefs.current[movieId];
    if (card) {
      const rect = card.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      const w = window.innerWidth;

      if (center < w * 0.25) setHoverPosition("left");
      else if (center > w * 0.75) setHoverPosition("right");
      else setHoverPosition("center");
    }
    setHoveredId(movieId);
  };

  const handleMouseLeave = () => {
    hoverTimeout.current = setTimeout(() => setHoveredId(null), 400);
  };

  const handlePlay = (slug: string, detail?: any) => {
    const ep = detail?.episodes?.[0]?.server_data?.[0];
    handlePlayClick({
      slug,
      episode: ep
        ? { slug: ep.slug, name: ep.name, server_name: ep.server_name }
        : undefined,
    });
  };

  const handleMoreInfo = async (slug: string) => {
    try {
      const res = await fetch(`https://phimapi.com/phim/${slug}`);
      const data = await res.json();
      if (data.status && data.movie) {
        setSelectedMovie(data);
        setIsModalOpen(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const removeFromWatchList = async (movieSlug: string) => {
    if (!user?.id) return;

    const { data: existing } = await supabase
      .from("user_movies")
      .select("id")
      .eq("user_id", user.id)
      .eq("movie_id", movieSlug)
      .eq("relation_type", "watchlist")
      .maybeSingle();

    if (existing) {
      await supabase.from("user_movies").delete().eq("id", existing.id);

      setWatchList((prev) => prev.filter((l) => l.movie_id !== movieSlug));

      toast.success("Đã xóa khỏi danh sách xem sau");
      window.dispatchEvent(new Event("watchlistUpdated"));
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-[70px]">
      <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Danh Sách Xem Sau</h1>
        <p className="text-gray-400 text-sm">
          {watchList.length > 0 ? `${watchList.length} phim • Trang ${page}/${totalPages}` : "Chưa có phim trong danh sách"}
        </p>

        {loading ? (
          <div className="text-center py-20">Đang tải...</div>
        ) : paginatedWatchList.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            Bạn chưa có phim nào trong danh sách xem sau • Nhấn ➕ để thêm
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 md:gap-4 lg:gap-5 mt-6">
              {paginatedWatchList.map((item) => {
                const detail = movieDetails[item.movie_id];
                const thumb = detail?.thumb_url ? getOptimizedImageUrl(detail.thumb_url) : "";
                const name = detail?.name || item.movie_name;
                const isHovered = hoveredId === item.movie_id;

                return (
                  <div
                    key={item.movie_id}
                    ref={(el) => (cardRefs.current[item.movie_id] = el)}
                    className="relative cursor-pointer"
                    onMouseEnter={() => handleMouseEnter(item.movie_id)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <motion.div className="rounded-lg overflow-hidden" whileHover={{ scale: 1.05 }}>
                      <div className="relative aspect-[2/3] w-full">
                        {/* Delete Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDisableHoverCard(true);
                            setConfirmDeleteFor(
                              confirmDeleteFor === item.movie_id ? null : item.movie_id
                            );
                          }}
                          className="absolute top-2 left-2 w-8 h-8 flex items-center justify-center
                                     bg-black/60 hover:bg-black/80 rounded-full z-50"
                        >
                          ✕
                        </button>

                        {/* Confirm Delete */}
                        {confirmDeleteFor === item.movie_id && (
                          <div
                            className="absolute top-12 left-2 bg-black/80 p-3 rounded-lg z-50 text-sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <p className="mb-2">Xoá khỏi danh sách xem sau?</p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  removeFromWatchList(item.movie_id);
                                  setConfirmDeleteFor(null);
                                  setDisableHoverCard(false);
                                }}
                                className="bg-red-600 px-3 py-1 rounded text-xs"
                              >
                                Xoá
                              </button>
                              <button
                                onClick={() => {
                                  setConfirmDeleteFor(null);
                                  setDisableHoverCard(false);
                                }}
                                className="bg-neutral-700 px-3 py-1 rounded text-xs"
                              >
                                Hủy
                              </button>
                            </div>
                          </div>
                        )}

                        {thumb ? (
                          <img src={thumb} alt={name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-gray-400 px-2 text-center text-sm">
                            {name}
                          </div>
                        )}

                        {detail?.quality && (
                          <div className="absolute top-2 right-2 px-2 py-1 bg-red-600 rounded text-xs">
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
                          hoverPosition={hoverPosition}
                          isLoading={!detail}
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
              <div className="flex justify-center gap-3 mt-12 mb-8">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-4 py-2 bg-neutral-800 rounded-lg disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-4 py-2 bg-neutral-800 rounded-lg disabled:opacity-30"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && selectedMovie && (
          <MovieDetailModal movie={selectedMovie} isOpen={true} onClose={() => setIsModalOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}