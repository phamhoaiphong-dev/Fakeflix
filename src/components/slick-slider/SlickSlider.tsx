import { useState, useRef } from "react";
import Slider from "react-slick";
import { motion } from "framer-motion";

import CustomNavigation from "./CustomNavigation"; // Tailwind version
import VideoItemWithHover from "src/components/VideoItemWithHover";
import NetflixNavigationLink from "src/components/NetflixNavigationLink";
import MotionContainer from "src/components/animate/MotionContainer";
import { varFadeIn } from "src/components/animate/variants/fade/FadeIn";
import { ARROW_MAX_WIDTH } from "src/constant";
import { KKPhimMovie } from "src/types/KKPhim";
import { KKCategory, KKCountry, PaginatedMovieResult } from "src/types/Types";

interface SlideItemProps {
  item: KKPhimMovie;
}

function SlideItem({ item }: SlideItemProps) {
  return (
    <div className="pr-2 sm:pr-4">
      <VideoItemWithHover video={item} />
    </div>
  );
}

interface SlickSliderProps {
  data: PaginatedMovieResult;
  genre: KKCategory | KKCountry;
  handleNext?: (page: number) => void;
}

export default function SlickSlider({ data, genre }: SlickSliderProps) {
  const sliderRef = useRef<Slider>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [showExplore, setShowExplore] = useState(false);
  const [isEnd, setIsEnd] = useState(false);

  const beforeChange = (currentIndex: number, nextIndex: number) => {
    setActiveSlideIndex(nextIndex);
    setIsEnd(nextIndex + 1 >= data.results.length);
  };

  const settings = {
    speed: 500,
    arrows: false,
    infinite: false,
    lazyLoad: "ondemand" as const,
    slidesToShow: 6,
    slidesToScroll: 6,
    beforeChange,
    responsive: [
      { breakpoint: 1536, settings: { slidesToShow: 5, slidesToScroll: 5 } },
      { breakpoint: 1200, settings: { slidesToShow: 4, slidesToScroll: 4 } },
      { breakpoint: 900, settings: { slidesToShow: 3, slidesToScroll: 3 } },
      { breakpoint: 600, settings: { slidesToShow: 2, slidesToScroll: 2 } },
    ],
  };

  const handlePrevious = () => sliderRef.current?.slickPrev();
  const handleNext = () => sliderRef.current?.slickNext();

  return (
    <div className="relative overflow-hidden w-full">
      {data.results.length > 0 && (
        <>
          <div className="flex items-center mb-2 pl-8 sm:pl-16 space-x-2">
            <NetflixNavigationLink
              to={`/genre/${genre._id || genre.name.toLowerCase().replace(" ", "_")}`}
              className="font-bold inline-block text-lg"
              onMouseOver={() => setShowExplore(true)}
              onMouseLeave={() => setShowExplore(false)}
            >
              {`${genre.name} Movies `}
              <MotionContainer open={showExplore} initial="initial" className="inline text-green-500">
                {"Explore All".split("").map((letter, index) => (
                  <motion.span key={index} variants={varFadeIn}>
                    {letter}
                  </motion.span>
                ))}
              </MotionContainer>
            </NetflixNavigationLink>
          </div>

          <CustomNavigation
            isEnd={isEnd}
            arrowWidth={ARROW_MAX_WIDTH}
            onNext={handleNext}
            onPrevious={handlePrevious}
            activeSlideIndex={activeSlideIndex}
          >
            <Slider ref={sliderRef} {...settings} className="overflow-visible" >
              {data.results
                .filter((i) => !!i.poster_url || !!i.thumb_url)
                .map((item) => (
                  <SlideItem key={item._id} item={item} />
                ))}
            </Slider>
          </CustomNavigation>
        </>
      )}
    </div>
  );
}
