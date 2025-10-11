import { Info } from "lucide-react";

interface MoreInfoButtonProps {
  onClick?: () => void;
  className?: string;
  children?: string;
}

export default function MoreInfoButton({
  onClick,
  className = "",
  children = "More Info",
}: MoreInfoButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center space-x-2
        px-2 sm:px-4 py-1 sm:py-2
        text-[18px] sm:text-[24px] md:text-[28px]
        font-bold
        capitalize
        whitespace-nowrap
        bg-[#6d6d6eb3]
        hover:bg-[#6d6d6e66]
        rounded
        ${className}
      `}
    >
      <Info className="w-6 h-6 sm:w-8 md:w-10" />
      <span>{children}</span>
    </button>
  );
}
