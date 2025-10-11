import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { createPortal } from "react-dom";

import VideoCardPortal from "./VideoCardPortal";
import MotionContainer from "./animate/MotionContainer";
import {
  varZoomIn,
  varZoomInLeft,
  varZoomInRight,
} from "./animate/variants/zoom/ZoomIn";
import { usePortalData } from "src/providers/PortalProvider";

export default function VideoPortalContainer() {
  const { miniModalMediaData, anchorElement } = usePortalData();
  const container = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const div = document.createElement("div");
    document.body.appendChild(div);
    container.current = div;

    return () => {
      if (div.parentNode) {
        div.parentNode.removeChild(div);
      }
    };
  }, []);

  const rect = anchorElement?.getBoundingClientRect();

  const hasToRender = !!miniModalMediaData && !!anchorElement;
  let isFirstElement = false;
  let isLastElement = false;
  let variant = varZoomIn;

  if (hasToRender) {
    const parentElement = anchorElement.closest(".slick-active");
    const nextSiblingOfParentElement = parentElement?.nextElementSibling;
    const previousSiblingOfParentElement =
      parentElement?.previousElementSibling;

    if (!previousSiblingOfParentElement?.classList.contains("slick-active")) {
      isFirstElement = true;
      variant = varZoomInLeft;
    } else if (!nextSiblingOfParentElement?.classList.contains("slick-active")) {
      isLastElement = true;
      variant = varZoomInRight;
    }
  }

  return (
    <>
      {hasToRender && container.current &&
        createPortal(
          <MotionContainer open={hasToRender} initial="initial">
            <motion.div
              variants={variant}
              style={{
                zIndex: 50,
                position: "absolute",
                display: "inline-block",
                ...(rect && {
                  top: rect.top + window.pageYOffset - 0.75 * rect.height,
                  ...(isLastElement
                    ? { right: document.documentElement.clientWidth - rect.right }
                    : { left: isFirstElement ? rect.left : rect.left - 0.25 * rect.width }),
                }),
              }}
            >
              <VideoCardPortal
                video={miniModalMediaData}
                anchorElement={anchorElement}
              />
            </motion.div>
          </MotionContainer>,
          container.current
        )
      }
    </>
  );
}
