// SliderRowForGenre.tsx
import { useEffect, useRef, useState } from "react";
import { KKPhimMovie } from "src/types/KKPhim";
import { ChevronLeft, ChevronRight } from "lucide-react";
import MovieCard from "./watch/MovieCard";

interface SliderRowForGenreProps {
  title: string;
  movies: KKPhimMovie[];
  variant?: "default" | "continue-watching";
}

export default function SliderRowForGenre({ title, movies ,variant ="default"}: SliderRowForGenreProps) {
  const isContinueWatching = variant === "continue-watching";
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(true);
  const sliderRef = useRef<HTMLDivElement>(null);

  if (!movies || movies.length === 0) return null;

  const handleScroll = () => {
    if (!sliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
    const tolerance = 1;
    setShowLeftButton(scrollLeft > tolerance);
    setShowRightButton(scrollLeft < scrollWidth - clientWidth - tolerance);
  };

  useEffect(() => {
    handleScroll();
    const handleResize = () => handleScroll();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [movies]);

  const scroll = (dir: "left" | "right") => {
    if (!sliderRef.current) return;
    const { scrollLeft, clientWidth, scrollWidth } = sliderRef.current;
    const scrollDistance = clientWidth * 0.9;

    let scrollTo =
      dir === "left" ? scrollLeft - scrollDistance : scrollLeft + scrollDistance;

    scrollTo = Math.max(0, Math.min(scrollTo, scrollWidth - clientWidth));

    sliderRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
  };

  return (
    <div className="relative mb-8 group/container">
      {/* Title */}
      <h2 className="text-white text-lg sm:text-xl md:text-2xl font-bold mb-4 px-4 sm:px-6 lg:px-12">
        {title}
      </h2>

      {/* WRAPPER CHO HOVER CARD TRÀN RA */}
      <div className="relative overflow-visible">
        {/* NÚT TRÁI */}
        {showLeftButton && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-0 bottom-0 z-40 w-16 sm:w-20 md:w-24 
                       flex items-center justify-center
                       bg-gradient-to-r from-black/80 via-black/50 to-transparent
                       opacity-0 group-hover/container:opacity-100 
                       transition-opacity duration-300 pointer-events-auto"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white drop-shadow-2xl" strokeWidth={3} />
          </button>
        )}

        {/* SLIDER – CHUẨN NETFLIX: KHÍT, ĐỀU, ĐẸP */}
        <div
          ref={sliderRef}
          onScroll={handleScroll}
          className="flex gap-1 sm:gap-1.5 md:gap-2 scrollbar-hide scroll-smooth py-4
             px-4
             overflow-x-auto overflow-y-hidden"
          style={{
            scrollSnapType: "x mandatory",
          }}
        >
          {movies.map((movie, index) => (
            <div
              key={movie._id}
              className="flex-shrink-0 
                 w-[145px] sm:w-[175px] md:w-[215px] lg:w-[245px]
                 scroll-snap-align-start"
              style={{
                animation: `fadeIn 0.6s ease-out ${index * 0.05}s both`,
              }}
            >
              <div className="relative hover:z-50">
                <MovieCard 
                  movie={movie as any}
                  showProgress={isContinueWatching}
                  large={isContinueWatching}
                />
              </div>
            </div>
          ))}
        </div>

        {/* NÚT PHẢI */}
        {showRightButton && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-0 bottom-0 z-40 w-16 sm:w-20 md:w-24 
                       flex items-center justify-center
                       bg-gradient-to-l from-black/80 via-black/50 to-transparent
                       opacity-0 group-hover/container:opacity-100 
                       transition-opacity duration-300 pointer-events-auto"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white drop-shadow-2xl" strokeWidth={3} />
          </button>
        )}
      </div>
    </div>
  );
}