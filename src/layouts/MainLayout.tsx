import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { MAIN_PATH } from "src/constant";
import { Footer, MainHeader } from "src/components/layouts";
import { useEffect } from "react";
import { syncUserToSupabase } from "src/lib/sycnUserFromClerkToSupaBase";
import useSyncUser from "src/hooks/useSyncUser";

export default function MainLayout() {
  const { user, isSignedIn, isLoaded } = useUser();
  const location = useLocation();

  // ⏳ 1. Chờ Clerk load xong
  if (!isLoaded) {
    return (
      <div className="w-full min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  // 🔁 2. Sync user với Supabase
  useEffect(() => {
    if (isSignedIn && user) {
      syncUserToSupabase(user);
    }
  }, [isSignedIn, user?.id, user?.updatedAt]);
  useSyncUser();


  const isAuthPage =
    location.pathname === "/sign-in" || location.pathname === "/sign-up";

  // 🚪 3. Nếu chưa đăng nhập + không ở trang auth → /sign-in
  if (!isSignedIn && !isAuthPage) {
    return <Navigate to="/sign-in" replace />;
  }

  // 🏠 4. Nếu đã đăng nhập + đang ở trang auth → về trang chủ
  if (isSignedIn && isAuthPage) {
    return <Navigate to={`/${MAIN_PATH.browse}`} replace />;
  }

  // 🔐 5. Nếu là trang auth
  if (isAuthPage) {
    return (
      <div className="w-full min-h-screen bg-black flex items-center justify-center">
        <Outlet />
      </div>
    );
  }

  // 🎬 6. Nếu đã đăng nhập → render app
  return (
    <div className="w-full min-h-screen bg-black px-0">
      <MainHeader />
      <Outlet />
      {!location.pathname.startsWith(`/${MAIN_PATH.watch}`) && <Footer />}
    </div>
  );
}
