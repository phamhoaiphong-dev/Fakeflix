import { KKPhimMovie } from "src/types/KKPhim";

interface SimilarVideoCardProps { 
  video: KKPhimMovie;
}

export default function SimilarVideoCard({ video }: SimilarVideoCardProps) {
  return (
    <div
      className="flex-shrink-0 w-[28vw] sm:w-[18vw] md:w-[14vw] lg:w-[12vw] 
                 cursor-pointer transition-transform duration-300 
                 hover:scale-110 hover:z-10"
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] rounded-md overflow-hidden bg-gray-800">
        <img
          src={video.poster_url || video.thumb_url}
          alt={video.name}
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://via.placeholder.com/300x450/374151/ffffff?text=No+Image";
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </div>

      {/* Info */}
      <div className="mt-2">
        <p className="text-white text-sm font-medium truncate">
          {video.name}
        </p>
        {video.year && (
          <p className="text-gray-400 text-xs">{video.year}</p>
        )}
      </div>
    </div>
  );
}
