import supabase from "../utils/supabase";

export async function addToFavorites(userId: string, movie: any) {
  return await supabase.from("user_movies").insert({
    user_id: userId,
    movie_id: movie.id,
    movie_name: movie.title,
    relation_type: "favorite",
  });
}

export async function removeFromFavorites(userId: string, movieId: string) {
  return await supabase
    .from("user_movies")
    .delete()
    .eq("user_id", userId)
    .eq("movie_id", movieId)
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
