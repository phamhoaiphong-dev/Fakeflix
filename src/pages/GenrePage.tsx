import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Play, ChevronDown, ChevronLeft, ChevronRight, Plus, ThumbsUp } from "lucide-react";
import { getOptimizedImageUrl } from "src/utils/imageHelper";
import MovieDetailModal from "src/components/watch/MovieDetailOverlay";

const handlePlayClick = ({ slug }: { slug: string }) => {
    console.log("Play movie:", slug);
};

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

export default function GenreMoviesPage() {
    const { slug } = useParams<{ slug: string }>();
    const [movies, setMovies] = useState<Movie[]>([]);
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [selectedMovie, setSelectedMovie] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [genreName, setGenreName] = useState<string>("");

    // Hover states
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [hoverPosition, setHoverPosition] = useState<"left" | "center" | "right">("center");
    const [movieDetails, setMovieDetails] = useState<Record<string, any>>({});
    const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

    const hoverTimeout = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                if (!slug) return;
                setLoading(true);
                const res = await fetch(
                    `https://phimapi.com/v1/api/the-loai/${slug}?page=${page}&limit=18&sort_field=modified.time&sort_type=desc`
                );

                const json = await res.json();

                if (json.status === true && (json.data?.items || json.data?.movieList)) {
                    setMovies(json.data.items || json.data.movieList || []);
                    setTotalPages(json.data.params?.pagination?.totalPages || 1);

                    if (json.data.breadCrumb && json.data.breadCrumb.length > 1) {
                        const genreBreadcrumb = json.data.breadCrumb[json.data.breadCrumb.length - 2]; 
                        if (genreBreadcrumb?.name) {
                            setGenreName(genreBreadcrumb.name);
                        }
                    } else if (json.data.seoOnPage?.titleHead) {
                        setGenreName(json.data.seoOnPage.titleHead.split(' | ')[0].replace(/^Phim\s+/i, ''));
                    } else {
                        setGenreName(typeof name === 'string' ? name : slug);
                    }
                } else {
                    console.error("Unexpected response:", json);
                    setMovies(json.data?.items || json.data?.movieList || []);
                }
            } catch (err) {
                console.error("Lỗi tải phim:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchMovies();
    }, [slug, page]);

    // Fetch movie detail when hovering
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
                alert("Không thể tải chi tiết phim này.");
            }
        } catch (err) {
            console.error("Lỗi tải chi tiết phim:", err);
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
            {/* Container with max width */}
            <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header section */}
                <div className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">
                        Danh Sách Phim Theo Thể Loại {genreName}
                    </h1>
                    <p className="text-gray-400 text-sm">
                        Trang {page} / {totalPages}
                    </p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-400">Đang tải phim...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Movies Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 md:gap-4 lg:gap-5">
                            {movies.map((movie) => {
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

                                                {/* Quality badge */}
                                                {movie.quality && (
                                                    <div className="absolute top-2 right-2 px-2 py-1 bg-red-600 rounded text-xs font-semibold">
                                                        {movie.quality}
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>

                                        {/* Hover Preview Card */}
                                        <AnimatePresence>
                                            {isHovered && !isModalOpen && (
                                                <motion.div
                                                    key="hover-card"
                                                    initial={{ opacity: 0, scale: 0.85, y: 30 }}
                                                    animate={{ opacity: 1, scale: 1, y: -10 }}
                                                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                                    transition={{ duration: 0.35, ease: "easeOut" }}
                                                    className={`absolute top-[-100px] ${getHoverPositionClass()} z-[100] w-[320px] bg-neutral-900 rounded-xl overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.85)] pointer-events-auto`}
                                                >
                                                    {/* Banner */}
                                                    <div className="relative w-full h-[180px] overflow-hidden">
                                                        <motion.img
                                                            src={getOptimizedImageUrl(movie.thumb_url)}
                                                            alt={movie.name}
                                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                                                        {/* Quality badge on hover card */}
                                                        {movie.quality && (
                                                            <div className="absolute top-2 right-2 px-2 py-1 bg-red-600 rounded text-xs font-bold">
                                                                {movie.quality}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Info */}
                                                    <div className="p-3 space-y-2">
                                                        <h3 className="text-white font-semibold text-base line-clamp-1">
                                                            {detail.name}
                                                        </h3>

                                                        <div className="flex gap-2 items-center text-gray-400 text-sm flex-wrap">
                                                            {detail.year && <span>{detail.year}</span>}
                                                            {detail.episode_total && <span>• {detail.episode_total}</span>}
                                                            {detail.episode_current && (
                                                                <span className="text-green-500 text-xs">• {detail.episode_current}</span>
                                                            )}
                                                        </div>

                                                        {detail.origin_name && (
                                                            <p className="text-xs text-gray-500 line-clamp-1">{detail.origin_name}</p>
                                                        )}

                                                        <div className="flex items-center justify-between mt-3">
                                                            <div className="flex gap-2">
                                                                <motion.button
                                                                    whileTap={{ scale: 0.9 }}
                                                                    onClick={() => handlePlayClick({ slug: movie.slug })}
                                                                    className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                                                                >
                                                                    <Play className="w-4 h-4 text-black" fill="currentColor" />
                                                                </motion.button>
                                                                <motion.button
                                                                    whileTap={{ scale: 0.9 }}
                                                                    className="w-8 h-8 border border-gray-400 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                                                                >
                                                                    <Plus className="w-4 h-4" />
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
                                                                onClick={() => handleMoreInfo(movie.slug)}
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
                                        let pageNum;
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