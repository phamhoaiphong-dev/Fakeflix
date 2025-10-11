import { useGetMoviesByCategoryQuery } from "src/store/slices/kkphim";
import { KKPhimListResponse } from "src/types/KKPhim";

export function useSimilarVideos({
  categorySlug,
  countrySlug,
  year,
}: {
  categorySlug?: string;
  countrySlug?: string;
  year?: number;
}) {
  const { data, ...rest } = useGetMoviesByCategoryQuery(
    {
      categorySlug: categorySlug ?? "hanh-dong",
      params: {
        page: 1,
        country: countrySlug,
        year,
      },
    },
    { skip: !categorySlug }
  );

  return { data: data as KKPhimListResponse | undefined, ...rest };
}
