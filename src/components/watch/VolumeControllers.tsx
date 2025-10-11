import { ChangeEvent } from "react";
import PlayerControlButton from "./PlayerControlButton";

interface VolumeControllersProps {
  value: number; // 0..1
  muted: boolean;
  handleVolume: (value: number) => void;
  handleVolumeToggle: React.MouseEventHandler<HTMLButtonElement>;
}

export default function VolumeControllers({
  value,
  muted,
  handleVolume,
  handleVolumeToggle,
}: VolumeControllersProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleVolume(Number(e.target.value) / 100);
  };

  return (
    <div className="flex items-center space-x-2 sm:space-x-4">
      <PlayerControlButton onClick={handleVolumeToggle}>
        {!muted ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5L6 9H2v6h4l5 4V5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.07 4.93a10 10 0 010 14.14" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5L6 9H2v6h4l5 4V5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M23 9l-6 6" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9l6 6" />
          </svg>
        )}
      </PlayerControlButton>

      <input
        type="range"
        min={0}
        max={100}
        value={muted ? 0 : value * 100}
        onChange={handleChange}
        className="h-1 w-24 sm:w-32 md:w-40 bg-white bg-opacity-50 rounded appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-red-600 [&::-webkit-slider-thumb]:hover:scale-125 [&::-webkit-slider-thumb]:transition-transform
          [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-red-600 [&::-moz-range-thumb]:hover:scale-125 [&::-moz-range-thumb]:transition-transform
        "
      />
    </div>
  );
}
