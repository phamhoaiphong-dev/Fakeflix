export default function Footer() {
  return (
    <footer className="bg-black text-gray-400 px-[60px] py-12">
      {/* Links grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-2 text-[13px] mb-8">
        <a href="#" className="hover:underline">FAQ</a>
        <a href="#" className="hover:underline">Help Center</a>
        <a href="#" className="hover:underline">Terms of Use</a>
        <a href="#" className="hover:underline">Privacy</a>
        <a href="#" className="hover:underline">Cookie Preferences</a>
        <a href="#" className="hover:underline">Corporate Information</a>
      </div>

      {/* Language selector */}
      <div className="mb-6">
        <select className="bg-black border border-gray-600 text-gray-400 text-[13px] px-2 py-1 rounded">
          <option>English</option>
          <option>Tiếng Việt</option>
        </select>
      </div>

      {/* Bottom note */}
      <p className="text-[11px] text-gray-500">
        © 2025 Goat-Aim — This is a Netflix Clone for educational purposes.
      </p>
    </footer>
  );
}
