import { Outlet, useLocation, useNavigate, useNavigation } from "react-router-dom";
import { SignedIn, SignedOut } from "@clerk/clerk-react";

import DetailModal from "src/components/DetailModal";
import VideoPortalContainer from "src/components/VideoPortalContainer";
import DetailModalProvider from "src/providers/DetailModalProvider";
import PortalProvider from "src/providers/PortalProvider";
import { MAIN_PATH } from "src/constant";
import { Footer, MainHeader } from "src/components/layouts";
import MainLoadingScreen from "src/components/MainLoadingScreen";
import { useEffect } from "react";

export default function MainLayout() {
  const location = useLocation();
  const navigation = useNavigation();
  const navigate = useNavigate();

  return (
    <>
      {/* Nếu đã đăng nhập, render toàn bộ giao diện Netflix */}
      <SignedIn>
        <div className="w-full min-h-screen bg-black px-0">
          <MainHeader />

          {/* Loading overlay khi chuyển route */}
          {navigation.state !== "idle" && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
              <MainLoadingScreen />
            </div>
          )}

          <DetailModalProvider>
            <DetailModal />
            <PortalProvider>
              <Outlet />
              <VideoPortalContainer />
            </PortalProvider>
          </DetailModalProvider>

          {!location.pathname.startsWith(`/${MAIN_PATH.watch}`) && <Footer />}
        </div>
      </SignedIn>

      {/* Nếu chưa đăng nhập, redirect về trang sign in của Clerk */}
      <SignedOut>
        <RedirectToLocalSignIn />
      </SignedOut>
    </>
  );
}

function RedirectToLocalSignIn() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/sign-in");
  }, [navigate]);
  return null; 
}