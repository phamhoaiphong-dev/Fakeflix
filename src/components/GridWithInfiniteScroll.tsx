import { useRef, useEffect } from "react";
import VideoItemWithHover from "./VideoItemWithHover";
import { KKCategory, KKCountry, PaginatedMovieResult } from "src/types/Types";
import useIntersectionObserver from "src/hooks/useIntersectionObserver";

interface GridWithInfiniteScrollProps {
  genre: KKCategory | KKCountry;
  data: PaginatedMovieResult;
  handleNext: (page: number) => void;
}

export default function GridWithInfiniteScroll({
  genre,
  data,
  handleNext,
}: GridWithInfiniteScrollProps) {
  const intersectionRef = useRef<HTMLDivElement>(null);
  const intersection = useIntersectionObserver(intersectionRef);

  useEffect(() => {
    if (
      intersection &&
      intersection.intersectionRatio === 1 &&
      data.page < data.total_pages
    ) {
      handleNext(data.page + 1);
    }
  }, [intersection]);

  return (
    <>
      <div className="px-8 sm:px-16 pt-[150px] pb-16 bg-inherit max-w-full">
        <h2 className="text-2xl text-white mb-4">{`${genre.name} Movies`}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 z-10">
          {data.results
            .filter((v) => !!v.poster_url || !!v.thumb_url)
            .map((video, idx) => (
              <div key={`${video._id}_${idx}`} className="relative">
                <VideoItemWithHover video={video} />
              </div>
            ))}
        </div>
      </div>
      <div ref={intersectionRef} className="hidden" />
    </>
  );
}
