import { Link as RouterLink, LinkProps as RouterLinkProps } from "react-router-dom";
import { ReactNode } from "react";

interface NetflixNavigationLinkProps extends RouterLinkProps {
  children: ReactNode;
  className?: string;
}

export default function NetflixNavigationLink({
  children,
  className = "",
  ...props
}: NetflixNavigationLinkProps) {
  return (
    <RouterLink
      {...props}
      className={`text-gray-900 no-underline hover:underline ${className}`}
    >
      {children}
    </RouterLink>
  );
}
