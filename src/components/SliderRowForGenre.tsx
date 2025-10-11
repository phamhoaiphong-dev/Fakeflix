// src/components/SliderRowForGenre.tsx
import { useRef, useState } from "react";
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
    setShowLeftButton(scrollLeft > 0);
    setShowRightButton(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scroll = (dir: "left" | "right") => {
    if (!sliderRef.current) return;
    const { scrollLeft, clientWidth } = sliderRef.current;
    const scrollDistance = clientWidth * 0.8;
    const scrollTo =
      dir === "left" ? scrollLeft - scrollDistance : scrollLeft + scrollDistance;

    sliderRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
  };

  return (
    <div className="relative mb-8">
      <h2 className="text-white text-lg sm:text-xl font-semibold mb-4 px-4 sm:px-8">
        {title}
      </h2>

      <div className="group relative">
        {/* Left scroll button */}
        {showLeftButton && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-0 bottom-0 z-30 flex items-center justify-center
                       bg-gradient-to-r from-black/80 via-black/60 to-transparent w-16
                       opacity-0 group-hover:opacity-100 transition-opacity duration-300
                       hover:from-black/90"
            aria-label="Scroll left"
          >
            <ChevronLeft className="text-white w-8 h-8 ml-2" />
          </button>
        )}

        {/* Movie slider */}
        <div
          ref={sliderRef}
          onScroll={handleScroll}
          className="flex gap-6 overflow-x-auto overflow-y-visible scrollbar-hide scroll-smooth
                     pl-4 pr-4 sm:pl-8 sm:pr-8 pb-20 pt-4"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {movies.map((movie) => (
            <div key={movie._id} className="flex-shrink-0">
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>

        {/* Right scroll button */}
        {showRightButton && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-0 bottom-0 z-30 flex items-center justify-center
                       bg-gradient-to-l from-black/80 via-black/60 to-transparent w-16
                       opacity-0 group-hover:opacity-100 transition-opacity duration-300
                       hover:from-black/90"
            aria-label="Scroll right"
          >
            <ChevronRight className="text-white w-8 h-8 mr-2" />
          </button>
        )}
      </div>
    </div>
  );
}
