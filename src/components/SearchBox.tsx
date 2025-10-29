import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { searchMovies } from "src/services/netflixService";
import { useNavigate } from "react-router-dom";
import type { SearchParams } from "src/types/KKPhim";

export default function SearchBox() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setQuery("");
        setResults([]);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (query.trim().length > 1) {
        setIsLoading(true);
        try {
          // Tạo SearchParams object thay vì pass string
          const searchParams: SearchParams = {
            keyword: query,
            page: 1,
            limit: 20,
          };
          const data = await searchMovies(searchParams);
          setResults(data);
        } catch (error) {
          console.error("Search error:", error);
          setResults([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleSearchClick = () => {
    if (!isOpen) {
      setIsOpen(true);
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setIsOpen(false);
      setQuery("");
      setResults([]);
    }
  };

  const handleMovieClick = (movie: any) => {
    // Navigate to movie detail page
    navigate(`/watch/${movie.slug}`);
    setIsOpen(false);
    setQuery("");
    setResults([]);
  };

  //helper format poster url
  const formatPosterUrl = (url?: string) => {
    if (!url) return "https://via.placeholder.com/64x96?text=No+Image";
    if (url.startsWith("//")) return "https:" + url.replace("phimimg.com", "img.phimapi.com");
    if (url.includes("phimimg.com")) return url.replace("phimimg.com", "img.phimapi.com");
    if (!url.startsWith("http")) return "https://img.phimapi.com" + (url.startsWith("/") ? url : "/" + url);
    return url;
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/70 z-40 transition-opacity duration-300 " />
      )}

      <div ref={searchRef} className="relative flex items-center justify-end z-50">
        <div
          className={`
          flex items-center bg-black/60 border border-white/40 rounded-sm
          transition-all duration-300 ease-in-out overflow-hidden 
          ${isOpen ? "w-72" : "w-8 hover:bg-white/10 justify-center"}
        `}
          style={{ height: "32px" }}
        >
          {/* Icon button */}
          <button
            onClick={handleSearchClick}
            className={`
            flex items-center justify-center h-full text-white hover:text-gray-300 transition-colors
            ${isOpen ? "px-2" : "w-full"}
          `}
          >
            {isOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
          </button>

          {/* Search input */}
          <input
            ref={inputRef}
            type="text"
            placeholder="Titles, people, genres"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={`
            bg-transparent text-white text-sm placeholder-gray-400
            transition-all duration-300 ease-in-out
            outline-none
            ${isOpen ? "opacity-100 w-full px-2" : "opacity-0 w-0"}
          `}
          />
        </div>

        {/* Search results dropdown */}
        {isOpen && (
          <div className="absolute top-[40px] right-0 w-96 bg-black/95 border border-white/20 rounded-sm shadow-lg max-h-[70vh] overflow-y-auto z-[60]">
            {isLoading && (
              <div className="p-6 text-center text-gray-400 text-sm">
                Searching...
              </div>
            )}

            {!isLoading && query && results.length === 0 && (
              <div className="p-6 text-center text-gray-400 text-sm">
                No results found for "{query}"
              </div>
            )}

            {!isLoading && results.length > 0 && (
              <div className="overflow-y-auto max-h-[70vh] scrollbar-hide">
                {results.map((movie) => (
                  <div
                    key={movie._id}
                    onClick={() => handleMovieClick(movie)}
                    className="flex items-start gap-4 p-3 hover:bg-white/10 cursor-pointer transition-colors border-b border-white/10 last:border-b-0"
                  >
                    <img
                      src={formatPosterUrl(movie.poster_url)}
                      alt={movie.name}
                      className="w-16 h-24 object-cover rounded-sm flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://via.placeholder.com/64x96?text=No+Image";
                      }}
                    />

                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium text-sm truncate mb-1">
                        {movie.name}
                      </h3>
                      <p className="text-gray-400 text-xs mb-2">{movie.year}</p>
                      {movie.origin_name && (
                        <p className="text-gray-500 text-xs line-clamp-2">
                          {movie.origin_name}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoading && !query && (
              <div className="p-6 text-center text-gray-500 text-sm">
                Start typing to search...
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}