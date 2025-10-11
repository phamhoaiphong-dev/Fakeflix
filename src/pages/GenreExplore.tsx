import { LoaderFunctionArgs, useLoaderData } from "react-router-dom";
import GridPage from "src/components/GridPage";
import { MEDIA_TYPE } from "src/types/Types";
import { KKPhimCategory } from "src/types/KKPhim";
import { getCategories } from "src/services/movieService"; 

// Loader lấy category theo slug
export async function loader({ params }: LoaderFunctionArgs) {
  const slug = params.genreId as string;

  // Lấy danh sách categories từ KKPhim
  const res = await getCategories();
  const categories: KKPhimCategory[] = res.data.items;

  // Tìm category theo slug
  const category = categories.find((c) => c.slug === slug);

  return category;
}

export default function GenreExplore() {
  const category = useLoaderData() as KKPhimCategory | undefined;

  if (!category) return null;

  return <GridPage mediaType={MEDIA_TYPE.PhimBo} genre={category} />;
}
