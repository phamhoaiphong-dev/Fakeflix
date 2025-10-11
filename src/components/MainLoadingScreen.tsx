export default function MainLoadingScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
      <div className="w-12 h-12 border-4 border-t-white border-b-white border-l-transparent border-r-transparent rounded-full animate-spin" />
    </div>
  );
}
