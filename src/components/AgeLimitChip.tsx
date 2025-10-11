import { HTMLAttributes } from "react";

interface AgeLimitChipProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export default function AgeLimitChip({ children, className = "", ...props }: AgeLimitChipProps) {
  return (
    <div
      className={`border border-gray-400 rounded-none px-1 py-0.5 text-xs inline-block h-full ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
