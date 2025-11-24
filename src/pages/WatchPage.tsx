import Hls, { HlsConfig, Events } from "hls.js";
import { useMovieDetail } from "src/hooks/useMovieDetail";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, X, ChevronDown } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useHistory } from "src/hooks/useHistory";

const normalizeEpisodeSlug = (slug?: string): string | undefined => {
  if (!slug) return undefined;
  const parts = slug.split("/");
  const lastPart = parts[parts.length - 1];
  const match = lastPart.match(/tap[-_]0*(\d+)/i);
  if (match) return `tap-${match[1].padStart(2, "0")}`;
  return lastPart || undefined;
};

export default function WatchPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const { data, isLoading, error } = useMovieDetail(slug);

  const normalizedEpParam = normalizeEpisodeSlug(searchParams.get("ep") ?? undefined);
  const { currentTime, saveProgress} = useHistory(slug, normalizedEpParam);

  const navigate = useNavigate();

  const [selectedServer, setSelectedServer] = useState(0);
  const [selectedEpisode, setSelectedEpisode] = useState<number | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [showEpisodes, setShowEpisodes] = useState(false);
  const [relatedSeasons, setRelatedSeasons] = useState<any[]>([]);
  const [isEpisodeReady, setIsEpisodeReady] = useState(false);

  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<any>(null);

  const lastSaveTimeRef = useRef<number>(0);
  const hasInitialSaveRef = useRef(false);
  const hasResumedRef = useRef(false);
  const pendingResumeTimeRef = useRef<number | null>(null); 

  const movie = data?.movie;
  const episodes = data?.episodes;

  const currentEpisode =
    selectedEpisode !== null && episodes?.[selectedServer]?.server_data?.[selectedEpisode]
      ? episodes[selectedServer].server_data[selectedEpisode]
      : null;

  useEffect(() => {
    if (!episodes || episodes.length === 0) {
      setIsEpisodeReady(false);
      return;
    }

    const epSlug = searchParams.get("ep");

    if (epSlug) {
      let found = false;
      for (let serverIdx = 0; serverIdx < episodes.length; serverIdx++) {
        const epIdx = episodes[serverIdx].server_data.findIndex((ep: any) =>
          normalizeEpisodeSlug(ep.slug) === normalizeEpisodeSlug(epSlug)
        );

        if (epIdx !== -1) {
          setSelectedServer(serverIdx);
          setSelectedEpisode(epIdx);
          setIsEpisodeReady(true);
          found = true;
          break;
        }
      }

      if (!found) {
        setSelectedServer(0);
        setSelectedEpisode(0);
        setIsEpisodeReady(true);
      }
    } else {
      setSelectedServer(0);
      setSelectedEpisode(0);
      setIsEpisodeReady(true);
    }
    hasInitialSaveRef.current = false;
    hasResumedRef.current = false;
    lastSaveTimeRef.current = 0;
  }, [episodes, searchParams]);

  useEffect(() => {
    const video = videoRef.current;

    if (!video || !currentTime || currentTime <= 0 || hasResumedRef.current) {
      return;
    }

    const attemptResume = () => {
      if (hasResumedRef.current) return;

      if (video.duration && !isNaN(video.duration) && video.duration > 0 && video.duration !== Infinity) {
        const safeTime = Math.min(currentTime, Math.max(0, video.duration - 1));

        console.log('[WatchPage] 🎯 Resuming to:', safeTime, 'from history currentTime:', currentTime);

        try {
          video.currentTime = safeTime;
          hasResumedRef.current = true;
          console.log('[WatchPage] ✅ Resume successful!');
        } catch (err) {
          console.error('[WatchPage] Resume failed:', err);
        }
      }
    };

    const onLoadedMetadata = () => {
      console.log('[WatchPage] Metadata loaded, attempting resume...');
      attemptResume();
    };

    const onCanPlay = () => {
      console.log('[WatchPage] Can play, attempting resume...');
      attemptResume();
    };

    const onDurationChange = () => {
      console.log('[WatchPage] Duration changed, attempting resume...');
      attemptResume();
    };

    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('durationchange', onDurationChange);

    if (video.readyState >= 1 && video.duration) {
      console.log('[WatchPage] Video already ready, attempting immediate resume...');
      attemptResume();
    }

    return () => {
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('durationchange', onDurationChange);
    };
  }, [currentTime, currentEpisode]); 

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentEpisode || !movie) return;

    const cleanSlug = normalizeEpisodeSlug(currentEpisode.slug);

    if (hlsRef.current) {
      try {
        hlsRef.current.destroy();
      } catch (e) { }
      hlsRef.current = null;
    }

    video.preload = "metadata";
    video.setAttribute("playsinline", "true");
    const previousMuted = video.muted;
    video.muted = true;

    const rawUrl = currentEpisode.link_m3u8?.startsWith("http")
      ? currentEpisode.link_m3u8
      : `https:${currentEpisode.link_m3u8}`;

    const src = `https://api.isme.io.vn/proxy/m3u8?url=${encodeURIComponent(rawUrl)}`;

    const hlsConfig: Partial<HlsConfig> = {
      maxBufferLength: 30,
      maxMaxBufferLength: 60,
      maxBufferSize: 60 * 1000 * 1000,
      abrEwmaFastLive: 3,
      abrEwmaSlowLive: 9,
      lowLatencyMode: false,
      autoStartLoad: true,
    };

    const attachListeners = () => {
      const onLoadedMetadata = () => {
           video.muted = previousMuted;
      };

      const onTimeUpdate = () => {
        if (!video.duration || video.duration === Infinity || isNaN(video.duration)) return;
        const now = Date.now();
        if (lastSaveTimeRef.current && now - lastSaveTimeRef.current < 5000) return;
        lastSaveTimeRef.current = now;

        saveProgress({
          currentTime: video.currentTime,
          duration: video.duration,
          movie: {
            title: movie.name,
            name: movie.origin_name,
            slug: movie.slug,
            poster_path: movie.poster_url,
          },
          episodeSlug: cleanSlug,
        });
      };

      video.addEventListener("loadedmetadata", onLoadedMetadata);
      video.addEventListener("timeupdate", onTimeUpdate);

      return () => {
        video.removeEventListener("loadedmetadata", onLoadedMetadata);
        video.removeEventListener("timeupdate", onTimeUpdate);
      };
    };

    if (Hls.isSupported()) {
      const hls = new Hls(hlsConfig as any);
      hlsRef.current = hls;

      let cleanupVideoListeners: (() => void) | null = null;

      const onManifestParsed = () => {
        console.log('[WatchPage] HLS manifest parsed');
        video.play().catch(() => { });
      };

      const onError = (event: string, data: any) => {
        console.warn("Hls error", event, data);
      };

      hls.on(Hls.Events.MANIFEST_PARSED, onManifestParsed);
      hls.on(Hls.Events.ERROR, onError as any);

      hls.loadSource(src);
      hls.attachMedia(video);

      cleanupVideoListeners = attachListeners();

      return () => {
        if (cleanupVideoListeners) cleanupVideoListeners();
        try { hls.off(Hls.Events.MANIFEST_PARSED, onManifestParsed); } catch (e) { }
        try { hls.destroy(); } catch (e) { }
        hlsRef.current = null;
      };
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      const cleanupVideoListeners = attachListeners();
      video.play().catch(() => { });

      return () => {
        if (cleanupVideoListeners) cleanupVideoListeners();
        try { video.pause(); } catch (e) { }
      };
    }

    return;
  }, [movie, currentEpisode]); 

  useEffect(() => {
    if (currentEpisode?.slug && slug) {
      const cleanSlug = normalizeEpisodeSlug(currentEpisode.slug);
      if (cleanSlug) window.history.replaceState(null, "", `/watch/${slug}?ep=${cleanSlug}`);
    }
  }, [currentEpisode?.slug, slug]);

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

  const goToNextEpisode = useCallback(() => {
    const total = episodes?.[selectedServer]?.server_data?.length || 0;
    if (selectedEpisode !== null && selectedEpisode < total - 1) setSelectedEpisode(selectedEpisode + 1);
  }, [episodes, selectedEpisode, selectedServer]);

  if (isLoading || !isEpisodeReady) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0.3, scale: 0.8 }}
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="text-red-600 text-7xl font-extrabold tracking-tighter"
          >
            N
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="mt-4 text-gray-400 text-sm tracking-widest"
          >
            NETFLIX
          </motion.p>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black text-white text-center p-4">
        <div className="max-w-md">
          <div className="text-6xl mb-6">😕</div>
          <h2 className="text-3xl font-bold mb-3">Rất tiếc</h2>
          <p className="text-gray-400 mb-6">Chúng tôi không thể tải nội dung này. Vui lòng thử lại sau.</p>
          <button onClick={() => navigate("/browse")} className="bg-white text-black hover:bg-gray-200 px-8 py-3 rounded font-semibold transition">
            Quay về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-black text-white overflow-hidden">
      {currentEpisode?.link_m3u8 ? (
        <div className="relative w-full h-full">
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-contain bg-black"
            controls
            autoPlay
            playsInline
          />
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
                  className="absolute top-0 right-0 bottom-0 w-full sm:w-[450px] bg-[#141414] z-50 overflow-y-auto shadow-2xl scrollbar-hide"
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
                        className={`w-full text-left p-4 rounded-lg transition group relative overflow-hidden ${selectedEpisode === idx
                          ? "bg-red-600/20 border-2 border-red-600"
                          : "bg-white/5 hover:bg-white/10 border-2 border-transparent"
                          }`}
                      >
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

                        <div className={`absolute inset-0 bg-gradient-to-r from-transparent to-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`} />
                      </motion.button>
                    ))}
                  </div>

                  {/* Next episode suggestion */}
                  {selectedEpisode !== null && selectedEpisode < (episodes?.[selectedServer]?.server_data?.length || 0) - 1 && (
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
            <p className="text-sm text-gray-500 mt-2">Debug: Server {selectedServer}, Episode {selectedEpisode}</p>
          </div>
        </div>
      )}
    </div>
  );
}