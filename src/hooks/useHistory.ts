// src/hooks/useHistory.ts
import { useEffect, useState, useCallback } from "react";
import supabase from "src/utils/supabase";
import { useUser } from "@clerk/clerk-react";
import { toast } from "react-hot-toast";

const HISTORY_TYPE = "history" as const;

const historyCache = new Map<string, { currentTime: number; progress: number }>();

const getCacheKey = (movieSlug?: string, episodeSlug?: string) =>
  `${movieSlug || ""}|||${episodeSlug || "single"}`;

export function useHistory(movieSlug?: string, episodeSlug?: string) {
  const { user } = useUser();
  const userId = user?.id;

  const [isInHistory, setIsInHistory] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId || !movieSlug) {
      setIsInHistory(false);
      setProgress(0);
      setCurrentTime(0);
      return;
    }

    const cacheKey = getCacheKey(movieSlug, episodeSlug);
    const cached = historyCache.get(cacheKey);

    if (cached) {
      setCurrentTime(cached.currentTime);
      setProgress(cached.progress);
      setIsInHistory(cached.currentTime > 0 || cached.progress > 0);
    }

    const fetchHistory = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from("user_movies")
          .select("id, progress, current_time, duration")
          .eq("user_id", userId)
          .eq("movie_id", movieSlug)
          .eq("relation_type", HISTORY_TYPE);

        if (episodeSlug) {
          query = query.eq("episode_slug", episodeSlug);
        } else {
          query = query.is("episode_slug", null);
        }

        const { data, error } = await query.maybeSingle();

        if (error && error.code !== "PGRST116") throw error;

        const newTime = data?.current_time || 0;
        const newProgress = data?.progress || 0;

        // Cập nhật cache
        historyCache.set(cacheKey, {
          currentTime: newTime,
          progress: newProgress,
        });

        setCurrentTime(newTime);
        setProgress(newProgress);
        setIsInHistory(!!data);
      } catch (err) {
        console.error("[useHistory] Lỗi fetch history:", err);
        setCurrentTime(0);
        setProgress(0);
        setIsInHistory(false);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();

    const handler = () => fetchHistory();
    window.addEventListener("historyUpdated", handler);
    return () => window.removeEventListener("historyUpdated", handler);
  }, [userId, movieSlug, episodeSlug]);

  const saveProgress = useCallback(
    async (params: {
      currentTime: number;
      duration: number;
      movie: {
        title?: string;
        name?: string;
        slug: string;
        poster_path?: string;
      };
      episodeSlug?: string;
      isLastEpisode?: boolean;
    }) => {
      if (!userId || !movieSlug) return;

      const duration = params.duration > 0 && params.duration !== Infinity ? Math.floor(params.duration) : null;
      if (!duration) return;

      const current = Math.floor(params.currentTime);
      const progressPercent = Math.min(Math.round((current / duration) * 100), 100);
      const COMPLETION_THRESHOLD = 98;
      if (progressPercent >= COMPLETION_THRESHOLD) {
        try {
          let query = supabase
            .from("user_movies")
            .delete()
            .eq("user_id", userId)
            .eq("movie_id", movieSlug)
            .eq("relation_type", HISTORY_TYPE);

          if (params.episodeSlug) {
            query = query.eq("episode_slug", params.episodeSlug);
          } else {
            query = query.is("episode_slug", null);
          }
          await query;
          if (params.isLastEpisode) {
            await supabase
              .from("user_movies")
              .delete()
              .eq("user_id", userId)
              .eq("movie_id", movieSlug)
              .eq("relation_type", HISTORY_TYPE);
          }
          for (const key of Array.from(historyCache.keys())) {
            if (key.startsWith(`${movieSlug}|||`)) {
              historyCache.delete(key);
            }
          }
          setCurrentTime(0);
          setProgress(0);
          setIsInHistory(false);

          window.dispatchEvent(new Event("historyUpdated"));
        } catch (err) {
          console.error("Lỗi xóa phim đã hoàn thành:", err);
        }
        return;
      }
      const MIN_SECONDS = 90;        // ít nhất 90 giây
      const MIN_PERCENTAGE = 10;     // hoặc ít nhất 10%

      const watchedSeconds = Math.floor(current);
      const watchedPercentage = duration > 0 ? (current / duration) * 100 : 0;

      if (watchedSeconds < MIN_SECONDS && watchedPercentage < MIN_PERCENTAGE) {
        return;
      }

      if (watchedSeconds < 10 && watchedPercentage < 2) {
        try {
          let query = supabase
            .from("user_movies")
            .delete()
            .eq("user_id", userId)
            .eq("movie_id", movieSlug)
            .eq("relation_type", HISTORY_TYPE);

          if (params.episodeSlug) {
            query = query.eq("episode_slug", params.episodeSlug);
          } else {
            query = query.is("episode_slug", null);
          }
          await query;
          window.dispatchEvent(new Event("historyUpdated"));
        } catch (err) {
          console.error("Lỗi xóa history rác:", err);
        }
        return;
      }
      try {
        const payload = {
          user_id: userId,
          movie_id: movieSlug,
          movie_name: params.movie.title || params.movie.name || "Phim này",
          poster_path: params.movie.poster_path || null,
          relation_type: HISTORY_TYPE,
          episode_slug: params.episodeSlug || null,
          current_time: current,
          duration,
          progress: progressPercent,
          last_watched_at: new Date().toISOString(),
        };

        const { error } = await supabase
          .from("user_movies")
          .upsert(payload, {
            onConflict: "user_id,movie_id,relation_type,episode_slug",
            ignoreDuplicates: false,
          });

        if (error) throw error;

        const cacheKey = getCacheKey(movieSlug, params.episodeSlug);
        historyCache.set(cacheKey, { currentTime: current, progress: progressPercent });

        setCurrentTime(current);
        setProgress(progressPercent);
        setIsInHistory(true);

        window.dispatchEvent(new Event("historyUpdated"));
      } catch (err) {
        console.error("Lỗi lưu tiến độ:", err);
      }
    },
    [userId, movieSlug]
  );


  const removeFromHistory = useCallback(async () => {
    if (!userId || !movieSlug || !isInHistory) return;

    try {
      let query = supabase
        .from("user_movies")
        .delete()
        .eq("user_id", userId)
        .eq("movie_id", movieSlug)
        .eq("relation_type", HISTORY_TYPE);

      if (episodeSlug) {
        query = query.eq("episode_slug", episodeSlug);
      } else {
        query = query.is("episode_slug", null);
      }

      await query;

      const cacheKey = getCacheKey(movieSlug, episodeSlug);
      historyCache.delete(cacheKey);

      setIsInHistory(false);
      setProgress(0);
      setCurrentTime(0);
      toast.success("Đã xóa khỏi xem tiếp");
      window.dispatchEvent(new Event("historyUpdated"));
    } catch (err) {
      toast.error("Lỗi khi xóa");
    }
  }, [userId, movieSlug, episodeSlug, isInHistory]);

  return {
    isInHistory,
    progress,
    currentTime,
    loading,
    saveProgress,
    removeFromHistory,
  };
}

export async function getContinueWatching(userId: string) {
  const { data } = await supabase
    .from("user_movies")
    .select(`
      id,
      movie_id,
      movie_name,
      poster_path,
      progress,
      current_time,
      duration,
      episode_slug,
      last_watched_at
    `)
    .eq("user_id", userId)
    .eq("relation_type", "history")
    .order("last_watched_at", { ascending: false })
    .limit(30);

  return data || [];
}