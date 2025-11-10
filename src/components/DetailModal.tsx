import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PlayerControlButton from "./PlayerControlButton";
import PlayButton from "./PlayButton";
import AgeLimitChip from "./AgeLimitChip";
import QualityChip from "./QualityChip";
import SimilarVideoCard from "./SimilarVideoCard";
import MaxLineTypography from "./MaxLineTypography";
import { formatMinuteToReadable, getRandomNumber } from "src/utils/common";
import { useDetailModal } from "src/providers/DetailModalProvider";
import { useSimilarVideos } from "src/hooks/useSimilarVideos";
import { KKPhimDetailResponse, KKPhimMovie } from "src/types/KKPhim";
import { useNavigate } from "react-router-dom";
//favorites imports
import { useUser } from "@clerk/clerk-react";
import { toast } from "react-hot-toast";
import supabase from "src/utils/supabase";
import { handleFavoriteClick } from "src/hooks/useFavoritesAction";
//likes 
export default function DetailModal() {
  const { detail, setDetailType } = useDetailModal();
  const navigate = useNavigate();
  const movie: KKPhimDetailResponse["movie"] | undefined =
    detail.mediaDetail?.movie;

  const { data: similarVideos } = useSimilarVideos(
    movie
      ? {
        categorySlug: movie.category?.[0]?.slug,
        countrySlug: movie.country?.[0]?.slug,
        year: movie.year,
      }
      : {}
  );

  const playerRef = useRef<any>(null);
  const [muted, setMuted] = useState(true);
  const { user } = useUser();
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const checkFavorite = async () => {
      if (!user?.id || !movie?._id) return;
      const { data } = await supabase
        .from("user_movies")
        .select("id")
        .eq("user_id", user.id)
        .eq("movie_id", movie._id)
        .eq("relation_type", "favorite")
        .maybeSingle();
      setIsFavorite(!!data);
    };
    checkFavorite();
  }, [user, movie]);


  const handleFavorites = async () => {
    if (!user?.id) {
      toast.error("Vui lòng đăng nhập để thêm vào danh sách yêu thích");
      return;
    }

    const { added } = await handleFavoriteClick(user.id, {
      slug: movie!.slug,
      title: movie!.name,
    });

    setIsFavorite(added);
    window.dispatchEvent(new Event("favoriteUpdated"));
  };

  const handleReady = useCallback((player: any) => {
    playerRef.current = player;
    setMuted(player.muted() ?? true);
  }, []);

  const handleMute = useCallback((status: boolean) => {
    if (playerRef.current) {
      playerRef.current.muted(!status);
      setMuted(!status);
    }
  }, []);

  if (!movie) return null;

  return (
    <AnimatePresence>
      {detail.mediaDetail && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 overflow-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full max-w-4xl bg-[#181818] rounded-md"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
          >
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 p-2 bg-[#181818] rounded hover:bg-gray-700"
              onClick={() => setDetailType({ id: undefined })}
            >
              ✕
            </button>

            {/* Movie Info */}
            <div className="px-4 sm:px-6 md:px-10 mt-4">
              <MaxLineTypography maxLine={1} className="text-2xl sm:text-3xl font-bold text-white mb-2">
                {movie.name}
              </MaxLineTypography>

              {/* Control Buttons */}
              <div className="flex items-center mb-4 space-x-2">
                <PlayButton className="text-black py-0" onClick={() => navigate(`/watch/${movie.slug}`)} />
                <PlayerControlButton>
                  {/* Add Icon */}
                  +
                </PlayerControlButton>
                <PlayerControlButton onClick={handleFavorites}>
                  {/* ThumbUp Icon */}
                  👍
                </PlayerControlButton>
                <div className="flex-grow" />
                <PlayerControlButton onClick={() => handleMute(muted)}>
                  {!muted ? "🔊" : "🔇"}
                </PlayerControlButton>
              </div>

              {/* Movie Details */}
              <div className="flex flex-wrap items-center gap-2 mb-2 text-white">
                <span className="text-green-500">{`${getRandomNumber(100)}% Match`}</span>
                <span>{movie.year}</span>
                <AgeLimitChip>{`${getRandomNumber(20)}+`}</AgeLimitChip>
                <span>{formatMinuteToReadable(getRandomNumber(180))}</span>
                <QualityChip>{movie.quality}</QualityChip>
              </div>

              <MaxLineTypography maxLine={3} className="text-white mt-2">
                {movie.content}
              </MaxLineTypography>

              {/* Additional Info */}
              <div className="mt-4 text-white space-y-1">
                <p>{`Thể loại: ${movie.category.map((c) => c.name).join(", ")}`}</p>
                <p>{`Quốc gia: ${movie.country.map((c) => c.name).join(", ")}`}</p>
                <p>{`Ngôn ngữ: ${movie.lang}`}</p>
              </div>

              {/* Similar Videos */}
              {similarVideos?.data?.items?.length ? (
                <div className="mt-6 px-2 sm:px-3 md:px-5">
                  <h3 className="text-lg text-white mb-2">More Like This</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {similarVideos.data.items.map((sm: KKPhimMovie) => (
                      <SimilarVideoCard key={sm._id} video={sm} />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
