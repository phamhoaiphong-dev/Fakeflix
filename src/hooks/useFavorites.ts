import supabase from "../utils/supabase";

export async function addToFavorites(userId: string, movie: any) {
  return await supabase.from("user_movies").insert({
    user_id: userId,
    movie_id: movie.slug, // ✅ Lưu slug thay vì id
    movie_name: movie.name || movie.title,
    relation_type: "favorite",
  });
}

export async function removeFromFavorites(userId: string, movieSlug: string) {
  return await supabase
    .from("user_movies")
    .delete()
    .eq("user_id", userId)
    .eq("movie_id", movieSlug) // ✅ Dùng slug
    .eq("relation_type", "favorite");
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
  //HELPER
export async function isFavorite(userId: string, movieSlug: string) {
  const { data } = await supabase
    .from("user_movies")
    .select("id")
    .eq("user_id", userId)
    .eq("movie_id", movieSlug)
    .eq("relation_type", "favorite")
    .maybeSingle();
  
  return !!data;
}