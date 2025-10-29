// src/providers/DetailModalProvider.tsx
import { ReactNode, useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import createSafeContext from "src/lib/createSafeContext";
import { MEDIA_TYPE } from "src/types/Types";
import { KKPhimDetailResponse } from "src/types/KKPhim";
import { INITIAL_DETAIL_STATE } from "src/constant";

interface DetailType {
  id?: string; // slug
}

export interface DetailModalConsumerProps {
  detail: { mediaDetail?: KKPhimDetailResponse } & DetailType;
  setDetailType: (newDetailType: DetailType) => void;
}

export const [useDetailModal, Provider] =
  createSafeContext<DetailModalConsumerProps>();

export default function DetailModalProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [detail, setDetail] = useState<{ mediaDetail?: KKPhimDetailResponse } & DetailType>(
    INITIAL_DETAIL_STATE
  );

  const handleChangeDetail = useCallback(async (newDetailType: DetailType) => {
    if (!!newDetailType.id) {
      const response = await fetch(`https://phimapi.com/api/v1/phim/${newDetailType.id}`).then((res) =>
        res.json()
      );
      setDetail({ ...newDetailType, mediaDetail: response });
    } else {
      setDetail(INITIAL_DETAIL_STATE);
    }
  }, []);

  useEffect(() => {
    setDetail(INITIAL_DETAIL_STATE);
  }, [location.pathname]);

  return <Provider value={{ detail, setDetailType: handleChangeDetail }}>{children}</Provider>;
}
