import { ReactNode, useState, useCallback } from "react";
import { KKPhimMovie} from "src/types/KKPhim";
import createSafeContext from "src/lib/createSafeContext";

export interface PortalConsumerProps {
  setPortal: (anchor: HTMLElement | null, video: KKPhimMovie | null) => void;
}
export interface PortalDataConsumerProps {
  anchorElement: HTMLElement | null;
  miniModalMediaData: KKPhimMovie | null;
}

export const [usePortal, Provider] =
  createSafeContext<PortalConsumerProps["setPortal"]>();

export const [usePortalData, PortalDataProvider] =
  createSafeContext<PortalDataConsumerProps>();

export default function PortalProvider({ children }: { children: ReactNode }) {
  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);
  const [miniModalMediaData, setMiniModalMediaData] = useState<KKPhimMovie | null>(
    null
  );

  const handleChangePortal = useCallback(
    (anchor: HTMLElement | null, video: KKPhimMovie | null) => {
      setAnchorElement(anchor);
      setMiniModalMediaData(video);
    },
    []
  );

  return (
    <Provider
      value={handleChangePortal}
    >
      <PortalDataProvider
        value={{
          anchorElement,
          miniModalMediaData,
        }}
      >
        {children}
      </PortalDataProvider>
    </Provider>
  );
}
