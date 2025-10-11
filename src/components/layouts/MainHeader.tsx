import { useState } from "react";
import useOffSetTop from "src/hooks/useOffSetTop";
import { APP_BAR_HEIGHT } from "src/constant";
import Logo from "../Logo";
import SearchBox from "../SearchBox";
import NetflixNavigationLink from "../NetflixNavigationLink";
import { Bell } from "lucide-react";
import { useLocation } from "react-router-dom";


const pages = ["Home", "Tv Shows", "Movies", "New & Popular", "My List"];

const MainHeader = () => {
  const isOffset = useOffSetTop(APP_BAR_HEIGHT);
  const [navOpen, setNavOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  
  const { pathname } = useLocation();
  const isWatchPage = pathname.startsWith("/watch");

  if (isWatchPage) return null;

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isOffset ? "bg-black shadow-md" : "bg-gradient-to-b from-black/80 to-transparent"
        }`}
      style={{ height: APP_BAR_HEIGHT }}
    >
      <div className="flex items-center justify-between px-6 sm:px-12 h-full">

        {/* Logo */}
        <div className="mr-6 cursor-pointer" onClick={() => window.location.reload()}>
          <Logo />
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <button
            onClick={() => setNavOpen(!navOpen)}
            className="text-white focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          {navOpen && (
            <div className="absolute top-full left-0 w-full bg-black shadow-md md:hidden">
              {pages.map((page) => (
                <button
                  key={page}
                  onClick={() => setNavOpen(false)}
                  className="block w-full text-left px-4 py-2 text-white hover:bg-gray-800"
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6 flex-1">
          {pages.map((page) => (
            <NetflixNavigationLink
              key={page}
              to=""
              className="text-white text-sm hover:text-gray-300"
            >
              {page}
            </NetflixNavigationLink>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-4 relative z-[50]">
          <SearchBox />

          {/* Notifications */}
          <button className="text-white hover:text-gray-300">
            <Bell size={22} />
          </button>

          {/* Avatar */}
          <div className="relative">
            <button
              onClick={() => setUserOpen(!userOpen)}
              className="focus:outline-none"
            >
              <img
                src="/avatar.png"
                alt="user_avatar"
                className="w-8 h-8 rounded"
              />
            </button>
            {userOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-black text-white shadow-lg rounded overflow-hidden z-50 text-sm">
                {["Manage Profiles", "Account", "Help Center", "Sign out"].map(
                  (item) => (
                    <button
                      key={item}
                      onClick={() => setUserOpen(false)}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-800"
                    >
                      {item}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default MainHeader;
