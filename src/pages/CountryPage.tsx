import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getOptimizedImageUrl } from "src/utils/imageHelper";
import { handlePlayClick } from "src/utils/playHelper";
import { countries } from "src/constant";

import MovieDetailModal from "src/components/watch/MovieDetailOverlay";
import MovieHoverCard from "src/components/MovieHoverCard";

interface Movie {
  _id: string;
  name: string;
  thumb_url: string;
  slug: string;
  year?: string;
  quality?: string;
  episode_current?: string;
  episode_total?: string;
  origin_name?: string;
}

export default function CountryMoviesPage() {
  const { slug } = useParams<{ slug: string }>();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [hoverPosition, setHoverPosition] = useState<"left" | "center" | "right">("center");
  const [movieDetails, setMovieDetails] = useState<Record<string, any>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<any>(null);

  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);
  const country = countries.find(c => c.slug === slug);

  /** 📡 Fetch phim theo quốc gia */
  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    fetch(`https://phimapi.com/v1/api/quoc-gia/${slug}?page=${page}&limit=18`)
      .then(res => res.json())
      .then(json => {
        if (json.status === "success" && json.data?.items) {
          setMovies(json.data.items);
          setTotalPages(json.data.params?.pagination?.totalPages || 1);
        }
      })
      .catch(err => console.error("Lỗi tải phim:", err))
      .finally(() => setLoading(false));
  }, [slug, page]);

  /** 🧠 Fetch movie detail khi hover */
  useEffect(() => {
    if (!hoveredId) return;
    // Nếu chi tiết phim đã có rồi thì bỏ qua
    if (movieDetails[hoveredId]) return;

    const movie = movies.find(m => m._id === hoveredId);
    if (!movie) return;

    // Gọi API lấy chi tiết phim
    fetch(`https://phimapi.com/phim/${movie.slug}`)
      .then(res => res.json())
      .then(data => {
        if (data.status === true && data.movie) {
          setMovieDetails(prev => ({ ...prev, [hoveredId]: data }));
        }
      })
      .catch(err => console.error("Lỗi tải chi tiết phim:", err));
  }, [hoveredId, movies, movieDetails]);


  /** 🪶 Hover position logic */
  const handleMouseEnter = (movieId: string) => {
    const card = cardRefs.current[movieId];
    if (card) {
      const { left, width } = card.getBoundingClientRect();
      const center = left + width / 2;
      const screen = window.innerWidth;
      setHoverPosition(center < screen * 0.25 ? "left" : center > screen * 0.75 ? "right" : "center");
    }
    setHoveredId(movieId);
  };

  const handleMouseLeave = () => {
    hoverTimeout.current = setTimeout(() => setHoveredId(null), 300);
  };

  /** 🎬 Play movie */
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

  /** 🔍 More info modal */
  const handleMoreInfo = async (movieSlug: string) => {
    try {
      const res = await fetch(`https://phimapi.com/phim/${movieSlug}`);
      const data = await res.json();
      if (data.status === true && data.movie) {
        setSelectedMovie(data);
        setIsModalOpen(true);
      }
    } catch (err) {
      console.error("Lỗi tải chi tiết phim:", err);
    }
  };

  /** 🎞️ Pagination */
  const handlePrevPage = () => page > 1 && setPage(p => p - 1);
  const handleNextPage = () => page < totalPages && setPage(p => p + 1);

  return (
    <div className="min-h-screen bg-black text-white pt-[70px]">
      <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Danh Sách Phim Theo Quốc Gia {country?.name.toUpperCase()}
          </h1>
          <p className="text-gray-400 text-sm">Trang {page} / {totalPages}</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
              {movies.map(movie => {
                const isHovered = hoveredId === movie._id;
                const detail = movieDetails[movie._id] || movie;

                return (
                  <div
                    key={movie._id}
                    ref={el => (cardRefs.current[movie._id] = el)}
                    onMouseEnter={() => handleMouseEnter(movie._id)}
                    onMouseLeave={handleMouseLeave}
                    className="relative cursor-pointer"
                  >
                    {/* Poster */}
                    <motion.div
                      className="rounded-lg overflow-hidden bg-neutral-900 shadow-lg"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    >
                      <img
                        src={getOptimizedImageUrl(movie.thumb_url)}
                        alt={movie.name}
                        className="w-full aspect-[2/3] object-cover"
                      />
                      {movie.quality && (
                        <div className="absolute top-2 right-2 px-2 py-1 bg-red-600 rounded text-xs font-semibold">
                          {movie.quality}
                        </div>
                      )}
                    </motion.div>

                    {/* Hover Card */}
                    <AnimatePresence>
                      {isHovered && (
                        <MovieHoverCard
                          movie={movie}
                          movieDetail={movieDetails[movie._id]}
                          isLoading={!movieDetails[movie._id]}
                          hoverPosition={hoverPosition}
                          onPlay={() => handlePlay(movie.slug, movieDetails[movie._id])}
                          onMoreInfo={() => handleMoreInfo(movie.slug)}
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
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-12 mb-8">
                {/* Nút trang trước */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (page > 1) {
                      setPage(page - 1);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }}
                  disabled={page === 1}
                  className="px-4 py-2 bg-neutral-800 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-700 transition-colors flex items-center gap-2 font-medium"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Trang trước
                </motion.button>

                {/* Số trang hiển thị */}
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
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className={`w-10 h-10 rounded-lg font-medium transition-all ${page === pageNum
                            ? "bg-red-600 text-white"
                            : "bg-neutral-800 text-gray-300 hover:bg-neutral-700"
                          }`}
                      >
                        {pageNum}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Nút trang sau */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (page < totalPages) {
                      setPage(page + 1);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }}
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

      {/* Modal */}
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
