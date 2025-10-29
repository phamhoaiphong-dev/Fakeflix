import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface Genre {
  _id: string;
  name: string;
  slug: string;
}

export default function DropdownGenre() {
  const [isOpen, setIsOpen] = useState(false);
  const [genres, setGenres] = useState<Genre[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await fetch("https://phimapi.com/the-loai");
        const data = await res.json();

        if (Array.isArray(data)) {
          // 🧩 remove sensitive keywords
          const safeGenres = data.filter(
            (g) =>
              !/18|\+|sex|erotic|nude|adult|xxx|nsfw/i.test(g.name) &&
              !/18|\+|sex|erotic|nude|adult|xxx|nsfw/i.test(g.slug)
          );
          setGenres(safeGenres);
        }
      } catch (error) {
        console.error("Lỗi khi tải thể loại:", error);
      }
    };
    fetchGenres();
  }, []);

  const handleSelect = (slug: string) => {
    setIsOpen(false);
    navigate(`/the-loai/${slug}`);
  };

  return (
    <div
      className="relative text-white text-sm"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button className="hover:text-gray-300 transition-colors">
        Thể Loại ▾
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 mt-2 bg-black border border-gray-800 rounded-md shadow-xl py-3 px-4 w-[500px] z-50"
          >
            <ul
              className="grid grid-cols-3 gap-2 text-sm"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                overflowY: "hidden",
              }}
            >
              {genres.map((genre) => (
                <li
                  key={genre._id}
                  onClick={() => handleSelect(genre.slug)}
                  className="hover:bg-gray-800 px-3 py-1.5 rounded cursor-pointer text-gray-200 hover:text-white transition-colors"
                >
                  {genre.name}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
