import { ReactNode, MouseEventHandler } from "react";

interface CustomNavigationProps {
  isEnd: boolean;
  arrowWidth: number;
  children: ReactNode;
  activeSlideIndex: number;
  onNext: MouseEventHandler<HTMLDivElement>;
  onPrevious: MouseEventHandler<HTMLDivElement>;
}

export default function CustomNavigation({
  isEnd,
  onNext,
  children,
  onPrevious,
  arrowWidth,
  activeSlideIndex,
}: CustomNavigationProps) {
  const arrowStyle = `absolute top-0 bottom-0 z-10 flex items-center justify-center 
  text-white opacity-0 group-hover:opacity-100 hover:bg-black/50 cursor-pointer hidden sm:flex 
  transition-opacity duration-300`;

  return (
    <div className="relative group">
      {/* Left Arrow */}
      {activeSlideIndex > 0 && (
        <div
          className={arrowStyle}
          style={{ left: 0, width: arrowWidth }}
          onClick={onPrevious}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </div>
      )}

      {/* Slider content */}
      {children}

      {/* Right Arrow */}
      {!isEnd && (
        <div
          className={arrowStyle}
          style={{ right: 0, width: arrowWidth }}
          onClick={onNext}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      )}

      {/* Gradient overlays */}
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-black/80 to-transparent pointer-events-none"></div>
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black/80 to-transparent pointer-events-none"></div>
    </div>
  );
}
