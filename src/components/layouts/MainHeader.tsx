import { useState } from "react";
import useOffSetTop from "src/hooks/useOffSetTop";
import { APP_BAR_HEIGHT, MAIN_PATH } from "src/constant";
import Logo from "../Logo";
import SearchBox from "../SearchBox";
import NetflixNavigationLink from "../NetflixNavigationLink";
import { Bell } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import DropdownCountry from "../DropdownCountry";
import DropdownGenre from "../DropdownGenre";
import { useUser, useClerk } from "@clerk/clerk-react"; 

const MainHeader = () => {
  const isOffset = useOffSetTop(APP_BAR_HEIGHT);
  const [navOpen, setNavOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isWatchPage = pathname.startsWith("/watch");

  const { user, isSignedIn } = useUser(); 
  const { signOut } = useClerk();

  if (isWatchPage) return null;

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isOffset
          ? "bg-black shadow-md"
          : "bg-gradient-to-b from-black/80 to-transparent"
      }`}
      style={{ height: APP_BAR_HEIGHT }}
    >
      <div className="flex items-center justify-between px-6 sm:px-12 h-full">
        {/* Logo */}
        <div
          className="mr-6 cursor-pointer"
          onClick={() => {
            if (location.pathname === "/browse") {
              window.location.reload();
            } else {
              navigate("/browse");
            }
          }}
        >
          <Logo />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 flex-1">
          <NetflixNavigationLink
            to={`/${MAIN_PATH.featurefilm}`}
            className="text-white text-sm hover:text-gray-300"
          >
            Phim Lẻ
          </NetflixNavigationLink>

          <NetflixNavigationLink
            to={`/${MAIN_PATH.series}`}
            className="text-white text-sm hover:text-gray-300"
          >
            Phim Bộ
          </NetflixNavigationLink>

          <DropdownGenre />
          <DropdownCountry />

          <NetflixNavigationLink
            to="/danh-sach-yeu-thich"
            className="text-white text-sm hover:text-gray-300"
          >
            Danh Sách Yêu Thích
          </NetflixNavigationLink>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-4 relative z-[50]">
          <SearchBox />

          {/* Notifications */}
          <button className="text-white hover:text-gray-300">
            <Bell size={22} />
          </button>

          {/* Avatar dropdown */}
          {isSignedIn && (
            <div className="relative">
              <button
                onClick={() => setUserOpen(!userOpen)}
                className="focus:outline-none"
              >
                <img
                  src={user?.imageUrl || "/avatar.png"} 
                  alt="user_avatar"
                  className="w-8 h-8 rounded-md border border-gray-700"
                />
              </button>

              {userOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-black text-white shadow-lg rounded overflow-hidden z-50 text-sm">
                  <button
                    onClick={() => {
                      navigate("/account");
                      setUserOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-800"
                  >
                    Account
                  </button>

                  <button
                    onClick={() => {
                      signOut(); 
                      setUserOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-800"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default MainHeader;
