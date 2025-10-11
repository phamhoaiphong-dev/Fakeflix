import { ChangeEvent } from "react";
import { formatTime } from "src/utils/common";

interface PlayerSeekbarProps {
  playedSeconds: number;
  duration: number;
  seekTo: (value: number) => void;
}

export default function PlayerSeekbar({
  playedSeconds,
  duration,
  seekTo,
}: PlayerSeekbarProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    seekTo(Number(e.target.value));
  };

  const playedPercent = (playedSeconds / duration) * 100;

  return (
    <div className="relative w-full h-3 flex items-center">
      {/* Rail */}
      <div className="absolute w-full h-1 bg-white bg-opacity-80 rounded"></div>
      {/* Track */}
      <div
        className="absolute h-1 bg-red-600 rounded"
        style={{ width: `${playedPercent}%` }}
      ></div>
      {/* Thumb */}
      <input
        type="range"
        min={0}
        max={duration}
        value={playedSeconds}
        onChange={handleChange}
        className="w-full h-3 appearance-none bg-transparent cursor-pointer
          focus:outline-none
          [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-red-600 [&::-webkit-slider-thumb]:hover:scale-125 [&::-webkit-slider-thumb]:transition-transform
          [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-red-600 [&::-moz-range-thumb]:hover:scale-125 [&::-moz-range-thumb]:transition-transform
        "
      />
      {/* Time labels */}
      <div className="absolute right-0 top-5 text-xs text-white">
        {formatTime(playedSeconds)} / {formatTime(duration)}
      </div>
    </div>
  );
}
