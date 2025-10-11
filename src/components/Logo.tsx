import { Link } from "react-router-dom";
import { MAIN_PATH } from "src/constant";

interface LogoProps {
  className?: string;
}

export default function Logo({ className = "" }: LogoProps) {
  return (
    <Link to={`/${MAIN_PATH.browse}`}>
      <img
        src="/assets/netflix-logo.png"
        alt="Netflix Logo"
        className={`w-[87px] h-[25px] ${className}`}
      />
    </Link>
  );
}
