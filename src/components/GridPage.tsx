import withPagination from "src/hoc/withPagination";
import { MEDIA_TYPE, KKCategory, KKCountry } from "src/types/Types";
import GridWithInfiniteScroll from "./GridWithInfiniteScroll";

interface GridPageProps {
  genre: KKCategory | KKCountry;
  mediaType: MEDIA_TYPE;
}

export default function GridPage({ genre, mediaType }: GridPageProps) {
  const Component = withPagination(
    GridWithInfiniteScroll,
    mediaType,
    genre
  );
  return <Component />;
}
