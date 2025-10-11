import { ReactNode } from "react";

interface MaturityRateProps {
  children: ReactNode;
}

export default function MaturityRate({ children }: MaturityRateProps) {
  return (
    <div className="flex items-center py-1 pl-3 pr-6 text-[22px] text-white border-l-[3px] border-gray-300 bg-gray-800/60">
      {children}
    </div>
  );
}
