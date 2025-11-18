// src/hooks/useWatchList.ts
import { useEffect, useState } from "react";
import supabase from "src/utils/supabase";
import { useUser } from "@clerk/clerk-react";
import { toast } from "react-hot-toast";

export function useWatchList(movieSlug?: string) {
  const { user } = useUser();
  const userId = user?.id;

  const [isInWatchList, setIsInWatchList] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId || !movieSlug) {
      setIsInWatchList(false);
      return;
    }

    const fetchStatus = async () => {
      setLoading(true);
      
      const { data } = await supabase
        .from("user_movies")
        .select("id")
        .eq("user_id", userId)
        .eq("movie_id", movieSlug)
        .eq("relation_type", "watchlist")
        .maybeSingle();

      setIsInWatchList(!!data?.id);
      setLoading(false);
    };

    fetchStatus();

    const handler = () => fetchStatus();
    window.addEventListener("watchlistUpdated", handler);

    return () => window.removeEventListener("watchlistUpdated", handler);
  }, [userId, movieSlug]);

  const toggleWatchList = async (movie: { title?: string; name?: string; slug: string }) => {
    if (!userId || !movieSlug) {
      toast.error("Cần đăng nhập để thêm/xóa");
      return { added: false };
    }

    if (loading) return { added: false };

    setLoading(true);
    const movieName = movie.title || movie.name || "Phim này";

    try {
      let added = false;

      if (isInWatchList) {
        const { data: existing } = await supabase
          .from("user_movies")
          .select("id")
          .eq("user_id", userId)
          .eq("movie_id", movieSlug)
          .eq("relation_type", "watchlist")
          .maybeSingle();

        if (existing?.id) {
          await supabase.from("user_movies").delete().eq("id", existing.id);
          setIsInWatchList(false);
          toast.success("Đã xóa khỏi danh sách xem sau");
        }
      } else {
        const { data: alreadyExists } = await supabase
          .from("user_movies")
          .select("id")
          .eq("user_id", userId)
          .eq("movie_id", movieSlug)
          .eq("relation_type", "watchlist")
          .maybeSingle();

        if (alreadyExists?.id) {
          setIsInWatchList(true);
          added = false;
        } else {
          const { error } = await supabase.from("user_movies").insert({
            user_id: userId,
            movie_id: movieSlug,
            movie_name: movieName,
            relation_type: "watchlist",
          });

          if (error?.code === "23505") {
            setIsInWatchList(true);
          } else if (error) {
            throw error;
          } else {
            setIsInWatchList(true);
            toast.success("Đã thêm vào danh sách xem sau");
            added = true;
          }
        }
      }

      window.dispatchEvent(new Event("watchlistUpdated"));
      return { added };
    } catch (err: any) {
      console.error("WatchList error:", err);
      toast.error("Có lỗi xảy ra, thử lại nhé!");
      return { added: false };
    } finally {
      setLoading(false);
    }
  };

  return { isInWatchList, loading, toggleWatchList };
}

export async function getWatchList(userId: string) {
  const { data } = await supabase
    .from("user_movies")
    .select("*")
    .eq("user_id", userId)
    .eq("relation_type", "watchlist")
    .order("added_at", { ascending: false });

  return data || [];
}