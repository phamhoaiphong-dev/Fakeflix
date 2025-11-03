import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { MAIN_PATH } from "src/constant";
import { Footer, MainHeader } from "src/components/layouts";

export default function MainLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const location = useLocation();

  if (!isLoaded) {
    return (
      <div className="w-full min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const isAuthPage = location.pathname === "/sign-in" || location.pathname === "/sign-up";

  // 1. Nếu chưa đăng nhập + không phải trang auth → redirect
  if (!isSignedIn && !isAuthPage) {
    return <Navigate to="/sign-in" replace />;
  }

  // 2. Nếu đã đăng nhập + đang ở trang auth → về trang chủ
  if (isSignedIn && isAuthPage) {
    return <Navigate to={`/${MAIN_PATH.browse}`} replace />;
  }

  // 3. Nếu là trang auth → chỉ render form (không có header, footer)
  if (isAuthPage) {
    return <Outlet />;
  }

  // 4. Nếu đã đăng nhập → render app chính
  return (
    <div className="w-full min-h-screen bg-black px-0">
      <MainHeader />
      <Outlet />
      {!location.pathname.startsWith(`/${MAIN_PATH.watch}`) && <Footer />}
    </div>
  );
}