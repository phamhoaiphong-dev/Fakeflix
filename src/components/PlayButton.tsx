import { Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MAIN_PATH } from "src/constant";

interface PlayButtonProps {
  className?: string;
  onClick?: () => void;
}

export default function PlayButton({ className = "", onClick }: PlayButtonProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={onClick ?? (() => navigate(`/${MAIN_PATH.watch}`))}
      className={`
        flex items-center space-x-2
        px-2 sm:px-4 py-1 sm:py-2
        text-[18px] sm:text-[24px] md:text-[28px]
        font-bold
        capitalize
        whitespace-nowrap
        bg-white text-black
        rounded
        hover:bg-gray-200
        ${className}
      `}
    >
      <Play className="w-6 h-6 sm:w-8 md:w-10" />
      <span>Play</span>
    </button>
  );
}
