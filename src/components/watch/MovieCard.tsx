import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Plus, ThumbsUp, ChevronDown } from "lucide-react";
import { KKPhimMovie } from "src/types/KKPhim";
import { useGetMovieDetailQuery } from "src/store/slices/discover";
import { getMovieImageUrl } from "src/utils/imageHelper";

interface MovieCardProps {
    movie: KKPhimMovie;
}

export default function MovieCard({ movie }: MovieCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [hoverPosition, setHoverPosition] = useState<'left' | 'center' | 'right'>('center');
    const cardRef = useRef<HTMLDivElement>(null);
    const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Fetch detail chỉ khi hover hoặc mở modal
    const { data: movieData } = useGetMovieDetailQuery(movie.slug, {
        skip: !isHovered && !showModal,
    });

    const detail = movieData?.movie;

    const handleMouseEnter = () => {
        // Tính toán vị trí card để điều chỉnh hover card
        if (cardRef.current) {
            const rect = cardRef.current.getBoundingClientRect();
            const windowWidth = window.innerWidth;
            const cardCenter = rect.left + rect.width / 2;

            if (cardCenter < windowWidth * 0.25) {
                setHoverPosition('left');
            } else if (cardCenter > windowWidth * 0.75) {
                setHoverPosition('right');
            } else {
                setHoverPosition('center');
            }
        }

        hoverTimeoutRef.current = setTimeout(() => setIsHovered(true), 300);
    };

    const handleMouseLeave = () => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        setIsHovered(false);
    };

    useEffect(() => {
        return () => {
            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        };
    }, []);

    const handlePlay = () => {
        window.location.href = `/watch/${movie.slug}`;
    };

    // Tính toán vị trí hover card dựa trên position
    const getHoverCardPosition = () => {
        switch (hoverPosition) {
            case 'left':
                return 'left-0';
            case 'right':
                return 'right-0';
            default:
                return 'left-[-40px]';
        }
    };

    return (
        <>
            {/* Card chính */}
            <motion.div
                ref={cardRef}
                className="relative group cursor-pointer"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                whileHover={{ scale: 1.05, zIndex: 10 }}
                transition={{ duration: 0.3 }}
            >
                <div className="relative w-[160px] sm:w-[180px] md:w-[200px] aspect-[3/4] rounded-md overflow-hidden bg-zinc-800">
                    <img
                        src={getMovieImageUrl(movie)}
                        alt={movie.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                </div>

                {/* Hover Card - Netflix Style */}
                <AnimatePresence>
                    {isHovered && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.25 }}
                            className={`absolute top-[-30px] ${getHoverCardPosition()} w-[320px] bg-zinc-900 rounded-lg shadow-2xl z-20`}
                        >
                            {/* Thumbnail */}
                            <div className="relative h-[180px]">
                                <img
                                    src={getMovieImageUrl(movie)}
                                    alt={movie.name}
                                    className="w-full h-full object-cover rounded-t-lg"
                                />

                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-t-lg">
                                    {/* Action buttons */}
                                    <div className="absolute bottom-3 left-3 flex gap-2">
                                        <button
                                            onClick={handlePlay}
                                            className="w-10 h-10 bg-white rounded-full hover:bg-gray-200 flex items-center justify-center transition-colors"
                                        >
                                            <Play className="w-5 h-5 text-black ml-0.5" fill="currentColor" />
                                        </button>
                                        <button className="w-10 h-10 bg-zinc-800/80 rounded-full border-2 border-gray-400 hover:border-white flex items-center justify-center transition-colors">
                                            <Plus className="w-5 h-5 text-white" />
                                        </button>
                                        <button className="w-10 h-10 bg-zinc-800/80 rounded-full border-2 border-gray-400 hover:border-white flex items-center justify-center transition-colors">
                                            <ThumbsUp className="w-5 h-5 text-white" />
                                        </button>
                                    </div>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowModal(true);
                                        }}
                                        className="absolute bottom-3 right-3 w-10 h-10 bg-zinc-800/80 rounded-full border-2 border-gray-400 hover:border-white flex items-center justify-center transition-colors"
                                    >
                                        <ChevronDown className="w-5 h-5 text-white" />
                                    </button>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-4 space-y-2">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-white font-bold text-base line-clamp-1">
                                        {movie.name}
                                    </h3>
                                    <div className="flex gap-2 text-sm text-gray-400 flex-shrink-0">
                                        {movie.year && <span>{movie.year}</span>}
                                        {movie.time && (
                                            <span>{movie.time}</span>
                                        )}
                                        {movie.country && movie.country.length > 0 && (
                                            <span>
                                                {movie.country.map(c => c.name).join(", ")}
                                            </span>
                                        )}
                                        {movie.quality && (
                                            <span className="px-2 py-0.5 bg-gray-700 rounded text-xs">
                                                {movie.quality}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <p className="text-gray-400 text-sm line-clamp-2">
                                    {detail?.content || "Đang cập nhật..."}
                                </p>

                                {detail?.category && (
                                    <div className="flex flex-wrap gap-1 text-sm text-gray-300">
                                        {detail.category.slice(0, 3).map((cat, i) => (
                                            <span key={i}>
                                                {cat.name}
                                                {i < Math.min(detail.category.length - 1, 2) && " • "}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Modal chi tiết */}
            <AnimatePresence>
                {showModal && detail && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.8, y: 50 }}
                            className="relative w-full max-w-[900px] bg-zinc-900 rounded-xl overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Hero Section */}
                            <div className="relative h-[500px]">
                                <img
                                    src={getMovieImageUrl(movie)}
                                    alt={detail.name}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />

                                <button
                                    onClick={() => setShowModal(false)}
                                    className="absolute top-4 right-4 w-10 h-10 bg-black/70 rounded-full hover:bg-black flex items-center justify-center transition-colors"
                                >
                                    <span className="text-white text-2xl">×</span>
                                </button>

                                <div className="absolute bottom-8 left-8 space-y-4">
                                    <h1 className="text-4xl font-bold text-white">{detail.name}</h1>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handlePlay}
                                            className="px-8 py-3 bg-white text-black rounded font-bold hover:bg-gray-200 flex items-center gap-2 transition-colors"
                                        >
                                            <Play className="w-6 h-6" fill="currentColor" />
                                            Phát
                                        </button>
                                        <button className="px-6 py-3 bg-gray-700/80 text-white rounded hover:bg-gray-600 flex items-center gap-2 transition-colors">
                                            <Plus className="w-6 h-6" />
                                            Danh sách
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="p-8">
                                <div className="grid grid-cols-3 gap-8">
                                    {/* Mô tả */}
                                    <div className="col-span-2 space-y-4">
                                        <div className="flex gap-4 text-base">
                                            {detail.year && (
                                                <span className="text-green-400 font-semibold">{detail.year}</span>
                                            )}
                                            {detail.episode_total && (
                                                <span className="text-gray-400">{detail.episode_total} tập</span>
                                            )}
                                            {detail.quality && (
                                                <span className="px-2 py-1 bg-gray-700 rounded text-sm">
                                                    {detail.quality}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-gray-300 leading-relaxed">
                                            {detail.content || "Không có mô tả."}
                                        </p>
                                    </div>

                                    {/* Metadata */}
                                    <div className="space-y-3 text-sm">
                                        {detail.origin_name && (
                                            <div>
                                                <span className="text-gray-400">Tên gốc: </span>
                                                <span className="text-gray-300">{detail.origin_name}</span>
                                            </div>
                                        )}
                                        {detail.actor?.[0] !== "Đang cập nhật" && (
                                            <div>
                                                <span className="text-gray-400">Diễn viên: </span>
                                                <span className="text-gray-300">{detail.actor?.join(", ")}</span>
                                            </div>
                                        )}
                                        {detail.director?.[0] !== "Đang cập nhật" && (
                                            <div>
                                                <span className="text-gray-400">Đạo diễn: </span>
                                                <span className="text-gray-300">{detail.director?.join(", ")}</span>
                                            </div>
                                        )}
                                        {detail.category && (
                                            <div>
                                                <span className="text-gray-400">Thể loại: </span>
                                                <span className="text-gray-300">
                                                    {detail.category.map(c => c.name).join(", ")}
                                                </span>
                                            </div>
                                        )}
                                        {detail.country && (
                                            <div>
                                                <span className="text-gray-400">Quốc gia: </span>
                                                <span className="text-gray-300">
                                                    {detail.country.map(c => c.name).join(", ")}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}