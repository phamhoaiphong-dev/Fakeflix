import { ReactNode, useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";

import { INITIAL_DETAIL_STATE } from "src/constant";
import createSafeContext from "src/lib/createSafeContext";
import { MEDIA_TYPE } from "src/types/Types";
import { KKPhimDetailResponse } from "src/types/KKPhim";
import { kkphimApi } from "src/store/slices/kkphim"; 

interface DetailType {
  id?: string; // slug
  mediaType?: MEDIA_TYPE;
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
    if (!!newDetailType.id && newDetailType.mediaType) {
      // gọi KKPhim detail
      const response = await fetch(
        `https://ophim1.com/api/v1/phim/${newDetailType.id}`
      ).then((res) => res.json());

      setDetail({ ...newDetailType, mediaDetail: response });
    } else {
      setDetail(INITIAL_DETAIL_STATE);
    }
  }, []);

  useEffect(() => {
    setDetail(INITIAL_DETAIL_STATE);
  }, [location.pathname]);

  return (
    <Provider value={{ detail, setDetailType: handleChangeDetail }}>
      {children}
    </Provider>
  );
}
