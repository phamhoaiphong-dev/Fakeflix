import { ReactNode, HTMLAttributes } from "react";

interface QualityChipProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export default function QualityChip({ children, className = "", ...props }: QualityChipProps) {
  return (
    <div
      {...props}
      className={`
        border border-gray-400
        rounded-sm
        px-1.5 py-0.5
        text-xs
        h-full
        inline-flex items-center
        ${className}
      `}
    >
      {children}
    </div>
  );
}
