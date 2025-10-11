// src/components/PlayerControlButton.tsx
import React from "react";

interface PlayerControlButtonProps {
  onClick?: () => void;
  children?: React.ReactNode;
  className?: string;
}

const PlayerControlButton: React.FC<PlayerControlButtonProps> = ({
  onClick,
  children,
  className,
}) => {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded bg-white text-black hover:bg-gray-200 ${className}`}
    >
      {children}
    </button>
  );
};

export default PlayerControlButton;
