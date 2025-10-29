import { useNavigate } from "react-router-dom";
import {
  Volume2 as VolumeIcon,
  PlayCircle as PlayCircleIcon,
  Plus as AddIcon,
  ThumbsUp as ThumbUpIcon,
  ChevronDown as ExpandMoreIcon,
} from "lucide-react";
import { KKPhimMovie } from "src/types/KKPhim";
import { usePortal } from "src/providers/PortalProvider";
import { useDetailModal } from "src/providers/DetailModalProvider";
import { getRandomNumber } from "src/utils/common";
import NetflixIconButton from "./NetflixIconButton";
import MaxLineTypography from "./MaxLineTypography";
import AgeLimitChip from "./AgeLimitChip";
import QualityChip from "./QualityChip";
import GenreBreadcrumbs from "./GenreBreadcrumbs";
import { MAIN_PATH } from "src/constant";

interface VideoCardModalProps {
  video: KKPhimMovie;
  anchorElement: HTMLElement;
}

export default function VideoCardModal({
  video,
  anchorElement,
}: VideoCardModalProps) {
  const navigate = useNavigate();
  const setPortal = usePortal();
  const rect = anchorElement.getBoundingClientRect();
  const { setDetailType } = useDetailModal();

  const modalWidth = Math.min(400, Math.max(300, rect.width * 1.5));

  return (
    <div
      onPointerLeave={() => setPortal(null, null)}
      className="bg-gray-900 text-white rounded-lg shadow-2xl z-50 overflow-hidden"
      style={{ width: modalWidth }}
    >
      {/* Thumbnail */}
      <div className="relative w-full aspect-video bg-gray-800">
        <img
          src={video.backdrop_url || video.thumb_url || video.poster_url}
          alt={video.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 
              "https://via.placeholder.com/400x225/374151/ffffff?text=No+Image";
          }}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Title and Volume */}
        <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
          <MaxLineTypography maxLine={2} className="font-bold text-white text-lg flex-1 mr-3">
            {video.name}
          </MaxLineTypography>
          <NetflixIconButton className="flex-shrink-0">
            <VolumeIcon className="w-5 h-5" />
          </NetflixIconButton>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Action buttons */}
        <div className="flex items-center space-x-2">
          <NetflixIconButton
            className="p-1"
            onClick={() => navigate(`/${MAIN_PATH.watch}/${video.slug}`)}
          >
            <PlayCircleIcon className="w-8 h-8" />
          </NetflixIconButton>

          <NetflixIconButton className="p-2">
            <AddIcon className="w-4 h-4" />
          </NetflixIconButton>

          <NetflixIconButton className="p-2">
            <ThumbUpIcon className="w-4 h-4" />
          </NetflixIconButton>

          <div className="flex-grow" />

          <NetflixIconButton
            className="p-2"
            onClick={() =>
              setDetailType({
                id: video._id,
              })
            }
          >
            <ExpandMoreIcon className="w-4 h-4" />
          </NetflixIconButton>
        </div>

        {/* Extra info */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-green-500 text-sm font-medium">
            {`${getRandomNumber(100)}% Match`}
          </span>
          <AgeLimitChip>{`${getRandomNumber(20)}+`}</AgeLimitChip>
          <span className="text-gray-300 text-sm">
            {`${getRandomNumber(180)} min`}
          </span>
          <QualityChip>HD</QualityChip>
        </div>

        {/* Genres */}
        {video.category && video.category.length > 0 && (
          <GenreBreadcrumbs genres={video.category.map((cat) => cat.name)} />
        )}
      </div>
    </div>
  );
}