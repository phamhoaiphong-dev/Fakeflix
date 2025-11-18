import { useMemo } from "react";
import type { KKPhimMovie } from "src/types/KKPhim";

const ALLOWED_COUNTRIES = [
  "au-my",
  "han-quoc",
  "nhat-ban",
  "trung-quoc",
  "phap",
  "an-do",
  "hong-kong",
  "thai-lan",
  "dai-loan",
];

interface UseCountryFilterOptions {
  enableFilter?: boolean;
  customAllowedCountries?: string[];
}

export function useCountryFilter(options: UseCountryFilterOptions = {}) {
  const {
    enableFilter = true,
    customAllowedCountries,
  } = options;

  const allowedCountries = customAllowedCountries || ALLOWED_COUNTRIES;

  const isAllowedCountry = (countrySlug: string): boolean => {
    return allowedCountries.includes(countrySlug);
  };

  const hasAllowedCountry = (movie: KKPhimMovie): boolean => {
    if (!movie.country || movie.country.length === 0) {
      return true;
    }
    return movie.country.some(c => 
      c.slug && allowedCountries.includes(c.slug)
    );
  };

  const filterMovies = useMemo(() => {
    return (movies: KKPhimMovie[]): KKPhimMovie[] => {
      if (!enableFilter) return movies;
      return movies.filter(movie => hasAllowedCountry(movie));
    };
  }, [enableFilter]);

  const countByCountry = (movies: KKPhimMovie[]): Record<string, number> => {
    const counts: Record<string, number> = {};
    movies.forEach(movie => {
      movie.country?.forEach(c => {
        if (c.slug && isAllowedCountry(c.slug)) {
          counts[c.slug] = (counts[c.slug] || 0) + 1;
        }
      });
    });
    return counts;
  };

  return {
    allowedCountries,
    isAllowedCountry,
    hasAllowedCountry,
    filterMovies,
    countByCountry,
  };
}

export { ALLOWED_COUNTRIES };