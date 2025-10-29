import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { countries } from "src/constant";
import { motion, AnimatePresence } from "framer-motion";

export default function DropdownCountry() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleSelect = (slug: string) => {
    setIsOpen(false);
    navigate(`/quoc-gia/${slug}`);
  };

  return (
    <div
      className="relative text-white text-sm"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button className="hover:text-gray-300 transition-colors">
        Quốc Gia ▾
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 mt-2 bg-black border border-gray-800 rounded-md shadow-xl w-44 py-2"
          >
            {countries.map((country) => (
              <li
                key={country.slug}
                onClick={() => handleSelect(country.slug)}
                className="px-4 py-2 hover:bg-gray-800 cursor-pointer text-sm"
              >
                {country.name}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
