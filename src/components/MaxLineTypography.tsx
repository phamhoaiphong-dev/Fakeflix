import { forwardRef, ReactNode } from "react";

interface MaxLineTypographyProps {
  maxLine: number;
  children: ReactNode;
  className?: string;
}

const MaxLineTypography = forwardRef<HTMLDivElement, MaxLineTypographyProps>(
  ({ maxLine, children, className = "", ...others }, ref) => {
    return (
      <div
        ref={ref}
        className={`overflow-hidden text-ellipsis [display:-webkit-box] [-webkit-box-orient:vertical] line-clamp-${maxLine} ${className}`}
        {...others}
      >
        {children}
      </div>
    );
  }
);

export default MaxLineTypography;
