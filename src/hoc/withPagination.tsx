import { ElementType, useCallback, useEffect } from "react";
import MainLoadingScreen from "src/components/MainLoadingScreen";
import { useAppDispatch, useAppSelector } from "src/hooks/redux";
import {
  initiateItem,
  useLazyGetVideosByMediaTypeAndGenreSlugQuery,
  useLazyGetVideosByMediaTypeAndCustomGenreQuery,
} from "src/store/slices/discover";
import { MEDIA_TYPE } from "src/types/Types";
import { KKPhimCategory } from "src/types/KKPhim";

interface WithPaginationProps {
  category?: KKPhimCategory; 
}

export default function withPagination(
  Component: ElementType,
  mediaType: MEDIA_TYPE,
  category?: KKPhimCategory
) {
  return function WithPagination() {
    const dispatch = useAppDispatch();
    const itemKey = category?._id ?? mediaType; 
    const mediaState = useAppSelector((state) => state.discover[mediaType]);
    const pageState = mediaState ? mediaState[itemKey] : undefined;

    const [getVideosByMediaTypeAndGenreSlug] =
      useLazyGetVideosByMediaTypeAndGenreSlugQuery();
    const [getVideosByMediaTypeAndCustomGenre] =
      useLazyGetVideosByMediaTypeAndCustomGenreQuery();

    useEffect(() => {
      if (!mediaState || !pageState) {
        dispatch(initiateItem({ mediaType, itemKey }));
      }
    }, [mediaState, pageState]);

    useEffect(() => {
      if (pageState && pageState.page === 0) {
        handleNext(pageState.page + 1);
      }
    }, [pageState]);

    const handleNext = useCallback(
      (page: number) => {
        if (category) {
          getVideosByMediaTypeAndGenreSlug({
            mediaType,
            genreSlug: category.slug,
            page,
          });
        } else {
          getVideosByMediaTypeAndCustomGenre({
            mediaType,
            apiString: mediaType,
            page,
          });
        }
      },
      [category, mediaType]
    );

    if (pageState) {
      return <Component category={category} data={pageState} handleNext={handleNext} />;
    }

    return <MainLoadingScreen />;
  };
}
