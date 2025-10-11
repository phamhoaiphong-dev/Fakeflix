import { forwardRef, ReactNode, ButtonHTMLAttributes } from "react";

interface NetflixIconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
}

const NetflixIconButton = forwardRef<HTMLButtonElement, NetflixIconButtonProps>(
  ({ children, className = "", ...props }, ref) => {
    return (
      <button
        ref={ref}
        {...props}
        className={`
          text-white
          border-2 border-gray-700
          hover:border-gray-200 focus:border-gray-200
          rounded
          ${className}
        `}
      >
        {children}
      </button>
    );
  }
);

export default NetflixIconButton;
