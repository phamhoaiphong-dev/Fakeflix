import { useMovieDetail, useRecommendMovies } from "src/hooks/useMovieDetail";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, X, ChevronDown } from "lucide-react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

export default function WatchPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, error } = useMovieDetail(slug);
  const navigate = useNavigate();

  const [selectedServer, setSelectedServer] = useState(0);
  const [selectedEpisode, setSelectedEpisode] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [showEpisodes, setShowEpisodes] = useState(false);
  const [relatedSeasons, setRelatedSeasons] = useState<any[]>([]);

  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const videoRef = useRef<HTMLIFrameElement | null>(null);

  const movie = data?.movie;
  const episodes = data?.episodes;
  const currentEpisode = episodes?.[selectedServer]?.server_data?.[selectedEpisode];
  const { data: similarMovies } = useRecommendMovies(movie?.category?.[0]?._id);

  // Fetch related seasons/parts based on TMDB ID
  useEffect(() => {
    const fetchRelatedSeasons = async () => {
      if (!movie?.tmdb?.id) return;

      try {
        const response = await axios.get(`https://phimapi.com/v1/api/tim-kiem`, {
          params: {
            keyword: movie.origin_name.replace(/\s*\(.*?\)\s*/g, '').trim(),
            limit: 50
          }
        });

        if (response.data?.data?.items) {
          // Filter movies with same TMDB ID and sort by season
          const seasons = response.data.data.items
            .filter((item: any) => item.tmdb?.id === movie.tmdb?.id)
            .sort((a: any, b: any) => {
              const seasonA = a.tmdb?.season || 0;
              const seasonB = b.tmdb?.season || 0;
              return seasonA - seasonB;
            });

          setRelatedSeasons(seasons);
        }
      } catch (error) {
        console.error('Error fetching related seasons:', error);
      }
    };

    fetchRelatedSeasons();
  }, [movie]);

  // Giả sử movie có trường seasons hoặc related_seasons
  const seasons = movie?.seasons || movie?.related_seasons || [];
  const currentSeason = movie?.current_season || 1;

  // Auto-hide controls after 3 seconds
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = setTimeout(() => {
        if (!showEpisodes) setShowControls(false);
      }, 3000);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, [showEpisodes]);

  const goToNextEpisode = () => {
    const totalEpisodes = episodes?.[selectedServer]?.server_data?.length || 0;
    if (selectedEpisode < totalEpisodes - 1) {
      setSelectedEpisode(selectedEpisode + 1);
    }
  };

  if (isLoading)
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black">
        <div className="relative">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-800 border-t-red-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-red-600 rounded"></div>
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black text-white text-center p-4">
        <div className="max-w-md">
          <div className="text-6xl mb-6">😕</div>
          <h2 className="text-3xl font-bold mb-3">Rất tiếc</h2>
          <p className="text-gray-400 mb-6">Chúng tôi không thể tải nội dung này. Vui lòng thử lại sau.</p>
          <button
            onClick={() => navigate("/browse")}
            className="bg-white text-black hover:bg-gray-200 px-8 py-3 rounded font-semibold transition"
          >
            Quay về trang chủ
          </button>
        </div>
      </div>
    );

  if (!movie) return null;

  return (
    <div className="relative w-full h-screen bg-black text-white overflow-hidden">
      {currentEpisode?.link_embed ? (
        <div className="relative w-full h-full">
          {/* Video iframe - full screen, no pointer-events blocking */}
          <iframe
            ref={videoRef}
            src={currentEpisode.link_embed}
            className="absolute inset-0 w-full h-full"
            allow="autoplay; encrypted-media; picture-in-picture"
            sandbox="allow-scripts allow-same-origin allow-presentation"
            allowFullScreen
            title={`${movie.name} - ${currentEpisode.name}`}
          />

          {/* Top bar - không che player */}
          <AnimatePresence>
            {showControls && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-0 left-0 right-0 z-50 pointer-events-none"
              >
                <div className="bg-gradient-to-b from-black/80 via-black/40 to-transparent p-6">
                  <div className="flex justify-between items-start pointer-events-auto">
                    <button
                      onClick={() => navigate(-1)}
                      className="flex items-center gap-2 bg-black/60 hover:bg-black/80 backdrop-blur-sm px-4 py-2.5 rounded-lg transition group"
                    >
                      <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                      <span className="font-semibold">Quay lại</span>
                    </button>

                    <button
                      onClick={() => setShowEpisodes(!showEpisodes)}
                      className="flex items-center gap-2 bg-black/60 hover:bg-black/80 backdrop-blur-sm px-4 py-2.5 rounded-lg transition font-semibold"
                    >
                      Tập phim
                      <ChevronDown className={`w-4 h-4 transition-transform ${showEpisodes ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Episodes sidebar */}
          <AnimatePresence>
            {showEpisodes && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowEpisodes(false)}
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50"
                />

                {/* Sidebar */}
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "tween", duration: 0.3 }}
                  className="absolute top-0 right-0 bottom-0 w-full sm:w-[450px] bg-[#141414] z-50 overflow-y-auto shadow-2xl scrollbar-hide "
                >
                  <div className="sticky top-0 bg-[#141414] border-b border-gray-800 z-10">
                    <div className="p-6 flex justify-between items-center">
                      <div>
                        <h2 className="text-2xl font-bold mb-1">{movie.name}</h2>
                        <p className="text-sm text-gray-400">
                          {episodes?.[selectedServer]?.server_data?.length || 0} tập
                        </p>
                      </div>
                      <button
                        onClick={() => setShowEpisodes(false)}
                        className="hover:bg-white/10 p-2 rounded-full transition"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    {/* Server selector */}
                    {episodes && episodes.length > 1 && (
                      <div className="px-6 pb-4 border-b border-gray-800">
                        <label className="text-xs text-gray-400 mb-2 block uppercase tracking-wider">
                          Chọn Server
                        </label>
                        <div className="flex gap-2 flex-wrap">
                          {episodes.map((server, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setSelectedServer(idx);
                                setSelectedEpisode(0);
                              }}
                              className={`px-4 py-2 rounded-md font-semibold transition ${selectedServer === idx
                                ? "bg-red-600 text-white"
                                : "bg-white/10 hover:bg-white/20 text-gray-300"
                                }`}
                            >
                              {server.server_name?.match(/\((.*?)\)/)?.[1] || server.server_name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Related seasons/parts */}
                    {relatedSeasons.length > 1 && (
                      <div className="px-6 py-4 border-b border-gray-800">
                        <label className="text-xs text-gray-400 mb-3 block uppercase tracking-wider">
                          Các phần khác
                        </label>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {relatedSeasons.map((season) => (
                            <button
                              key={season._id}
                              onClick={() => {
                                if (season.slug !== slug) {
                                  navigate(`/watch/${season.slug}`);
                                }
                              }}
                              className={`w-full text-left p-3 rounded-lg transition group flex items-center gap-3 ${season._id === movie._id
                                ? "bg-red-600/20 border border-red-600"
                                : "bg-white/5 hover:bg-white/10"
                                }`}
                            >
                              <img
                                src={`https://phimimg.com/${season.poster_url}`}
                                alt={season.name}
                                className="w-12 h-16 object-cover rounded"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm truncate">{season.name}</h4>
                                <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                                  <span>{season.year}</span>
                                  <span>•</span>
                                  <span>{season.episode_current}</span>
                                  {season._id === movie._id && (
                                    <>
                                      <span>•</span>
                                      <span className="text-red-400 font-semibold">Đang xem</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Episodes list */}
                  <div className="p-6 space-y-2">
                    {episodes?.[selectedServer]?.server_data?.map((episode, idx) => (
                      <motion.button
                        key={idx}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setSelectedEpisode(idx);
                          setShowEpisodes(false);
                        }}
                        className={`w-full text-left p-4 rounded-lg transition group relative overflow-hidden  ${selectedEpisode === idx
                          ? "bg-red-600/20 border-2 border-red-600"
                          : "bg-white/5 hover:bg-white/10 border-2 border-transparent"
                          }`}
                      >
                        {/* Episode number badge */}
                        <div className="flex items-start gap-4">
                          <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-2xl font-bold transition ${selectedEpisode === idx
                            ? 'bg-red-600 text-white'
                            : 'bg-white/10 text-gray-400 group-hover:bg-white/20 group-hover:text-white'
                            }`}>
                            {idx + 1}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base mb-1 line-clamp-2">
                              {episode.name}
                            </h3>

                            {selectedEpisode === idx && (
                              <div className="flex items-center gap-2 text-xs text-red-400 font-semibold">
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                Đang phát
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Hover effect */}
                        <div className={`absolute inset-0 bg-gradient-to-r from-transparent to-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`} />
                      </motion.button>
                    ))}
                  </div>

                  {/* Next episode suggestion at bottom */}
                  {selectedEpisode < (episodes?.[selectedServer]?.server_data?.length || 0) - 1 && (
                    <div className="sticky bottom-0 bg-gradient-to-t from-[#141414] via-[#141414] to-transparent p-6 pt-8">
                      <button
                        onClick={() => {
                          goToNextEpisode();
                          setShowEpisodes(false);
                        }}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-lg transition flex items-center justify-center gap-2"
                      >
                        Tập tiếp theo
                        <ChevronDown className="w-5 h-5 -rotate-90" />
                      </button>
                    </div>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🎬</div>
            <p className="text-xl text-gray-400">Không có video khả dụng</p>
          </div>
        </div>
      )}
    </div>
  );
}