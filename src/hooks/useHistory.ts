// src/hooks/useHistory.ts
import { useEffect, useState } from "react";
import supabase from "src/utils/supabase";
import { useUser } from "@clerk/clerk-react";
import { toast } from "react-hot-toast";

const HISTORY_TYPE = "history" as const;

export function useHistory(movieSlug?: string, episodeSlug?: string) {
  const { user } = useUser();
  const userId = user?.id;

  const [isInHistory, setIsInHistory] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch trạng thái history của phim/tập hiện tại
  useEffect(() => {
    if (!userId || !movieSlug) {
      setIsInHistory(false);
      setProgress(0);
      setCurrentTime(0);
      return;
    }

    const fetchHistory = async () => {
      setLoading(true);

      const { data } = await supabase
        .from("user_movies")
        .select("id, progress, current_time")
        .eq("user_id", userId)
        .eq("movie_id", movieSlug)
        .eq("relation_type", HISTORY_TYPE)
        .is("episode_slug", episodeSlug ?? null)
        .maybeSingle();

      if (data) {
        setIsInHistory(true);
        setProgress(data.progress || 0);
        setCurrentTime(data.current_time || 0);
      } else {
        setIsInHistory(false);
        setProgress(0);
        setCurrentTime(0);
      }

      setLoading(false);
    };

    fetchHistory();

    const handler = () => fetchHistory();
    window.addEventListener("historyUpdated", handler);
    return () => window.removeEventListener("historyUpdated", handler);
  }, [userId, movieSlug, episodeSlug]);

  /**
   * Lưu tiến độ xem phim (gọi liên tục khi xem)
   */
  const saveProgress = async (params: {
    currentTime: number;
    duration: number;
    movie: {
      title?: string;
      name?: string;
      slug: string;
      poster_path?: string;
    };
    episodeSlug?: string;
  }) => {
    if (!userId || !movieSlug) return;

    const progressPercent = params.duration > 0 ? Math.round((params.currentTime / params.duration) * 100) : 0;

    try {
      await supabase.from("user_movies").upsert(
        {
          user_id: userId,
          movie_id: movieSlug,
          movie_name: params.movie.title || params.movie.name || "Phim này",
          poster_path: params.movie.poster_path || null,
          relation_type: HISTORY_TYPE,
          episode_slug: params.episodeSlug || null,
          current_time: Math.floor(params.currentTime),
          duration: Math.floor(params.duration),
          progress: progressPercent,
          last_watched_at: new Date().toISOString(),
        },
        { onConflict: "user_id,movie_id,relation_type,episode_slug" }
      );

      setIsInHistory(true);
      setProgress(progressPercent);
      setCurrentTime(Math.floor(params.currentTime));

      window.dispatchEvent(new Event("historyUpdated"));
    } catch (err) {
      console.error("Lỗi lưu tiến độ:", err);
    }
  };

  /**
   * Xóa khỏi lịch sử (nút X trên card Continue Watching)
   */
  const removeFromHistory = async () => {
    if (!userId || !movieSlug || !isInHistory) return;

    setLoading(true);
    try {
      await supabase
        .from("user_movies")
        .delete()
        .eq("user_id", userId)
        .eq("movie_id", movieSlug)
        .eq("relation_type", HISTORY_TYPE)
        .eq("episode_slug", episodeSlug ?? null);

      setIsInHistory(false);
      setProgress(0);
      setCurrentTime(0);
      toast.success("Đã xóa khỏi danh sách xem tiếp");
      window.dispatchEvent(new Event("historyUpdated"));
    } catch (err) {
      toast.error("Lỗi khi xóa");
    } finally {
      setLoading(false);
    }
  };

  return {
    isInHistory,
    progress,
    currentTime,
    loading,
    saveProgress,
    removeFromHistory,
  };
}

// Lấy danh sách Continue Watching cho trang chủ
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
    .gt("progress", 5)
    .order("last_watched_at", { ascending: false })
    .limit(20);

  return data || [];
}