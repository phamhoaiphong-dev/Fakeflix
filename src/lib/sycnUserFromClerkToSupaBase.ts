import supabase from "../utils/supabase";
import type { UserResource } from "@clerk/types";

export async function syncUserToSupabase(user: UserResource) {
  if (!user?.id) return;

  const payload = {
    clerk_id: user.id,
    email: user.primaryEmailAddress?.emailAddress ?? "",
    username: user.username || user.firstName || "User",
    avatar_url: user.imageUrl,
    role: "user",
    updated_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase
      .from("user_info")
      .upsert(
        [
          {
            ...payload,
            created_at: new Date().toISOString(),
          },
        ],
        { onConflict: "clerk_id" } 
      )
      .select()
      .single();

    if (error) {
      // console.error("❌ Lỗi khi upsert user:", error);
    } else {
      // console.log("✅ User đã được đồng bộ với Supabase:", data);
    }
  } catch (err) {
    // console.error("🚨 Lỗi không mong đợi khi sync user:", err);
  }
}
