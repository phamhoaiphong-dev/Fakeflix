import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, Plus, ThumbsUp, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useMovieDetail } from "../../hooks/useMovieDetail";

export default function WatchOverlay() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedServer, setSelectedServer] = useState(0);

  const episodeSlug = searchParams.get("ep");
  const { data: detail, isLoading, error } = useMovieDetail(slug);

  // Tìm episode hiện tại
  const currentEpisode = useMemo(() => {
    if (!detail?.episodes?.[selectedServer]) return null;
    const serverData = detail.episodes[selectedServer].server_data;
    return episodeSlug
      ? serverData.find(ep => ep.slug === episodeSlug) || serverData[0]
      : serverData[0];
  }, [detail, selectedServer, episodeSlug]);

  const handlePlay = () => {
    const epParam = currentEpisode ? `?ep=${encodeURIComponent(currentEpisode.slug)}` : "";
    navigate(`/watch/${slug}${epParam}&fullscreen=true`);
  };

  const handleEpisodeClick = (epSlug: string) => {
    navigate(`/browse/${slug}?ep=${encodeURIComponent(epSlug)}`);
  };


  // Loading
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
        <div className="text-white text-xl">Đang tải...</div>
      </div>
    );
  }

  // Error
  if (error || !detail?.movie) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">
            {error ? "Lỗi khi tải phim" : "Không tìm thấy phim"}
          </div>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  const { movie, episodes = [] } = detail;
  console.log("Movie detail in Overlay:", movie);


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm overflow-y-auto"
      onClick={() => navigate(-1)}
    >
      <div className="flex items-center justify-center min-h-screen p-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 50 }}
          className="relative w-full max-w-[900px] bg-zinc-900 rounded-lg overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 right-4 z-20 w-10 h-10 bg-zinc-800/90 hover:bg-zinc-700 rounded-full flex items-center justify-center"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Hero Section */}
          <div className="relative aspect-video">
            <img
              src={movie.thumb_url || movie.poster_url}
              alt={movie.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />

            {/* Title + Actions */}
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
                {movie.name}
              </h1>

              {movie.origin_name && movie.origin_name !== movie.name && (
                <p className="text-gray-300 text-sm md:text-base mb-3">
                  {movie.origin_name}
                </p>
              )}

              {currentEpisode && (
                <p className="text-emerald-400 font-semibold mb-3">
                  Đang xem: {currentEpisode.name}
                </p>
              )}

              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={handlePlay}
                  className="flex items-center px-6 py-2.5 bg-white text-black rounded font-bold hover:bg-gray-200"
                >
                  <Play className="w-5 h-5 mr-2" fill="currentColor" />
                  Phát
                </button>
                <button className="w-11 h-11 bg-zinc-800/80 rounded-full border-2 border-zinc-500 hover:border-white flex items-center justify-center">
                  <Plus className="w-6 h-6 text-white" />
                </button>
                <button className="w-11 h-11 bg-zinc-800/80 rounded-full border-2 border-zinc-500 hover:border-white flex items-center justify-center">
                  <ThumbsUp className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* Movie Info */}
          <div className="p-6 md:p-8 border-b border-zinc-800">
            <div className="flex items-center gap-4 text-sm mb-4 flex-wrap">
              <span className="text-emerald-400 font-bold">{movie.year}</span>             
              <span className="px-2 py-0.5 border border-zinc-500 text-zinc-300 text-xs font-semibold">
                {movie.quality}
              </span>
              <span className="text-zinc-300">{movie.lang}</span>
              {movie.episode_total && (
                <span className="text-zinc-300">
                  {movie.episode_current === movie.episode_total
                    ? `${movie.episode_total} tập`
                    : `${movie.episode_current}/${movie.episode_total}`}
                </span>
              )}
            </div>

            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              {movie.content}
            </p>

            {/* Metadata */}
            <div className="space-y-2 text-sm">
              {movie.actor?.[0] !== "Đang cập nhật" && (
                <div className="flex">
                  <span className="text-gray-500 w-24 flex-shrink-0">Diễn viên:</span>
                  <span className="text-white">{movie.actor?.join(", ")}</span>
                </div>
              )}

              {movie.director?.[0] !== "Đang cập nhật" && (
                <div className="flex">
                  <span className="text-gray-500 w-24 flex-shrink-0">Đạo diễn:</span>
                  <span className="text-white">{movie.director?.join(", ")}</span>
                </div>
              )}

              {movie.category?.length > 0 && (
                <div className="flex">
                  <span className="text-gray-500 w-24 flex-shrink-0">Thể loại:</span>
                  <div className="flex flex-wrap gap-2">
                    {movie.category.map((cat) => (
                      <span key={cat._id} className="text-white hover:underline cursor-pointer">
                        {cat.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {movie.country?.length > 0 && (
                <div className="flex">
                  <span className="text-gray-500 w-24 flex-shrink-0">Quốc gia:</span>
                  <span className="text-white">
                    {movie.country.map((c) => c.name).join(", ")}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Episodes */}
          {episodes.length > 0 && (
            <div className="p-6 md:p-8">
              <h3 className="text-white text-xl font-bold mb-4">Tập phim</h3>

              {/* Server Selector */}
              {episodes.length > 1 && (
                <div className="flex gap-2 mb-4 flex-wrap">
                  {episodes.map((server, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedServer(i)}
                      className={`px-4 py-2 rounded font-medium transition-colors ${selectedServer === i
                        ? "bg-red-600 text-white"
                        : "bg-zinc-800 text-gray-400 hover:bg-zinc-700"
                        }`}
                    >
                      {server.server_name}
                    </button>
                  ))}
                </div>
              )}

              {/* Episodes Grid */}
              {episodes[selectedServer] && (
                <div>
                  <p className="text-gray-400 text-sm mb-3">
                    {episodes[selectedServer].server_name}
                  </p>
                  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
                    {episodes[selectedServer].server_data.map((ep, j) => {
                      const isActive = currentEpisode?.slug === ep.slug;
                      return (
                        <button
                          key={j}
                          onClick={() => handleEpisodeClick(ep.slug)}
                          className={`aspect-square flex items-center justify-center rounded transition-all ${isActive
                            ? "bg-red-600 border-2 border-red-400"
                            : "bg-zinc-800 hover:bg-zinc-700 border-2 border-zinc-700 hover:border-white"
                            }`}
                        >
                          <span className="text-white font-semibold text-sm">
                            {ep.name.replace(/Tập\s*/i, "")}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}