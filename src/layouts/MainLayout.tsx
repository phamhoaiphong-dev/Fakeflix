import { Outlet, useLocation, useNavigation } from "react-router-dom";

import DetailModal from "src/components/DetailModal";
import VideoPortalContainer from "src/components/VideoPortalContainer";
import DetailModalProvider from "src/providers/DetailModalProvider";
import PortalProvider from "src/providers/PortalProvider";
import { MAIN_PATH } from "src/constant";
import { Footer, MainHeader } from "src/components/layouts";
import MainLoadingScreen from "src/components/MainLoadingScreen";

export default function MainLayout() {
  const location = useLocation();
  const navigation = useNavigation();

  return (
    <div className="w-full min-h-screen bg-black px-0">
      <MainHeader />
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
  );
}
