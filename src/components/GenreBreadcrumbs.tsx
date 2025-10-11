interface GenreBreadcrumbsProps {
  genres: string[];
  className?: string;
}

export default function GenreBreadcrumbs({ genres, className = "" }: GenreBreadcrumbsProps) {
  return (
    <nav className={`flex items-center space-x-2 ${className}`} aria-label="breadcrumb">
      {genres.map((genre, idx) => (
        <span key={idx} className="flex items-center text-gray-200">
          <span className="text-white">{genre}</span>
          {idx < genres.length - 1 && (
            <span className="w-1 h-1 bg-gray-400 rounded-full mx-2 inline-block" />
          )}
        </span>
      ))}
    </nav>
  );
}
