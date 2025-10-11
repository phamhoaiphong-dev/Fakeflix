import { Play, Info } from "lucide-react"; // dùng icon thay vì ký tự
import MaxLineTypography from "./MaxLineTypography";
import { KKPhimMovie } from "src/types/KKPhim";
import { useDetailModal } from "src/providers/DetailModalProvider";

interface HeroSectionProps {
  movie: KKPhimMovie;
}

export default function HeroSection({ movie }: HeroSectionProps) {
  const { setDetailType } = useDetailModal();
  if (!movie) return null;

  return (
    <div className="relative w-full h-screen md:h-[90vh]">
      {/* Background image */}
      <img
        src={movie.backdrop_url || movie.thumb_url || movie.poster_url}
        alt={movie.name}
        className="w-full h-full object-cover"
      />

      {/* Gradient overlay (Netflix style: left to right) */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

      {/* Info section */}
      <div className="absolute top-[30%] left-4 md:left-16 w-[90%] md:w-2/5 text-white space-y-4">
        {/* Title */}
        <h1 className="text-3xl md:text-6xl font-bold leading-tight break-words">
          {movie.name}
        </h1>
        {/* Description */}
        {movie.origin_name || movie.name ? (
          <MaxLineTypography maxLine={3}>
            <p className="text-sm md:text-lg text-gray-200">
              {movie.origin_name || movie.name}
            </p>
          </MaxLineTypography>
        ) : null}

        {/* Action buttons */}
        <div className="flex space-x-3 mt-4">
          {/* Play button (Netflix style) */}
          <button
            onClick={() => console.log("Play", movie.name)}
            className="flex items-center gap-2 bg-white text-black text-lg font-semibold px-6 py-2 rounded-md hover:bg-gray-200 transition"
          >
            <Play fill="black" size={24} /> Play
          </button>

          {/* More Info button (Netflix style) */}
          <button
            onClick={() => setDetailType({ id: movie._id })}
            className="flex items-center gap-2 bg-gray-700/70 text-white text-lg font-semibold px-6 py-2 rounded-md hover:bg-gray-600 transition"
          >
            <Info size={24} /> More Info
          </button>
        </div>
      </div>
    </div>
  );
}
