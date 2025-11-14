import { useEffect, useState } from "react";
import supabase from "src/utils/supabase";
import { useUser } from "@clerk/clerk-react";
import { toast } from "react-hot-toast";

export function useFavorites(movieSlug?: string) {
  const { user } = useUser();
  const userId = user?.id;

  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  // ------ CHECK FAVORITE ON MOUNT -------
  useEffect(() => {
    if (!userId || !movieSlug) return;

    const fetchStatus = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("user_movies")
        .select("id")
        .eq("user_id", userId)
        .eq("movie_id", movieSlug)
        .eq("relation_type", "favorite")
        .maybeSingle();

      setIsFavorite(!!data);
      setLoading(false);
    };

    fetchStatus();

    const handler = () => fetchStatus();
    window.addEventListener("favoriteUpdated", handler);

    return () => window.removeEventListener("favoriteUpdated", handler);
  }, [userId, movieSlug]);

  // ------- ADD-ONLY FAVORITE (KHÔNG REMOVE NỮA) ----------
  const toggleFavorite = async (movie: { title?: string; name?: string; slug: string }) => {
    if (!userId || !movieSlug) return;

    setLoading(true);

    const movieName = movie.title || movie.name || "Unknown";

    // Check existing
    const { data: existing } = await supabase
      .from("user_movies")
      .select("id")
      .eq("user_id", userId)
      .eq("movie_id", movieSlug)
      .eq("relation_type", "favorite")
      .maybeSingle();

    if (existing) {
      // ❗ Không xoá nữa — chỉ giữ trạng thái
      setIsFavorite(true);
      setLoading(false);
      return { added: false };
    }

    // ADD
    await supabase.from("user_movies").insert({
      user_id: userId,
      movie_id: movieSlug,
      movie_name: movieName,
      relation_type: "favorite",
    });

    setIsFavorite(true);
    toast.success("Đã thêm vào danh sách yêu thích ❤️");

    window.dispatchEvent(new Event("favoriteUpdated"));
    setLoading(false);
    return { added: true };
  };

  return {
    isFavorite,
    loading,
    toggleFavorite, 
  };
}

export async function getFavorites(userId: string) {
  const { data } = await supabase
    .from("user_movies")
    .select("*")
    .eq("user_id", userId)
    .eq("relation_type", "favorite")
    .order("added_at", { ascending: false });

  return data;
}
