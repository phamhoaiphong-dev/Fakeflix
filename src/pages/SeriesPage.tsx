// src/pages/SeriesPage.tsx
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, ChevronDown, ChevronLeft, ChevronRight, Plus, ThumbsUp } from "lucide-react";
import { getOptimizedImageUrl } from "src/utils/imageHelper";
import { handlePlayClick } from "src/utils/playHelper";
import MovieDetailModal from "src/components/watch/MovieDetailOverlay";
import MovieHoverCard from "src/components/MovieHoverCard";
import { ALLOWED_COUNTRIES, useCountryFilter } from "src/hooks/useFilteredCountry";
import { KKPhimMovie } from "src/types/KKPhim";

export default function SeriesPage() {
    const [movies, setMovies] = useState<KKPhimMovie[]>([]);
    const { filterMovies, countByCountry } = useCountryFilter({
        customAllowedCountries: ALLOWED_COUNTRIES,
    });
    const [selectedCountry, setSelectedCountry] = useState<string>("all");
    function slugToLabel(slug: string) {
        switch (slug) {
            case "au-my": return "Âu - Mỹ";
            case "han-quoc": return "Hàn Quốc";
            case "nhat-ban": return "Nhật Bản";
            case "phap": return "Pháp";
            case "trung-quoc": return "Trung Quốc";
            case "an-do": return "Ấn Độ";
            case "hong-kong": return "Hong Kong";
            case "thai-lan": return "Thái Lan";
            case "dai-loan": return "Đài Loan";
            default: return slug;
        }
    }
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [selectedMovie, setSelectedMovie] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    // Hover states
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [hoverPosition, setHoverPosition] = useState<"left" | "center" | "right">("center");
    const [movieDetails, setMovieDetails] = useState<Record<string, any>>({});
    const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

    const hoverTimeout = useRef<NodeJS.Timeout | null>(null);

    // Fetch phim bộ theo trang
    useEffect(() => {
        const fetchSeries = async () => {
            try {
                setLoading(true);
                const res = await fetch(
                    `https://phimapi.com/v1/api/danh-sach/phim-bo?page=${page}&limit=18`
                );
                const json = await res.json();

                if (json.status === true && json.data?.items) {
                    const items = json.data.items.map((item: any) => ({
                        ...item,
                        _id: item._id,
                        name: item.name,
                        thumb_url: item.thumb_url || item.poster_url,
                        slug: item.slug,
                        year: item.year,
                        quality: item.quality,
                        episode_current: item.episode_current,
                        origin_name: item.origin_name,
                        time: item.time,
                        lang: item.lang,
                        tmdb: item.tmdb || {},
                    }));
                    const filtered = filterMovies(items);
                    setMovies(filtered);
                    setTotalPages(json.data.params?.pagination?.totalPages || 1);
                } else {
                    console.error("API lỗi hoặc không có dữ liệu:", json);
                }
            } catch (err) {
                console.error("Lỗi tải phim bộ:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchSeries();
    }, [page]);
    const filteredMovies =
        selectedCountry === "all"
            ? movies
            : movies.filter(movie =>
                movie.country?.some(c => c.slug === selectedCountry)
            );
    // Fetch chi tiết phim khi hover
    useEffect(() => {
        if (hoveredId && !movieDetails[hoveredId]) {
            const movie = movies.find(m => m._id === hoveredId);
            if (movie) {
                fetch(`https://phimapi.com/phim/${movie.slug}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.status === true && data.movie) {
                            setMovieDetails(prev => ({ ...prev, [hoveredId]: data.movie }));
                        }
                    })
                    .catch(err => console.error("Error fetching movie detail:", err));
            }
        }
    }, [hoveredId, movieDetails, movies]);

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

    const handlePrevPage = () => {
        if (page > 1) {
            setPage(page - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleNextPage = () => {
        if (page < totalPages) {
            setPage(page + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleMoreInfo = async (movieSlug: string) => {
        try {
            const res = await fetch(`https://phimapi.com/phim/${movieSlug}`);
            const data = await res.json();
            if (data.status === true && data.movie) {
                setSelectedMovie(data);
                setIsModalOpen(true);
            } else {
                alert("Không thể tải chi tiết phim.");
            }
        } catch (err) {
            console.error("Lỗi tải chi tiết:", err);
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
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">
                        Phim Bộ Nổi Bật
                    </h1>
                    <p className="text-gray-400 text-sm">
                        Cập nhật mới nhất • Trang {page} / {totalPages}
                    </p>
                </div>
                <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="bg-neutral-900 border border-neutral-700 text-white px-4 py-2 rounded-lg min-w-[200px] hover:border-neutral-500 transition mb-8 mt-4"
                >
                    <option value="all">🌍Tất cả quốc gia</option>
                    {ALLOWED_COUNTRIES.map(slug => (
                        <option key={slug} value={slug}>
                            {slugToLabel(slug)}
                        </option>
                    ))}
                </select>
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-400">Đang tải phim bộ...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Grid phim */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 md:gap-4 lg:gap-5">
                            {filteredMovies.map((movie) => {
                                const isHovered = hoveredId === movie._id;
                                const detail = movieDetails[movie._id] || movie;

                                return (
                                    <div
                                        key={movie._id}
                                        ref={(el) => (cardRefs.current[movie._id] = el)}
                                        className="relative cursor-pointer overflow-visible"
                                        onMouseEnter={() => handleMouseEnter(movie._id)}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        {/* Poster */}
                                        <motion.div
                                            className="relative rounded-lg overflow-hidden bg-neutral-900 shadow-lg"
                                            whileHover={{ scale: 1.05 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <div className="relative aspect-[2/3] w-full">
                                                <img
                                                    src={getOptimizedImageUrl(movie.thumb_url)}
                                                    alt={movie.name}
                                                    className="w-full h-full object-cover"
                                                    loading="lazy"
                                                />

                                                {/* Quality */}
                                                {movie.quality && (
                                                    <div className="absolute top-2 right-2 px-2 py-1 bg-red-600 rounded text-xs font-semibold">
                                                        {movie.quality}
                                                    </div>
                                                )}

                                                {/* TMDB rating */}
                                                {movie.tmdb?.vote_average != null && movie.tmdb.vote_average > 0 && (
                                                    <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/70 px-2 py-1 rounded text-xs">
                                                        <span>⭐</span>
                                                        <span>{movie.tmdb.vote_average.toFixed(1)}</span>
                                                    </div>
                                                )}
                                            </div>
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
                                        if (totalPages <= 5) pageNum = i + 1;
                                        else if (page <= 3) pageNum = i + 1;
                                        else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                                        else pageNum = page - 2 + i;

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