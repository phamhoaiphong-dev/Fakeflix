import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { MAIN_PATH } from "src/constant";
import { Footer, MainHeader } from "src/components/layouts";

export default function MainLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const location = useLocation();

  // ⏳ 1. Chờ Clerk load xong (tránh redirect sớm)
  if (!isLoaded) {
    return (
      <div className="w-full min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  const isAuthPage =
    location.pathname === "/sign-in" || location.pathname === "/sign-up";

  // 🚪 2. Nếu chưa đăng nhập + không ở trang auth → chuyển sang /sign-in
  if (!isSignedIn && !isAuthPage) {
    return <Navigate to="/sign-in" replace />;
  }

  // 🏠 3. Nếu đã đăng nhập + đang ở /sign-in hoặc /sign-up → về trang chủ
  if (isSignedIn && isAuthPage) {
    return <Navigate to={`/${MAIN_PATH.browse}`} replace />;
  }

  // 🔐 4. Nếu là trang auth (sign-in / sign-up) 
  if (isAuthPage) {
    return (
      <div className="w-full min-h-screen bg-black flex items-center justify-center">
        <Outlet />
      </div>
    );
  }

  // 🎬 5. Nếu đã đăng nhập → render app chính
  return (
    <div className="w-full min-h-screen bg-black px-0">
      <MainHeader />
      <Outlet />
      {!location.pathname.startsWith(`/${MAIN_PATH.watch}`) && <Footer />}
    </div>
  );
}
