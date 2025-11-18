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

  // TẤT CẢ CÁC HOOK PHẢI Ở ĐẦU, KHÔNG ĐƯỢC ĐẶT SAU IF/RETURN!
  useEffect(() => {
    if (isSignedIn && user) {
      syncUserToSupabase(user);
    }
  }, [isSignedIn, user?.id, user?.updatedAt]);

  useSyncUser(); // ← Dời lên đây là xong!

  // Sau tất cả hook mới được kiểm tra điều kiện
  if (!isLoaded) {
    return (
      <div className="w-full min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  const isAuthPage =
    location.pathname === "/sign-in" || location.pathname === "/sign-up";

  if (!isSignedIn && !isAuthPage) {
    return <Navigate to="/sign-in" replace />;
  }

  if (isSignedIn && isAuthPage) {
    return <Navigate to={`/${MAIN_PATH.browse}`} replace />;
  }

  if (isAuthPage) {
    return (
      <div className="w-full min-h-screen bg-black flex items-center justify-center">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-black px-0">
      <MainHeader />
      <Outlet />
      {!location.pathname.startsWith(`/${MAIN_PATH.watch}`) && <Footer />}
    </div>
  );
}