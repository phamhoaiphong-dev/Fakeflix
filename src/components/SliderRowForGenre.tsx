import { useEffect, useRef, useState } from "react";
import { KKPhimMovie } from "src/types/KKPhim";
import { ChevronLeft, ChevronRight } from "lucide-react";
import MovieCard from "./watch/MovieCard";

interface SliderRowForGenreProps {
  title: string;
  movies: KKPhimMovie[];
}

export default function SliderRowForGenre({ title, movies }: SliderRowForGenreProps) {
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(true);
  const sliderRef = useRef<HTMLDivElement>(null);

  if (!movies || movies.length === 0) return null;

  const handleScroll = () => {
    if (!sliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
    const tolerance = 5;
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
    const scrollDistance = clientWidth * 0.85;

    let scrollTo =
      dir === "left" ? scrollLeft - scrollDistance : scrollLeft + scrollDistance;

    scrollTo = Math.max(0, Math.min(scrollTo, scrollWidth - clientWidth));

    sliderRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
  };

  return (
    <div className="relative mb-6 pb-24">
      <h2 className="text-white text-base sm:text-lg md:text-xl font-bold mb-3 px-4 sm:px-8 md:px-12">
        {title}
      </h2>

      <div className="group relative">
        {/* Left scroll button - Netflix style */}
        {showLeftButton && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-0 bottom-0 z-[60] flex items-center justify-center
              bg-black/40 hover:bg-black/60 w-12 md:w-16
              opacity-0 group-hover:opacity-100 transition-all duration-300
              focus:outline-none backdrop-blur-sm"
            aria-label="Scroll left"
          >
            <ChevronLeft className="text-white w-10 h-10 md:w-12 md:h-12 drop-shadow-lg" strokeWidth={2.5} />
          </button>
        )}

        {/* Movie slider */}
        <div
          ref={sliderRef}
          onScroll={handleScroll}
          className="flex gap-2 sm:gap-3 md:gap-4 scrollbar-hide scroll-smooth px-4 sm:px-8 md:px-12 py-4"
          style={{
            overflowX: "auto",
            overflowY: "visible",
            // Removed scrollSnapType for smoother Netflix-like scrolling (optional: re-add if you want snapping)
            WebkitOverflowScrolling: "touch",
          }}
        >
          {movies.map((movie, index) => (
            <div
              key={movie._id}
              className="flex-shrink-0 w-[150px] sm:w-[180px] md:w-[220px]"
              style={{
                // Removed scrollSnapAlign for smoother Netflix-like scrolling (optional: re-add if you want snapping)
                // Add slight delay for animation based on position
                animationDelay: `${index * 0.05}s`
              }}
            >
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>

        {/* Right scroll button - Netflix style */}
        {showRightButton && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-0 bottom-0 z-[60] flex items-center justify-center
              bg-black/40 hover:bg-black/60 w-12 md:w-16
              opacity-0 group-hover:opacity-100 transition-all duration-300
              focus:outline-none backdrop-blur-sm"
            aria-label="Scroll right"
          >
            <ChevronRight className="text-white w-10 h-10 md:w-12 md:h-12 drop-shadow-lg" strokeWidth={2.5} />
          </button>
        )}
      </div>
    </div>
  );
}