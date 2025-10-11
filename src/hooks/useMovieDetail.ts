import { useState, useEffect } from "react";
import { KKPhimDetailResponse } from "src/types/KKPhim";

interface UseMovieDetailResult {
  data: KKPhimDetailResponse | null;
  isLoading: boolean;
  error: Error | null;
}

export function useMovieDetail(slug?: string): UseMovieDetailResult {
  const [data, setData] = useState<KKPhimDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!slug || typeof slug !== "string") {
      setIsLoading(false);
      setData(null);
      return;
    }

    let isCancelled = false;

    const fetchDetail = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const url = `/api/phim/${encodeURIComponent(slug)}`;
        const response = await fetch(url);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }

        const result: KKPhimDetailResponse = await response.json();
        if (!isCancelled) setData(result);
      } catch (err) {
        if (!isCancelled)
          setError(err instanceof Error ? err : new Error("Failed to load movie"));
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    };

    fetchDetail();
    return () => {
      isCancelled = true;
    };
  }, [slug]);

  return { data, isLoading, error };
}

export function useRecommendMovies(categoryId?: string) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!categoryId) {
      setData([]);
      setIsLoading(false);
      return;
    }

    let isCancelled = false;

    const fetchSimilar = async () => {
      try {
        setIsLoading(true);
        const url = `https://phimapi.com/v1/api/the-loai/${categoryId}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Lỗi tải phim tương tự");
        const json = await res.json();
        if (!isCancelled) setData(json.items || []);
      } catch (err) {
        if (!isCancelled)
          setError(err instanceof Error ? err : new Error("Failed to fetch"));
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    };

    fetchSimilar();
    return () => {
      isCancelled = true;
    };
  }, [categoryId]);

  return { data, isLoading, error };
}
