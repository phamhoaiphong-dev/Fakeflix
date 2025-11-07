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
    // 🔎 Kiểm tra xem user đã tồn tại chưa
    const { data: existingUser, error: fetchError } = await supabase
      .from("user-info")
      .select("id")
      .eq("clerk_id", user.id)
      .maybeSingle(); // ✅ dùng maybeSingle thay vì single

    if (fetchError) {
      console.error("⚠️ Lỗi khi kiểm tra user:", fetchError);
      return;
    }

    if (!existingUser) {
      // 🆕 Tạo mới
      const { error: insertError } = await supabase.from("user-info").insert([
        {
          ...payload,
          created_at: new Date().toISOString(),
        },
      ]);

      if (insertError) console.error("❌ Lỗi khi thêm user:", insertError);
      else console.log("✅ User mới đã được thêm vào Supabase.");
    } else {
      // 🔁 Cập nhật
      const { error: updateError } = await supabase
        .from("user-info")
        .update(payload)
        .eq("clerk_id", user.id);

      if (updateError)
        console.error("⚠️ Lỗi khi cập nhật user:", updateError);
      else console.log("♻️ User đã được cập nhật trong Supabase.");
    }
  } catch (err) {
    console.error("🚨 Lỗi khi sync user:", err);
  }
}
