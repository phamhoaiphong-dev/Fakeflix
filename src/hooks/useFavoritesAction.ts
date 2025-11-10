import supabase from "src/utils/supabase";
import { toast } from "react-hot-toast";

export async function handleFavoriteClick(userId: string, movie: { id: string; title: string }) {
  try {
    const { data: existing } = await supabase
      .from("user_movies")
      .select("id")
      .eq("user_id", userId)
      .eq("movie_id", movie?.id)
      .eq("relation_type", "favorite")
      .maybeSingle();

    if (existing) {
      await supabase.from("user_movies").delete().eq("id", existing.id);
      toast.error("Đã xóa khỏi danh sách yêu thích ❌");
      window.dispatchEvent(new Event("favoriteUpdated"));
      return { added: false };
    } else {
      await supabase.from("user_movies").insert({
        user_id: userId,
        movie_id: movie.id,
        movie_name: movie.title,
        relation_type: "favorite",
      });
      toast.success("Đã thêm vào danh sách yêu thích ❤️");
      window.dispatchEvent(new Event("favoriteUpdated"));
      return { added: true };
    }
  } catch (err) {
    console.error("Lỗi khi cập nhật yêu thích:", err);
    toast.error("Không thể cập nhật danh sách yêu thích");
    return { added: false };
  }
}
