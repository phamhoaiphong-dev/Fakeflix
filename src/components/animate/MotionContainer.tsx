import { motion } from "framer-motion";
import type { ComponentProps } from "react";
import { varWrapBoth } from "./variants/Wrap";

interface MotionContainerProps extends ComponentProps<typeof motion.div> {
  open?: boolean;
}

export default function MotionContainer({
  open,
  children,
  className,
  ...other
}: MotionContainerProps) {
  return (
    <motion.div
      variants={varWrapBoth}
      initial={false}
      animate={open ? "animate" : "exit"}
      className={className}
      {...other}
    >
      {children}
    </motion.div>
  );
}
