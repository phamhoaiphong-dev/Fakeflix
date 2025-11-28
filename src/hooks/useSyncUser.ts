import { useUser } from "@clerk/clerk-react";
import { useEffect } from "react";
import { syncUserToSupabase } from "src/lib/sycnUserFromClerkToSupaBase";

export default function useSyncUser() {
  const { user, isSignedIn } = useUser();

  useEffect(() => {
    if (isSignedIn && user) {
      // console.log("🔄 Syncing Clerk user → Supabase...");
      syncUserToSupabase(user);
    }
  }, [isSignedIn, user?.id, user?.updatedAt]); 
}
