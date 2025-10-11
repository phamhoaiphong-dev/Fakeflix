import { forwardRef, ButtonHTMLAttributes, ReactNode } from "react";

interface PlayerControlButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

const PlayerControlButton = forwardRef<HTMLButtonElement, PlayerControlButtonProps>(
  ({ children, className = "", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`p-1 sm:p-2 transform transition-transform duration-300 hover:scale-125 ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

PlayerControlButton.displayName = "PlayerControlButton";

export default PlayerControlButton;
